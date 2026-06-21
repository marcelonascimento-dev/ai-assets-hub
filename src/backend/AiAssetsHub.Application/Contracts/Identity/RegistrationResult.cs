namespace AiAssetsHub.Application.Contracts.Identity;

public sealed record RegistrationResult(
    bool Succeeded,
    AuthFailureReason FailureReason,
    string? ErrorMessage,
    RegistrationResponse? Response);
