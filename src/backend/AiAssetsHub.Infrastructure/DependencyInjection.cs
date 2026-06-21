using AiAssetsHub.Application.Contracts.Catalog;
using AiAssetsHub.Application.Contracts.Identity;
using AiAssetsHub.Domain.Identity.Entities;
using AiAssetsHub.Infrastructure.Authentication;
using AiAssetsHub.Infrastructure.Persistence;
using AiAssetsHub.Infrastructure.Persistence.Seeding;
using AiAssetsHub.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AiAssetsHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException("Connection string 'Postgres' was not found.");

        services.AddOptions<AllowedEmailDomainOptions>()
            .Bind(configuration.GetSection(AllowedEmailDomainOptions.SectionName));
        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName));
        services.AddOptions<InitialContributorOptions>()
            .Bind(configuration.GetSection(InitialContributorOptions.SectionName));
        services.AddOptions<AuthFlowOptions>()
            .Bind(configuration.GetSection(AuthFlowOptions.SectionName));
        services.AddOptions<EmailDeliveryOptions>()
            .Bind(configuration.GetSection(EmailDeliveryOptions.SectionName));
        services.Configure<AdminEmailsOptions>(opts =>
        {
            opts.Emails = configuration.GetSection("AdminEmails").Get<string[]>() ?? Array.Empty<string>();
        });

        services.AddDbContext<AiAssetsHubDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsql => npgsql.MigrationsHistoryTable("__ef_migrations_history", "foundation")));

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAssetService, AssetService>();
        services.AddScoped<IEmailSender, AzureCommunicationEmailSender>();
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddScoped<DatabaseSeeder>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        return services;
    }
}
