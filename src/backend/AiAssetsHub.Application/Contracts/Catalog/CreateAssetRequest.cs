namespace AiAssetsHub.Application.Contracts.Catalog;

public sealed record CreateAssetRequest(
    string Name,
    string ShortDescription,
    string DetailedDescription,
    string Category,
    IReadOnlyList<string> Tags,
    string? TeamName,
    string Version,
    string InstallType,
    string? InstallNotes);
