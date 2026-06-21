namespace AiAssetsHub.Infrastructure.Persistence.Seeding;

public sealed class InitialContributorOptions
{
    public const string SectionName = "Seed:InitialContributor";

    public bool Enabled { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
