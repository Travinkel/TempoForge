using System.Net.Http;
using DotNet.Testcontainers.Builders;
using Microsoft.EntityFrameworkCore;
using TempoForge.Infrastructure.Data;
using Testcontainers.PostgreSql;
using Xunit;

namespace TempoForge.Tests.Infrastructure;

public sealed class ApiTestFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres;
    private TempoForgeApiFactory? _factory;

    public ApiTestFixture()
    {
        _postgres = new PostgreSqlBuilder()
            .WithImage("postgres:15-alpine")
            .WithDatabase("tempo_test")
            .WithUsername("tempo")
            .WithPassword("tempo")
            .Build();
    }

    public HttpClient CreateClient()
    {
        if (_factory is null)
        {
            throw new InvalidOperationException("Factory not initialized");
        }

        return _factory.CreateClient();
    }

    public async Task ResetDatabaseAsync()
    {
        var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;

        await using var context = new TempoForgeDbContext(options);
        await context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"Sprints\", \"Projects\" RESTART IDENTITY CASCADE;");
    }

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();

        var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;

        await using (var context = new TempoForgeDbContext(options))
        {
            await context.Database.MigrateAsync();
        }

        _factory = new TempoForgeApiFactory(_postgres.GetConnectionString());
    }

    public async Task DisposeAsync()
    {
        _factory?.Dispose();
        await _postgres.DisposeAsync();
    }
}
