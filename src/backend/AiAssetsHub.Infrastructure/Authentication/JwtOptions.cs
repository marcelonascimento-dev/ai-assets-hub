namespace AiAssetsHub.Infrastructure.Authentication;

public sealed class JwtOptions
{
    public const string SectionName = "Authentication:Jwt";

    public string Issuer { get; set; } = "AiAssetsHub";

    public string Audience { get; set; } = "AiAssetsHub.Client";

    public string SigningKey { get; set; } = string.Empty;

    public int ExpirationMinutes { get; set; } = 120;
}
