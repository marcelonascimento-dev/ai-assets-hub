using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AiAssetsHub.Infrastructure.Persistence;

public static class ServiceScopeExtensions
{
    public static async Task ApplyMigrationsAsync(this IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AiAssetsHubDbContext>();
        var seeder = scope.ServiceProvider.GetRequiredService<Seeding.DatabaseSeeder>();

        await dbContext.Database.MigrateAsync();
        await seeder.SeedAsync();
    }
}
