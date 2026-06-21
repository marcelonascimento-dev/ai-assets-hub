namespace AiAssetsHub.Application.Contracts.Identity;

public interface IAuthService
{
    Task<RegistrationResult> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

    Task<OperationResult> ConfirmEmailAsync(string token, CancellationToken cancellationToken = default);

    Task<OperationResult> RequestPasswordResetAsync(string email, CancellationToken cancellationToken = default);

    Task<OperationResult> ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken = default);
}
