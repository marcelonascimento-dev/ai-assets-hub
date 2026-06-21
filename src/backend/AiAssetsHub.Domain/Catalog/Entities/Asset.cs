using AiAssetsHub.Domain.Identity.Entities;

namespace AiAssetsHub.Domain.Catalog.Entities;

public sealed class Asset
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string ShortDescription { get; set; } = string.Empty;

    public string DetailedDescription { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public List<string> Tags { get; set; } = new();

    public string? TeamName { get; set; }

    public string Version { get; set; } = "1.0.0";

    public string InstallType { get; set; } = AssetInstallTypes.Manual;

    public string? InstallNotes { get; set; }

    public Guid AuthorUserId { get; set; }

    public User AuthorUser { get; set; } = null!;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
