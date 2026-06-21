namespace AiAssetsHub.Application.Contracts.Identity;

public sealed record AuthResult(
    bool Succeeded,
    AuthFailureReason FailureReason,
    string? ErrorMessage,
    AuthResponse? Response);
