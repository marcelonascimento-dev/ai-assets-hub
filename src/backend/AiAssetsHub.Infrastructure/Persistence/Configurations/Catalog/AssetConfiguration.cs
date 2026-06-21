using AiAssetsHub.Domain.Catalog.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AiAssetsHub.Infrastructure.Persistence.Configurations.Catalog;

public sealed class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("assets", "catalog");

        builder.HasKey(asset => asset.Id);

        builder.Property(asset => asset.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(asset => asset.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(asset => asset.ShortDescription)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(asset => asset.DetailedDescription)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(asset => asset.Category)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(asset => asset.Tags)
            .HasColumnType("text[]")
            .HasDefaultValueSql("ARRAY[]::text[]")
            .IsRequired();

        builder.Property(asset => asset.TeamName)
            .HasMaxLength(120);

        builder.Property(asset => asset.Version)
            .HasMaxLength(32)
            .HasDefaultValue("1.0.0")
            .IsRequired();

        builder.Property(asset => asset.InstallType)
            .HasMaxLength(32)
            .HasDefaultValue("Manual")
            .IsRequired();

        builder.Property(asset => asset.InstallNotes)
            .HasColumnType("text");

        builder.Property(asset => asset.CreatedAt).IsRequired();
        builder.Property(asset => asset.UpdatedAt).IsRequired();

        builder.HasIndex(asset => asset.Slug).IsUnique();
        builder.HasIndex(asset => asset.Category);
        builder.HasIndex(asset => asset.Tags).HasMethod("GIN");

        builder.HasOne(asset => asset.AuthorUser)
            .WithMany()
            .HasForeignKey(asset => asset.AuthorUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
