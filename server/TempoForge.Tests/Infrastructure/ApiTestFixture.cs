using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TempoForge.Infrastructure.Data;
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

    private IContainer? _postgresContainer;
    private TempoForgeApiFactory? _factory;
    private NpgsqlDataSource? _dataSource;
    private bool _dockerAvailable;
    private string _skipReason = DefaultSkipReason;

    public bool DockerAvailable => _dockerAvailable;

    public string SkipReason => _skipReason;


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
        if (_dataSource is null)
        {
            throw new InvalidOperationException(_skipReason);
        }

        var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
            .UseNpgsql(_dataSource)
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
            _postgresContainer = new ContainerBuilder()
                .WithImage(ImageName)
                .WithName($"tempoforge-tests-{Guid.NewGuid():N}")
                .WithCleanUp(true)
                .WithEnvironment("POSTGRES_DB", DatabaseName)
                .WithEnvironment("POSTGRES_USER", Username)
                .WithEnvironment("POSTGRES_PASSWORD", Password)
                .WithPortBinding(PostgresPort, assignRandomHostPort: true)
                .WithWaitStrategy(Wait.ForUnixContainer()
                    .UntilCommandIsCompleted($"pg_isready -U {Username} -d {DatabaseName}"))
                .Build();

            await _postgresContainer.StartAsync();

            var connectionString = new NpgsqlConnectionStringBuilder
            {
                Host = _postgresContainer.Hostname,
                Port = _postgresContainer.GetMappedPublicPort(PostgresPort),
                Database = DatabaseName,
                Username = Username,
                Password = Password,
                SslMode = SslMode.Disable
            }.ConnectionString;

            _dataSource = new NpgsqlDataSourceBuilder(connectionString).Build();

            var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
                .UseNpgsql(_dataSource)
                .Options;

            await using (var context = new TempoForgeDbContext(options))
            {
                await context.Database.MigrateAsync();
                await TempoForgeSeeder.SeedAsync(context);
            }

            _factory = new TempoForgeApiFactory(connectionString);
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

        if (_dataSource is not null)
        {
            await _dataSource.DisposeAsync();
        }

        if (_postgresContainer is not null)
        {
            await _postgresContainer.DisposeAsync();
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
