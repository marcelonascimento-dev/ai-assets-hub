using AiAssetsHub.Domain.Catalog.Entities;
using AiAssetsHub.Domain.Identity.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiAssetsHub.Infrastructure.Persistence;

public sealed class AiAssetsHubDbContext(DbContextOptions<AiAssetsHubDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<EmailVerificationToken> EmailVerificationTokens => Set<EmailVerificationToken>();

    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    public DbSet<Asset> Assets => Set<Asset>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("foundation");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AiAssetsHubDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
