namespace AiAssetsHub.Application.Contracts.Identity;

public sealed record AuthResponse(
    Guid UserId,
    string FullName,
    string Email,
    IReadOnlyList<string> Roles,
    string AccessToken,
    DateTimeOffset ExpiresAt);
