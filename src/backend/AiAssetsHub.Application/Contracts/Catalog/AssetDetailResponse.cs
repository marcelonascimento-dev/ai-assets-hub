namespace AiAssetsHub.Application.Contracts.Catalog;

public sealed record AssetDetailResponse(
    Guid Id,
    string Name,
    string Slug,
    string ShortDescription,
    string DetailedDescription,
    string Category,
    IReadOnlyList<string> Tags,
    string? TeamName,
    string Version,
    string InstallType,
    string? InstallNotes,
    Guid AuthorUserId,
    string AuthorFullName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
