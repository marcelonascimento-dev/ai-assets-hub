namespace AiAssetsHub.Domain.Catalog;

public static class AssetInstallTypes
{
    public const string Automatic = "Automatic";
    public const string Assisted = "Assisted";
    public const string Manual = "Manual";

    public static readonly string[] All =
    [
        Automatic,
        Assisted,
        Manual
    ];
}
