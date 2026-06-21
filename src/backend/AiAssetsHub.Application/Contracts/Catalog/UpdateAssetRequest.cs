namespace AiAssetsHub.Application.Contracts.Catalog;

public sealed record UpdateAssetRequest(
    string Name,
    string ShortDescription,
    string DetailedDescription,
    string Category,
    string Version,
    string InstallType,
    string? InstallNotes);
