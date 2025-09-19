using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;
using TempoForge.Tests.Infrastructure;
using Xunit;

namespace TempoForge.Tests;

public class QuestsApiTests : IClassFixture<ApiTestFixture>
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
    public async Task ActiveQuests_ReturnsSeededDefinitions()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();

        var response = await client.GetAsync("/api/quests/active/details");
        response.EnsureSuccessStatusCode();

        var quests = await response.Content.ReadFromJsonAsync<ActiveQuestsResponse>();
        Assert.NotNull(quests);
        Assert.NotNull(quests!.Daily);
        Assert.NotNull(quests.Weekly);
        Assert.NotNull(quests.Epic);
        Assert.Equal(QuestType.Daily, quests.Daily!.Type);
        Assert.Equal(QuestType.Weekly, quests.Weekly!.Type);
        Assert.Equal(QuestType.Epic, quests.Epic!.Type);
    }

    [Fact]
    public async Task CompletingSprint_AdvancesDailyWeeklyAndEpic()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Quest Progress");

        var sprint = await StartSprintAsync(client, projectId, 25);
        await PostWithoutBodyAsync(client, $"/api/sprints/{sprint.Id}/complete");

        var quests = await client.GetFromJsonAsync<ActiveQuestsResponse>("/api/quests/active/details");
        Assert.NotNull(quests);
        Assert.Equal(1, quests!.Daily!.Progress);
        Assert.Equal(1, quests.Weekly!.Progress);
        Assert.Equal(1, quests.Epic!.Progress);
    }

    [Fact]
    public async Task DailyQuest_ResetsWhenExpired()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Daily Reset");

        var sprint = await StartSprintAsync(client, projectId, 25);
        await PostWithoutBodyAsync(client, $"/api/sprints/{sprint.Id}/complete");

        await using (var db = _fixture.CreateDbContext())
        {
            var daily = await db.Quests.FirstAsync(q => q.Type == QuestType.Daily);
            daily.Progress = 2;
            daily.ExpiresAt = DateTime.UtcNow.AddMinutes(-10);
            await db.SaveChangesAsync();
        }

        var quests = await client.GetFromJsonAsync<ActiveQuestsResponse>("/api/quests/active/details");
        Assert.NotNull(quests);
        Assert.Equal(0, quests!.Daily!.Progress);
        Assert.True(quests.Daily.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task WeeklyQuest_ResetsAtNextWeekBoundary()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Weekly Reset");

        var sprint = await StartSprintAsync(client, projectId, 25);
        await PostWithoutBodyAsync(client, $"/api/sprints/{sprint.Id}/complete");

        await using (var db = _fixture.CreateDbContext())
        {
            var weekly = await db.Quests.FirstAsync(q => q.Type == QuestType.Weekly);
            weekly.Progress = 7;
            weekly.ExpiresAt = DateTime.UtcNow.AddDays(-1);
            await db.SaveChangesAsync();
        }

        var quests = await client.GetFromJsonAsync<ActiveQuestsResponse>("/api/quests/active/details");
        Assert.NotNull(quests);
        Assert.Equal(0, quests!.Weekly!.Progress);
        Assert.Equal(DayOfWeek.Monday, quests.Weekly.ExpiresAt.DayOfWeek);
    }

    [Fact]
    public async Task EpicQuest_PersistsAcrossResets()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Epic Persistence");

        for (var i = 0; i < 3; i++)
        {
            var sprint = await StartSprintAsync(client, projectId, 20);
            await PostWithoutBodyAsync(client, $"/api/sprints/{sprint.Id}/complete");
        }

        await using (var db = _fixture.CreateDbContext())
        {
            var daily = await db.Quests.FirstAsync(q => q.Type == QuestType.Daily);
            daily.ExpiresAt = DateTime.UtcNow.AddMinutes(-5);
            var weekly = await db.Quests.FirstAsync(q => q.Type == QuestType.Weekly);
            weekly.ExpiresAt = DateTime.UtcNow.AddMinutes(-5);
            await db.SaveChangesAsync();
        }

        var quests = await client.GetFromJsonAsync<ActiveQuestsResponse>("/api/quests/active/details");
        Assert.NotNull(quests);
        Assert.Equal(0, quests!.Daily!.Progress);
        Assert.Equal(0, quests.Weekly!.Progress);
        Assert.Equal(3, quests.Epic!.Progress);
    }

    [Fact]
    public async Task ClaimQuestReward_ReturnsConflictWhenIncomplete()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();

        var quests = await client.GetFromJsonAsync<ActiveQuestsResponse>("/api/quests/active/details");
        Assert.NotNull(quests);

        var response = await client.PostAsync($"/api/quests/{quests!.Daily!.Id}/claim", null);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task ClaimQuestReward_SucceedsOnceGoalReached()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Quest Claim");

        for (var i = 0; i < 3; i++)
        {
            var sprint = await StartSprintAsync(client, projectId, 20);
            await PostWithoutBodyAsync(client, $"/api/sprints/{sprint.Id}/complete");
        }

        var quests = await client.GetFromJsonAsync<ActiveQuestsResponse>("/api/quests/active/details");
        Assert.NotNull(quests);
        Assert.Equal(3, quests!.Daily!.Progress);

        var response = await client.PostAsync($"/api/quests/{quests.Daily.Id}/claim", null);
        response.EnsureSuccessStatusCode();

        var claimed = await response.Content.ReadFromJsonAsync<QuestDetailResponse>();
        Assert.NotNull(claimed);
        Assert.True(claimed!.RewardClaimed);
    }

    [Fact]
    public async Task QuestsEndpoint_ReturnsAggregatedProgress()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Aggregated Quests");

        for (var i = 0; i < 3; i++)
        {
            var sprint = await StartSprintAsync(client, projectId, 25);
            await PostWithoutBodyAsync(client, $"/api/sprints/{sprint.Id}/complete");
        }

        var quests = await client.GetFromJsonAsync<List<QuestSummaryResponse>>("/api/quests/active");
        Assert.NotNull(quests);

        var questList = quests!;
        Assert.Equal(4, questList.Count);

        var daily = questList.Single(q => q.Type == "Daily");
        Assert.Equal(3, daily.Progress);
        Assert.True(daily.Completed);

        var streak = questList.Single(q => q.Title.Contains("Maintain streak", StringComparison.Ordinal));
        Assert.Equal(1, streak.Progress);
        Assert.False(streak.Completed);

        var weekly = questList.Single(q => q.Title.Contains("Complete 15", StringComparison.Ordinal));
        Assert.Equal(3, weekly.Progress);

        var epic = questList.Single(q => q.Type == "Epic");
        Assert.Equal(3, epic.Progress);
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

    private static async Task<Guid> CreateProjectAsync(HttpClient client, string name, bool isFavorite = false)
    {
        var payload = new
        {
            Name = name,
            IsFavorite = isFavorite
        };

        var response = await client.PostAsJsonAsync("/api/projects", payload);
        response.EnsureSuccessStatusCode();
        var project = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        return project!.Id;
    }

    private static async Task<SprintResponse> StartSprintAsync(HttpClient client, Guid projectId, int duration)
    {
        var response = await client.PostAsJsonAsync("/api/sprints/start", new { ProjectId = projectId, DurationMinutes = duration });
        response.EnsureSuccessStatusCode();
        var sprint = await response.Content.ReadFromJsonAsync<SprintResponse>();
        return sprint!;
    }

    private static Task<HttpResponseMessage> PostWithoutBodyAsync(HttpClient client, string requestUri)
        => client.SendAsync(new HttpRequestMessage(HttpMethod.Post, requestUri));

    private sealed record ProjectResponse(Guid Id, string Name);

    private sealed record SprintResponse(Guid Id, Guid ProjectId, string ProjectName, int DurationMinutes, DateTime StartedAtUtc, DateTime? CompletedAtUtc, DateTime? AbortedAtUtc, SprintStatus Status);

    private sealed record QuestSummaryResponse(string Title, string Type, int Goal, int Progress, bool Completed);

    private sealed record QuestDetailResponse(Guid Id, string Name, QuestType Type, int Goal, int Progress, string? Reward, DateTime ExpiresAt, bool RewardClaimed);

    private sealed record ActiveQuestsResponse(QuestDetailResponse? Daily, QuestDetailResponse? Weekly, QuestDetailResponse? Epic);
}

