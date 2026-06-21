using AiAssetsHub.Application.Contracts.Catalog;
using AiAssetsHub.Domain.Catalog;
using AiAssetsHub.Domain.Catalog.Entities;
using AiAssetsHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AiAssetsHub.Infrastructure.Services;

public sealed class AssetService(AiAssetsHubDbContext dbContext) : IAssetService
{
    public async Task<AssetCreationResult> CreateAsync(Guid authorUserId, CreateAssetRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedCategory = NormalizeCategory(request.Category);
        if (normalizedCategory is null)
        {
            return new AssetCreationResult(false, AssetCreationFailureReason.InvalidCategory, "Category is invalid.", null);
        }

        var normalizedInstallType = NormalizeInstallType(request.InstallType);
        if (normalizedInstallType is null)
        {
            return new AssetCreationResult(false, AssetCreationFailureReason.InvalidCategory, "Install type is invalid.", null);
        }

        var author = await dbContext.Users
            .SingleOrDefaultAsync(user => user.Id == authorUserId, cancellationToken);

        if (author is null)
        {
            return new AssetCreationResult(false, AssetCreationFailureReason.AuthorNotFound, "Author was not found.", null);
        }

        var slug = SlugGenerator.Generate(request.Name);
        var duplicateSlugExists = await dbContext.Assets
            .AnyAsync(asset => asset.Slug == slug, cancellationToken);

        if (duplicateSlugExists)
        {
            return new AssetCreationResult(false, AssetCreationFailureReason.DuplicateSlug, "An asset with the same generated slug already exists.", null);
        }

        var tags = NormalizeTags(request.Tags);
        var version = string.IsNullOrWhiteSpace(request.Version) ? "1.0.0" : request.Version.Trim();
        var teamName = string.IsNullOrWhiteSpace(request.TeamName) ? null : request.TeamName.Trim();
        var installNotes = string.IsNullOrWhiteSpace(request.InstallNotes) ? null : request.InstallNotes.Trim();

        var now = DateTimeOffset.UtcNow;
        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Slug = slug,
            ShortDescription = request.ShortDescription.Trim(),
            DetailedDescription = request.DetailedDescription.Trim(),
            Category = normalizedCategory,
            Tags = tags,
            TeamName = teamName,
            Version = version,
            InstallType = normalizedInstallType,
            InstallNotes = installNotes,
            AuthorUserId = authorUserId,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Assets.Add(asset);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AssetCreationResult(true, AssetCreationFailureReason.None, null, MapDetail(asset, author.FullName));
    }

    public async Task<AssetUpdateResult> UpdateAsync(Guid assetId, Guid requestingUserId, bool isAdmin, UpdateAssetRequest request, CancellationToken cancellationToken = default)
    {
        var asset = await dbContext.Assets
            .Include(a => a.AuthorUser)
            .SingleOrDefaultAsync(a => a.Id == assetId, cancellationToken);

        if (asset is null)
            return new AssetUpdateResult(false, AssetUpdateFailureReason.NotFound, "Asset not found.", null);

        if (asset.AuthorUserId != requestingUserId && !isAdmin)
            return new AssetUpdateResult(false, AssetUpdateFailureReason.Forbidden, "You can only edit your own assets.", null);

        var normalizedCategory = NormalizeCategory(request.Category);
        if (normalizedCategory is null)
            return new AssetUpdateResult(false, AssetUpdateFailureReason.InvalidCategory, "Category is invalid.", null);

        var normalizedInstallType = NormalizeInstallType(request.InstallType);
        if (normalizedInstallType is null)
            return new AssetUpdateResult(false, AssetUpdateFailureReason.InvalidCategory, "Install type is invalid.", null);

        var newSlug = SlugGenerator.Generate(request.Name);
        if (newSlug != asset.Slug)
        {
            var duplicateSlugExists = await dbContext.Assets
                .AnyAsync(a => a.Slug == newSlug && a.Id != assetId, cancellationToken);
            if (duplicateSlugExists)
                return new AssetUpdateResult(false, AssetUpdateFailureReason.DuplicateSlug, "An asset with the same generated slug already exists.", null);
            asset.Slug = newSlug;
        }

        asset.Name = request.Name.Trim();
        asset.ShortDescription = request.ShortDescription.Trim();
        asset.DetailedDescription = request.DetailedDescription.Trim();
        asset.Category = normalizedCategory;
        asset.Version = string.IsNullOrWhiteSpace(request.Version) ? "1.0.0" : request.Version.Trim();
        asset.InstallType = normalizedInstallType;
        asset.InstallNotes = string.IsNullOrWhiteSpace(request.InstallNotes) ? null : request.InstallNotes.Trim();
        asset.UpdatedAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new AssetUpdateResult(true, AssetUpdateFailureReason.None, null, MapDetail(asset, asset.AuthorUser.FullName));
    }

    public async Task<AssetDeleteResult> DeleteAsync(Guid assetId, Guid requestingUserId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var asset = await dbContext.Assets
            .SingleOrDefaultAsync(a => a.Id == assetId, cancellationToken);

        if (asset is null)
            return new AssetDeleteResult(false, AssetDeleteFailureReason.NotFound, "Asset not found.");

        if (asset.AuthorUserId != requestingUserId && !isAdmin)
            return new AssetDeleteResult(false, AssetDeleteFailureReason.Forbidden, "You can only delete your own assets.");

        dbContext.Assets.Remove(asset);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AssetDeleteResult(true, AssetDeleteFailureReason.None, null);
    }

    public async Task<IReadOnlyList<AssetSummaryResponse>> ListAsync(string? searchTerm, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Assets
            .AsNoTracking()
            .Include(asset => asset.AuthorUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var trimmed = searchTerm.Trim();
            var pattern = $"%{trimmed}%";
            query = query.Where(asset =>
                EF.Functions.ILike(asset.Name, pattern) ||
                EF.Functions.ILike(asset.ShortDescription, pattern) ||
                EF.Functions.ILike(asset.DetailedDescription, pattern) ||
                EF.Functions.ILike(asset.AuthorUser.FullName, pattern) ||
                (asset.TeamName != null && EF.Functions.ILike(asset.TeamName, pattern)) ||
                asset.Tags.Any(tag => EF.Functions.ILike(tag, pattern)));
        }

        return await query
            .OrderByDescending(asset => asset.CreatedAt)
            .Select(asset => new AssetSummaryResponse(
                asset.Id,
                asset.Name,
                asset.Slug,
                asset.ShortDescription,
                asset.Category,
                asset.Tags,
                asset.TeamName,
                asset.Version,
                asset.InstallType,
                asset.AuthorUser.FullName,
                asset.CreatedAt,
                asset.UpdatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<AssetDetailResponse?> GetByIdAsync(Guid assetId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Assets
            .AsNoTracking()
            .Include(asset => asset.AuthorUser)
            .Where(asset => asset.Id == assetId)
            .Select(asset => new AssetDetailResponse(
                asset.Id,
                asset.Name,
                asset.Slug,
                asset.ShortDescription,
                asset.DetailedDescription,
                asset.Category,
                asset.Tags,
                asset.TeamName,
                asset.Version,
                asset.InstallType,
                asset.InstallNotes,
                asset.AuthorUserId,
                asset.AuthorUser.FullName,
                asset.CreatedAt,
                asset.UpdatedAt))
            .SingleOrDefaultAsync(cancellationToken);
    }

    private static string? NormalizeCategory(string category)
    {
        return AssetCategories.All.SingleOrDefault(existing =>
            string.Equals(existing, category.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    private static string? NormalizeInstallType(string installType)
    {
        return AssetInstallTypes.All.SingleOrDefault(existing =>
            string.Equals(existing, installType.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    private static List<string> NormalizeTags(IReadOnlyList<string> tags)
    {
        return tags
            .Select(tag => tag?.Trim() ?? string.Empty)
            .Where(tag => !string.IsNullOrEmpty(tag))
            .Select(tag => tag.ToLowerInvariant())
            .Distinct()
            .Take(15)
            .ToList();
    }

    private static AssetDetailResponse MapDetail(Asset asset, string authorFullName) =>
        new(
            asset.Id,
            asset.Name,
            asset.Slug,
            asset.ShortDescription,
            asset.DetailedDescription,
            asset.Category,
            asset.Tags,
            asset.TeamName,
            asset.Version,
            asset.InstallType,
            asset.InstallNotes,
            asset.AuthorUserId,
            authorFullName,
            asset.CreatedAt,
            asset.UpdatedAt);
}
