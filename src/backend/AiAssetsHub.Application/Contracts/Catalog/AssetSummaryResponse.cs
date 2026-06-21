namespace AiAssetsHub.Application.Contracts.Catalog;

public sealed record AssetSummaryResponse(
    Guid Id,
    string Name,
    string Slug,
    string ShortDescription,
    string Category,
    IReadOnlyList<string> Tags,
    string? TeamName,
    string Version,
    string InstallType,
    string AuthorFullName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
