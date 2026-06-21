using AiAssetsHub.Domain.Identity.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AiAssetsHub.Infrastructure.Persistence.Configurations.Identity;

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles", "identity");

        builder.HasKey(role => role.Id);

        builder.Property(role => role.Name)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(role => role.NormalizedName)
            .HasMaxLength(64)
            .IsRequired();

        builder.HasIndex(role => role.NormalizedName).IsUnique();
    }
}
