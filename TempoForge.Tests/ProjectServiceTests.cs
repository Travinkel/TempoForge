using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using TempoForge.Application.Projects;
using TempoForge.Infrastructure.Data;
using TempoForge.Domain.Entities;
using Xunit;

namespace TempoForge.Tests;

public class ProjectServiceTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _pg = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .WithUsername("tempo")
        .WithPassword("tempo")
        .WithDatabase("tempo")
        .Build();

    public async Task InitializeAsync() => await _pg.StartAsync();
    public async Task DisposeAsync() => await _pg.DisposeAsync();

    private TempoForgeDbContext NewDb()
    {
        var opts = new DbContextOptionsBuilder<TempoForgeDbContext>()
            .UseNpgsql(_pg.GetConnectionString())
            .Options;
        var db = new TempoForgeDbContext(opts);
        db.Database.EnsureCreated();
        return db;
    }

    [Fact]
    public async Task Create_project_and_enforce_name_length()
    {
        await using var db = NewDb();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(new ProjectCreateDto
        {
            Name = "Test Project",
            Track = Track.Work,
            Pinned = false
        }, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.Equal(Track.Work, created.Track);

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(async () =>
        {
            await svc.CreateAsync(new ProjectCreateDto
            {
                Name = "ab",
                Track = Track.Work
            }, CancellationToken.None);
        });
    }
}
