namespace AiAssetsHub.Application.Contracts.Identity;

public sealed record RegisterUserRequest(
    string FullName,
    string Email,
    string Password);
