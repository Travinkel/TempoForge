using System.Net.Http;
using Microsoft.EntityFrameworkCore;
using TempoForge.Infrastructure.Data;
using Testcontainers.PostgreSql;
using Xunit;

namespace TempoForge.Tests.Infrastructure;

public sealed class ApiTestFixture : IAsyncLifetime
{
    private readonly PostgreSqlBuilder _builder;
    private PostgreSqlContainer? _postgres;
    private TempoForgeApiFactory? _factory;
    private bool _dockerAvailable;
    private string _skipReason = "Docker is required to run TempoForge integration tests.";

    public ApiTestFixture()
    {
        _builder = new PostgreSqlBuilder()
            .WithImage("postgres:15-alpine")
            .WithDatabase("tempo_test")
            .WithUsername("tempo")
            .WithPassword("tempo");
    }

    public bool DockerAvailable => _dockerAvailable;

    public string SkipReason => _skipReason;

    public HttpClient CreateClient()
    {
        if (!_dockerAvailable)
        {
            throw new InvalidOperationException(_skipReason);
        }

        if (_factory is null)
        {
            throw new InvalidOperationException("Factory not initialized");
        }

        return _factory.CreateClient();
    }

    public TempoForgeDbContext CreateDbContext()
    {
        if (_postgres is null)
        {
            throw new InvalidOperationException("Database container not available");
        }

        var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;

        return new TempoForgeDbContext(options);
    }

    public async Task ResetDatabaseAsync(bool reseed = false)
    {
        if (_postgres is null)
        {
            return;
        }

        await using var context = CreateDbContext();
        await context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"Sprints\", \"Projects\", \"Quests\" RESTART IDENTITY CASCADE;");

        if (reseed)
        {
            await TempoForgeSeeder.SeedAsync(context);
        }
    }

    public async Task InitializeAsync()
    {
        try
        {
            _postgres = _builder.Build();
            await _postgres.StartAsync();

            await using (var context = CreateDbContext())
            {
                await context.Database.MigrateAsync();
                await TempoForgeSeeder.SeedAsync(context);
            }

            _factory = new TempoForgeApiFactory(_postgres.GetConnectionString());
            _dockerAvailable = true;
        }
        catch (Exception ex) when (IsDockerUnavailable(ex))
        {
            _dockerAvailable = false;
            _skipReason = "Docker is required to run TempoForge integration tests.";
        }
    }

    public async Task DisposeAsync()
    {
        _factory?.Dispose();
        if (_postgres is not null)
        {
            await _postgres.DisposeAsync();
        }
    }

    private static bool IsDockerUnavailable(Exception ex)
    {
        return ex is ArgumentException { ParamName: "DockerEndpointAuthConfig" } or InvalidOperationException;
    }
}
