using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AiAssetsHub.Infrastructure.Persistence.DesignTime;

public sealed class AiAssetsHubDbContextFactory : IDesignTimeDbContextFactory<AiAssetsHubDbContext>
{
    public AiAssetsHubDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Postgres")
            ?? "Host=localhost;Port=5432;Database=ai_assets_hub;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<AiAssetsHubDbContext>();
        optionsBuilder.UseNpgsql(
            connectionString,
            npgsql => npgsql.MigrationsHistoryTable("__ef_migrations_history", "foundation"));

        return new AiAssetsHubDbContext(optionsBuilder.Options);
    }
}
