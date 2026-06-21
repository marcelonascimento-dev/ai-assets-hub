namespace AiAssetsHub.Application.Contracts.Identity;

public sealed record OperationResult(
    bool Succeeded,
    AuthFailureReason FailureReason,
    string Message,
    string? ActionUrl);
