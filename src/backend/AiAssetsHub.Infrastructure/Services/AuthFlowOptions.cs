namespace AiAssetsHub.Infrastructure.Services;

public sealed class AuthFlowOptions
{
    public const string SectionName = "AuthFlows";

    public string FrontendBaseUrl { get; set; } = "http://localhost:3000";

    public bool ExposeActionUrlsInApi { get; set; }

    public int EmailVerificationExpirationHours { get; set; } = 24;

    public int PasswordResetExpirationMinutes { get; set; } = 30;
}
