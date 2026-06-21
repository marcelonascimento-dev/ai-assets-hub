namespace AiAssetsHub.Application.Contracts.Identity;

public enum AuthFailureReason
{
    None = 0,
    EmailAlreadyRegistered,
    EmailDomainNotAllowed,
    InvalidCredentials,
    EmailNotConfirmed,
    InvalidOrExpiredToken
}
