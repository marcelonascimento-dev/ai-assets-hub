using System.ComponentModel.DataAnnotations;

namespace AiAssetsHub.Api.Models.Catalog;

public sealed class CreateAssetRequestModel
{
    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    [MinLength(20)]
    public string DetailedDescription { get; set; } = string.Empty;

    [Required]
    [StringLength(64)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(15)]
    public List<string> Tags { get; set; } = new();

    [StringLength(120)]
    public string? TeamName { get; set; }

    [Required]
    [StringLength(32)]
    public string Version { get; set; } = "1.0.0";

    [Required]
    [StringLength(32)]
    public string InstallType { get; set; } = "Manual";

    [StringLength(4000)]
    public string? InstallNotes { get; set; }
}
