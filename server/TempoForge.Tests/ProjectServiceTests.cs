using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using Xunit;
using TempoForge.Infrastructure.Data;
using TempoForge.Application.Projects;
using TempoForge.Domain.Entities;

namespace TempoForge.Tests;

public class PostgresFixture : IAsyncLifetime
{
    public PostgreSqlContainer Container { get; private set; } = default!;

    public string ConnectionString => Container.GetConnectionString();

    public async Task InitializeAsync()
    {
        Container = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("tempo_tests")
            .WithUsername("postgres")
            .WithPassword("postgres")
            .Build();
        await Container.StartAsync();
    }

    public async Task DisposeAsync()
    {
        if (Container is not null)
        {
            await Container.DisposeAsync();
        }
    }
}

public class ProjectServiceTests : IClassFixture<PostgresFixture>
{
    private readonly PostgresFixture _fx;

    public ProjectServiceTests(PostgresFixture fx)
    {
        _fx = fx;
    }

    private TempoForgeDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
            .UseNpgsql(_fx.ConnectionString)
            .Options;
        var db = new TempoForgeDbContext(options);
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
        return db;
    }

    [Fact]
    public async Task CreateAsync_CreatesProject()
    {
        await using var db = CreateDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(new ProjectCreateDto
        {
            Name = "Alpha",
            Track = Track.Work,
            Pinned = false
        }, default);

        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.Equal("Alpha", created.Name);
        Assert.Equal(Track.Work, created.Track);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFields()
    {
        await using var db = CreateDbContext();
        var svc = new ProjectService(db);
        var p = await svc.CreateAsync(new ProjectCreateDto { Name = "Alpha", Track = Track.Work, Pinned = false }, default);

        var updated = await svc.UpdateAsync(p.Id, new ProjectUpdateDto { Name = "Beta", Track = Track.Study, Pinned = true }, default);

        Assert.NotNull(updated);
        Assert.Equal("Beta", updated!.Name);
        Assert.Equal(Track.Study, updated.Track);
        Assert.True(updated.Pinned);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsOrdered()
    {
        await using var db = CreateDbContext();
        var svc = new ProjectService(db);
        await svc.CreateAsync(new ProjectCreateDto { Name = "A", Track = Track.Work, Pinned = false }, default);
        await Task.Delay(10);
        await svc.CreateAsync(new ProjectCreateDto { Name = "B", Track = Track.Work, Pinned = false }, default);

        var all = await svc.GetAllAsync(default);
        Assert.Equal(2, all.Count);
        Assert.Equal("B", all[0].Name);
        Assert.Equal("A", all[1].Name);
    }

    [Fact]
    public async Task DeleteAsync_RemovesProject()
    {
        await using var db = CreateDbContext();
        var svc = new ProjectService(db);
        var p = await svc.CreateAsync(new ProjectCreateDto { Name = "Alpha", Track = Track.Work, Pinned = false }, default);

        var ok = await svc.DeleteAsync(p.Id, default);
        Assert.True(ok);
        var fetched = await svc.GetAsync(p.Id, default);
        Assert.Null(fetched);
    }
}