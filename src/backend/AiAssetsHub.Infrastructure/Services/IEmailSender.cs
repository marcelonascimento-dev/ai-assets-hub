namespace AiAssetsHub.Infrastructure.Services;

public interface IEmailSender
{
    Task SendEmailVerificationAsync(string recipientEmail, string verificationUrl, CancellationToken cancellationToken);

    Task SendPasswordResetAsync(string recipientEmail, string resetUrl, CancellationToken cancellationToken);
}
