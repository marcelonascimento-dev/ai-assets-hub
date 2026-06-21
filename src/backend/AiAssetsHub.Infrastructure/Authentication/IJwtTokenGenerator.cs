using AiAssetsHub.Application.Contracts.Identity;
using AiAssetsHub.Domain.Identity.Entities;

namespace AiAssetsHub.Infrastructure.Authentication;

public interface IJwtTokenGenerator
{
    AuthResponse Generate(User user);
}
