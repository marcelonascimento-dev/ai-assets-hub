namespace AiAssetsHub.Application.Contracts.Identity;

public sealed record RegistrationResponse(
    string Email,
    string Message,
    string? EmailVerificationUrl);
