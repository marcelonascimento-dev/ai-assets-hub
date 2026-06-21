namespace AiAssetsHub.Application.Contracts.Catalog;

public interface IAssetService
{
    Task<AssetCreationResult> CreateAsync(Guid authorUserId, CreateAssetRequest request, CancellationToken cancellationToken = default);

    Task<AssetUpdateResult> UpdateAsync(Guid assetId, Guid requestingUserId, bool isAdmin, UpdateAssetRequest request, CancellationToken cancellationToken = default);

    Task<AssetDeleteResult> DeleteAsync(Guid assetId, Guid requestingUserId, bool isAdmin, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AssetSummaryResponse>> ListAsync(string? searchTerm, CancellationToken cancellationToken = default);

    Task<AssetDetailResponse?> GetByIdAsync(Guid assetId, CancellationToken cancellationToken = default);
}
