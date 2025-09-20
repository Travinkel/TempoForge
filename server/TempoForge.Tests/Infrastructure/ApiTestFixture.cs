using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using DotNet.Testcontainers.Builders;
using Microsoft.EntityFrameworkCore;
using Npgsql;
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

    private const string DefaultSkipReason = "Docker is required to run TempoForge integration tests.";

    private readonly SemaphoreSlim _resetSemaphore = new(1, 1);
    private readonly PostgreSqlBuilder _builder;

    private PostgreSqlContainer? _dbContainer;
    private TempoForgeApiFactory? _factory;
    private string _skipReason = DefaultSkipReason;
    private string? _connectionString;

    public ApiTestFixture()
    {
        _builder = new PostgreSqlBuilder()
            .WithImage(ImageName)
            .WithDatabase(DatabaseName)
            .WithUsername(Username)
            .WithPassword(Password)
            .WithWaitStrategy(Wait.ForUnixContainer().UntilPortIsAvailable(PostgresPort));
    }

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

    public async Task ResetDatabaseAsync(bool reseed = true)
    {
        if (_factory is null)
        {
            throw new InvalidOperationException(_skipReason);
        }

        await _resetSemaphore.WaitAsync();
        try
        {
            await using var connection = new NpgsqlConnection(ConnectionString);
            await connection.OpenAsync();
            await using var command = connection.CreateCommand();
            command.CommandText = "TRUNCATE TABLE \"Projects\", \"Sprints\", \"Quests\" RESTART IDENTITY CASCADE;";
            await command.ExecuteNonQueryAsync();

            if (reseed)
            {
                await using var context = CreateDbContext();
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

            await using var ctx = new TempoForgeDbContext(options);
            await ctx.Database.MigrateAsync();
            await TempoForgeSeeder.SeedAsync(ctx);

            _factory = new TempoForgeApiFactory(ConnectionString);
            _skipReason = string.Empty;
        }
        catch (Exception ex) when (IsDockerUnavailable(ex))
        {
            throw new InvalidOperationException(DefaultSkipReason, ex);
        }
    }

    public async Task DisposeAsync() => await DisposeAsyncCore();

    private async ValueTask DisposeAsyncCore()
    {
        _factory?.Dispose();
        _resetSemaphore.Dispose();

        if (_dbContainer is not null)
        {
            await _dbContainer.DisposeAsync();
        }
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
