using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using DotNet.Testcontainers.Builders;
using Microsoft.EntityFrameworkCore;
using TempoForge.Infrastructure.Data;
using Testcontainers.PostgreSql;
using Xunit;

namespace TempoForge.Tests.Infrastructure;

public sealed class ApiTestFixture : IAsyncLifetime
{
    private const string ImageName = "postgres:15-alpine";
    private const string DatabaseName = "testdb";
    private const string Username = "postgres";
    private const string Password = "postgres";
    private const int PostgresPort = 5432;

    private static readonly string DefaultSkipReason = "Docker is required to run TempoForge integration tests.";

    private readonly SemaphoreSlim _resetSemaphore = new(1, 1);
    private readonly PostgreSqlBuilder _builder;

    private PostgreSqlContainer? _dbContainer;
    private TempoForgeApiFactory? _factory;
    private bool _dockerAvailable;
    private string _skipReason = DefaultSkipReason;
    private string? _connectionString;

    public ApiTestFixture()
    {
        _builder = new PostgreSqlBuilder()
            .WithImage(ImageName)
            .WithDatabase(DatabaseName)
            .WithUsername(Username)
            .WithPassword(Password)
            .WithWaitStrategy(Wait.ForUnixContainer()
                .UntilCommandIsCompleted($"pg_isready -U {Username} -d {DatabaseName}"));
    }

    public bool DockerAvailable => _dockerAvailable;

    public string SkipReason => _skipReason;

    private string ConnectionString
    {
        get
        {
            if (string.IsNullOrWhiteSpace(_connectionString))
            {
                throw new InvalidOperationException(_skipReason);
            }

            return _connectionString;
        }
    }

    public HttpClient CreateClient()
    {
        if (_factory is null)
        {
            throw new InvalidOperationException(_skipReason);
        }

        return _factory.CreateClient();
    }

    public TempoForgeDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        return new TempoForgeDbContext(options);
    }

    public async Task ResetDatabaseAsync(bool reseed = false)
    {
        if (!_dockerAvailable)
        {
            return;
        }

        await _resetSemaphore.WaitAsync();
        try
        {
            await using var context = CreateDbContext();
            await context.Database.ExecuteSqlRawAsync("""
                DO $$
                DECLARE
                    rec RECORD;
                BEGIN
                    FOR rec IN
                        SELECT tablename
                        FROM pg_tables
                        WHERE schemaname = 'public' AND tablename <> '__EFMigrationsHistory'
                    LOOP
                        EXECUTE format('TRUNCATE TABLE %I.%I RESTART IDENTITY CASCADE', 'public', rec.tablename);
                    END LOOP;
                END $$;
                """);

            if (reseed)
            {
                await TempoForgeSeeder.SeedAsync(context);
            }
        }
        finally
        {
            _resetSemaphore.Release();
        }
    }

    public async Task InitializeAsync()
    {
        try
        {
            _dbContainer = _builder.Build();
            await _dbContainer.StartAsync();

            _connectionString = _dbContainer.GetConnectionString();

            var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
                .UseNpgsql(ConnectionString)
                .Options;

            using var ctx = new TempoForgeDbContext(options);
            await ctx.Database.MigrateAsync();
            await TempoForgeSeeder.SeedAsync(ctx);

            _factory = new TempoForgeApiFactory(ConnectionString);
            _dockerAvailable = true;
            _skipReason = string.Empty;
        }
        catch (Exception ex) when (IsDockerUnavailable(ex))
        {
            _dockerAvailable = false;
            _skipReason = DefaultSkipReason;
        }
    }

    public async Task DisposeAsync()
    {
        _factory?.Dispose();

        if (_dbContainer is not null)
        {
            await _dbContainer.DisposeAsync();
        }

        _resetSemaphore.Dispose();
    }

    private static bool IsDockerUnavailable(Exception ex)
    {
        return ex switch
        {
            ArgumentException { ParamName: "DockerEndpointAuthConfig" } => true,
            InvalidOperationException => true,
            TimeoutException => true,
            HttpRequestException => true,
            AggregateException aggregate when aggregate.InnerExceptions.All(IsDockerUnavailable) => true,
            _ => false
        };
    }
}
