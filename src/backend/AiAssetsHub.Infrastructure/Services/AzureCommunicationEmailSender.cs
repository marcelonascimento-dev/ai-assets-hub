using Azure;
using Azure.Communication.Email;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AiAssetsHub.Infrastructure.Services;

public sealed class AzureCommunicationEmailSender(
    IOptions<EmailDeliveryOptions> options,
    ILogger<AzureCommunicationEmailSender> logger) : IEmailSender
{
    private readonly EmailDeliveryOptions _options = options.Value;

    public Task SendEmailVerificationAsync(
        string recipientEmail,
        string verificationUrl,
        CancellationToken cancellationToken)
    {
        const string subject = "Confirme seu e-mail no AI Assets Hub";
        var text = $"""
            Bem-vindo ao AI Assets Hub.

            Confirme seu e-mail acessando o link:
            {verificationUrl}

            Se voce nao criou essa conta, ignore esta mensagem.
            """;
        var html = $"""
            <p>Bem-vindo ao <strong>AI Assets Hub</strong>.</p>
            <p>Confirme seu e-mail acessando o link abaixo:</p>
            <p><a href="{verificationUrl}">Confirmar e-mail</a></p>
            <p>Se voce nao criou essa conta, ignore esta mensagem.</p>
            """;

        return SendAsync(recipientEmail, subject, text, html, cancellationToken);
    }

    public Task SendPasswordResetAsync(
        string recipientEmail,
        string resetUrl,
        CancellationToken cancellationToken)
    {
        const string subject = "Redefina sua senha no AI Assets Hub";
        var text = $"""
            Recebemos uma solicitacao para redefinir sua senha.

            Acesse o link para criar uma nova senha:
            {resetUrl}

            Se voce nao solicitou a redefinicao, ignore esta mensagem.
            """;
        var html = $"""
            <p>Recebemos uma solicitacao para redefinir sua senha.</p>
            <p><a href="{resetUrl}">Criar nova senha</a></p>
            <p>Se voce nao solicitou a redefinicao, ignore esta mensagem.</p>
            """;

        return SendAsync(recipientEmail, subject, text, html, cancellationToken);
    }

    private async Task SendAsync(
        string recipientEmail,
        string subject,
        string plainText,
        string html,
        CancellationToken cancellationToken)
    {
        if (!_options.IsAzureCommunicationServices)
        {
            return;
        }

        var azureOptions = _options.AzureCommunicationServices;
        if (string.IsNullOrWhiteSpace(azureOptions.ConnectionString) ||
            string.IsNullOrWhiteSpace(azureOptions.SenderAddress))
        {
            logger.LogWarning("Azure email delivery is enabled but connection string or sender address is missing.");
            return;
        }

        var client = new EmailClient(azureOptions.ConnectionString);
        var message = new EmailMessage(
            senderAddress: azureOptions.SenderAddress,
            recipientAddress: recipientEmail,
            content: new EmailContent(subject)
            {
                PlainText = plainText,
                Html = html
            });

        await client.SendAsync(WaitUntil.Completed, message, cancellationToken);
    }
}
