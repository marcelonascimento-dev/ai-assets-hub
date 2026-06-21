using AiAssetsHub.Domain.Identity.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AiAssetsHub.Infrastructure.Persistence.Seeding;

public sealed class DatabaseSeeder(
    AiAssetsHubDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    IOptions<InitialContributorOptions> contributorOptions)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await SeedRolesAsync(cancellationToken);
        await SeedInitialContributorAsync(cancellationToken);
    }

    private async Task SeedRolesAsync(CancellationToken cancellationToken)
    {
        var requiredRoles = new[]
        {
            IdentityRoles.User,
            IdentityRoles.Contributor,
            IdentityRoles.Admin
        };

        var existingNormalizedNames = await dbContext.Roles
            .Select(role => role.NormalizedName)
            .ToListAsync(cancellationToken);

        foreach (var roleName in requiredRoles.Where(roleName =>
                     !existingNormalizedNames.Contains(roleName.ToUpperInvariant(), StringComparer.Ordinal)))
        {
            dbContext.Roles.Add(new Role
            {
                Id = Guid.NewGuid(),
                Name = roleName,
                NormalizedName = roleName.ToUpperInvariant()
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedInitialContributorAsync(CancellationToken cancellationToken)
    {
        var options = contributorOptions.Value;
        if (!options.Enabled ||
            string.IsNullOrWhiteSpace(options.Email) ||
            string.IsNullOrWhiteSpace(options.Password) ||
            string.IsNullOrWhiteSpace(options.FullName))
        {
            return;
        }

        var normalizedEmail = options.Email.Trim().ToLowerInvariant();
        var existingUser = await dbContext.Users
            .Include(user => user.Roles)
            .SingleOrDefaultAsync(user => user.Email == normalizedEmail, cancellationToken);

        if (existingUser is null)
        {
            var now = DateTimeOffset.UtcNow;
            existingUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = options.FullName.Trim(),
                Email = normalizedEmail,
                EmailConfirmedAt = now,
                CreatedAt = now,
                UpdatedAt = now
            };

            existingUser.PasswordHash = passwordHasher.HashPassword(existingUser, options.Password);
            dbContext.Users.Add(existingUser);
        }
        else
        {
            existingUser.EmailConfirmedAt ??= DateTimeOffset.UtcNow;
        }

        var contributorRoles = await dbContext.Roles
            .Where(role => role.NormalizedName == "USER" || role.NormalizedName == "CONTRIBUTOR")
            .ToListAsync(cancellationToken);

        foreach (var role in contributorRoles.Where(role =>
                     existingUser.Roles.All(existingRole => existingRole.NormalizedName != role.NormalizedName)))
        {
            existingUser.Roles.Add(role);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
