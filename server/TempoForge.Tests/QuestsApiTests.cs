using System.Net;
using System.Net.Http.Json;
using TempoForge.Domain.Entities;
using TempoForge.Tests.Infrastructure;
using Xunit;

namespace TempoForge.Tests;

[Collection(ApiTestCollection.Name)]
public class QuestsApiTests
{
    private readonly ApiTestFixture _fixture;
    private readonly bool _dockerAvailable;
    private readonly string _skipReason;

    public QuestsApiTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
        _dockerAvailable = fixture.DockerAvailable;
        _skipReason = fixture.SkipReason;
    }

    [Fact]
    public async Task CreateQuest_ReturnsCreated()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();

        var response = await client.PostAsJsonAsync("/api/quests", new { Name = "Daily Grind", Type = QuestType.Daily, Goal = 3 });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var quest = await response.Content.ReadFromJsonAsync<QuestResponse>();
        Assert.NotNull(quest);
        Assert.Equal("Daily Grind", quest!.Name);
        Assert.Equal(QuestType.Daily, quest.Type);
        Assert.Equal(3, quest.Goal);
        Assert.False(quest.IsExpired);
    }

    [Fact]
    public async Task GetQuests_FiltersByType()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();

        await client.PostAsJsonAsync("/api/quests", new { Name = "Daily Focus", Type = QuestType.Daily, Goal = 3 });
        await client.PostAsJsonAsync("/api/quests", new { Name = "Weekly Warrior", Type = QuestType.Weekly, Goal = 10 });

        var daily = await client.GetFromJsonAsync<List<QuestResponse>>("/api/quests?type=Daily");
        Assert.NotNull(daily);
        Assert.Single(daily!);
        Assert.Equal(QuestType.Daily, daily[0].Type);
    }

    [Fact]
    public async Task UpdateQuest_AdjustsProgress()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();

        var created = await client.PostAsJsonAsync("/api/quests", new { Name = "Epic Saga", Type = QuestType.Epic, Goal = 50 });
        created.EnsureSuccessStatusCode();
        var quest = await created.Content.ReadFromJsonAsync<QuestResponse>();
        Assert.NotNull(quest);

        var update = await client.PutAsJsonAsync($"/api/quests/{quest!.Id}", new { Progress = 25, Reward = "Legendary Loot" });
        update.EnsureSuccessStatusCode();
        var updated = await update.Content.ReadFromJsonAsync<QuestResponse>();
        Assert.NotNull(updated);
        Assert.Equal(25, updated!.Progress);
        Assert.Equal("Legendary Loot", updated.Reward);
    }

    private bool ShouldSkip()
    {
        if (_dockerAvailable)
        {
            return false;
        }

        Console.WriteLine($"Skipping test because Docker is unavailable: {_skipReason}.");
        return true;
    }

    private sealed record QuestResponse(Guid Id, string Name, QuestType Type, int Goal, int Progress, string? Reward, DateTime? ExpiresAt, bool IsExpired, double CompletionPercent);
}
