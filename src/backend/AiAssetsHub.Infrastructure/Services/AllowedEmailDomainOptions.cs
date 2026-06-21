namespace AiAssetsHub.Infrastructure.Services;

public sealed class AllowedEmailDomainOptions
{
    public const string SectionName = "AllowedEmailDomains";

    public string[] Domains { get; set; } = [];
}
