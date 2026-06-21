using System.Security.Cryptography;
using System.Text;
using AiAssetsHub.Application.Contracts.Identity;
using AiAssetsHub.Domain.Identity.Entities;
using AiAssetsHub.Infrastructure.Authentication;
using AiAssetsHub.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AiAssetsHub.Infrastructure.Services;

public sealed class AuthService(
    AiAssetsHubDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator,
    IEmailSender emailSender,
    IOptions<AllowedEmailDomainOptions> allowedDomainOptions,
    IOptions<AuthFlowOptions> authFlowOptions,
    IOptions<AdminEmailsOptions> adminEmailsOptions) : IAuthService
{
    private readonly AuthFlowOptions _authFlowOptions = authFlowOptions.Value;
    private readonly HashSet<string> _adminEmails = new(
        (adminEmailsOptions.Value.Emails ?? Array.Empty<string>())
            .Where(e => !string.IsNullOrWhiteSpace(e))
            .Select(e => e.Trim().ToLowerInvariant()),
        StringComparer.OrdinalIgnoreCase);
    private readonly string[] _allowedDomains = allowedDomainOptions.Value.Domains
        .Where(domain => !string.IsNullOrWhiteSpace(domain))
        .Select(domain => domain.Trim().ToLowerInvariant())
        .Distinct(StringComparer.Ordinal)
        .ToArray();

    public async Task<RegistrationResult> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(request.Email);

        if (!IsAllowedDomain(normalizedEmail))
        {
            return new RegistrationResult(
                false,
                AuthFailureReason.EmailDomainNotAllowed,
                "Use um e-mail corporativo permitido.",
                null);
        }

        var emailAlreadyRegistered = await dbContext.Users
            .AnyAsync(user => user.Email == normalizedEmail, cancellationToken);

        if (emailAlreadyRegistered)
        {
            return new RegistrationResult(
                false,
                AuthFailureReason.EmailAlreadyRegistered,
                "Este e-mail ja possui cadastro. Entre com sua senha ou use a recuperacao de senha.",
                null);
        }

        var now = DateTimeOffset.UtcNow;
        var userRole = await dbContext.Roles.SingleAsync(role => role.NormalizedName == "USER", cancellationToken);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            CreatedAt = now,
            UpdatedAt = now
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        user.Roles.Add(userRole);

        dbContext.Users.Add(user);
        var verificationToken = CreateEmailVerificationToken(user.Id, now);
        dbContext.EmailVerificationTokens.Add(verificationToken.Entity);

        await dbContext.SaveChangesAsync(cancellationToken);

        var verificationUrl = BuildActionUrl("verify-email", verificationToken.RawToken);
        await emailSender.SendEmailVerificationAsync(normalizedEmail, verificationUrl, cancellationToken);

        var response = new RegistrationResponse(
            normalizedEmail,
            "Conta criada. Verifique seu e-mail para ativar o acesso.",
            ExposeActionUrl(verificationUrl));

        return new RegistrationResult(true, AuthFailureReason.None, null, response);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(request.Email);

        var user = await dbContext.Users
            .Include(entity => entity.Roles)
            .SingleOrDefaultAsync(entity => entity.Email == normalizedEmail, cancellationToken);

        if (user is null)
        {
            return new AuthResult(false, AuthFailureReason.InvalidCredentials, "E-mail ou senha incorretos.", null);
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return new AuthResult(false, AuthFailureReason.InvalidCredentials, "E-mail ou senha incorretos.", null);
        }

        if (user.EmailConfirmedAt is null)
        {
            return new AuthResult(
                false,
                AuthFailureReason.EmailNotConfirmed,
                "Confirme seu e-mail antes de entrar. Se nao recebeu a mensagem, use a recuperacao de senha ou solicite um novo link.",
                null);
        }

        if (_adminEmails.Contains(user.Email))
        {
            await EnsureRoleAsync(user, "ADMIN", cancellationToken);
        }

        user.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = jwtTokenGenerator.Generate(user);
        return new AuthResult(true, AuthFailureReason.None, null, response);
    }

    public async Task<OperationResult> ConfirmEmailAsync(string token, CancellationToken cancellationToken = default)
    {
        var tokenHash = HashToken(token);
        var now = DateTimeOffset.UtcNow;

        var storedToken = await dbContext.EmailVerificationTokens
            .Include(entity => entity.User)
            .SingleOrDefaultAsync(entity => entity.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || storedToken.ConsumedAt is not null || storedToken.ExpiresAt < now)
        {
            return new OperationResult(
                false,
                AuthFailureReason.InvalidOrExpiredToken,
                "O link de verificacao expirou ou ja foi usado.",
                null);
        }

        storedToken.ConsumedAt = now;
        storedToken.User.EmailConfirmedAt ??= now;
        storedToken.User.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new OperationResult(
            true,
            AuthFailureReason.None,
            "E-mail confirmado. Agora voce ja pode entrar.",
            null);
    }

    public async Task<OperationResult> RequestPasswordResetAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(email);
        var user = await dbContext.Users
            .SingleOrDefaultAsync(entity => entity.Email == normalizedEmail, cancellationToken);

        const string genericMessage = "Se o e-mail estiver cadastrado, enviaremos um link de redefinicao de senha.";
        if (user is null)
        {
            return new OperationResult(true, AuthFailureReason.None, genericMessage, null);
        }

        var now = DateTimeOffset.UtcNow;
        var resetToken = CreatePasswordResetToken(user.Id, now);
        dbContext.PasswordResetTokens.Add(resetToken.Entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        var resetUrl = BuildActionUrl("reset-password", resetToken.RawToken);
        await emailSender.SendPasswordResetAsync(normalizedEmail, resetUrl, cancellationToken);

        return new OperationResult(
            true,
            AuthFailureReason.None,
            genericMessage,
            ExposeActionUrl(resetUrl));
    }

    public async Task<OperationResult> ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken = default)
    {
        var tokenHash = HashToken(token);
        var now = DateTimeOffset.UtcNow;

        var storedToken = await dbContext.PasswordResetTokens
            .Include(entity => entity.User)
            .SingleOrDefaultAsync(entity => entity.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || storedToken.ConsumedAt is not null || storedToken.ExpiresAt < now)
        {
            return new OperationResult(
                false,
                AuthFailureReason.InvalidOrExpiredToken,
                "O link de redefinicao expirou ou ja foi usado.",
                null);
        }

        storedToken.ConsumedAt = now;
        storedToken.User.PasswordHash = passwordHasher.HashPassword(storedToken.User, newPassword);
        storedToken.User.EmailConfirmedAt ??= now;
        storedToken.User.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new OperationResult(
            true,
            AuthFailureReason.None,
            "Senha redefinida. Voce ja pode entrar com a nova senha.",
            null);
    }

    private bool IsAllowedDomain(string email)
    {
        if (_allowedDomains.Length == 0)
        {
            return false;
        }

        var domain = email.Split('@').LastOrDefault();
        return domain is not null && _allowedDomains.Contains(domain, StringComparer.Ordinal);
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private async Task EnsureRoleAsync(User user, string normalizedRoleName, CancellationToken cancellationToken)
    {
        if (user.Roles.Any(r => r.NormalizedName == normalizedRoleName))
            return;

        var role = await dbContext.Roles
            .SingleOrDefaultAsync(r => r.NormalizedName == normalizedRoleName, cancellationToken);

        if (role is not null)
            user.Roles.Add(role);
    }

    private TokenEnvelope<EmailVerificationToken> CreateEmailVerificationToken(Guid userId, DateTimeOffset now)
    {
        var rawToken = CreateRawToken();
        return new TokenEnvelope<EmailVerificationToken>(
            rawToken,
            new EmailVerificationToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TokenHash = HashToken(rawToken),
                CreatedAt = now,
                ExpiresAt = now.AddHours(Math.Max(1, _authFlowOptions.EmailVerificationExpirationHours))
            });
    }

    private TokenEnvelope<PasswordResetToken> CreatePasswordResetToken(Guid userId, DateTimeOffset now)
    {
        var rawToken = CreateRawToken();
        return new TokenEnvelope<PasswordResetToken>(
            rawToken,
            new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TokenHash = HashToken(rawToken),
                CreatedAt = now,
                ExpiresAt = now.AddMinutes(Math.Max(5, _authFlowOptions.PasswordResetExpirationMinutes))
            });
    }

    private string BuildActionUrl(string path, string token)
    {
        var baseUrl = _authFlowOptions.FrontendBaseUrl.TrimEnd('/');
        return $"{baseUrl}/{path}?token={Uri.EscapeDataString(token)}";
    }

    private string? ExposeActionUrl(string actionUrl) =>
        _authFlowOptions.ExposeActionUrlsInApi ? actionUrl : null;

    private static string CreateRawToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }

    private sealed record TokenEnvelope<T>(string RawToken, T Entity);
}
