using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using TempoForge.Domain.Entities;
using TempoForge.Tests.Infrastructure;
using Xunit;

namespace TempoForge.Tests;

public class StatsApiTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public StatsApiTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
        _fixture.ResetDatabaseAsync().GetAwaiter().GetResult();
        _fixture.SeedTestDataAsync().GetAwaiter().GetResult();
    }

    [Fact]
    public async Task TodayStats_ReturnsMinutesSprintsAndStreak()
    {
        using var client = _fixture.CreateClient();

        var response = await client.GetAsync("/api/stats/today");
        response.EnsureSuccessStatusCode();

        var stats = await response.Content.ReadFromJsonAsync<TodayStatsResponse>();
        Assert.NotNull(stats);
        Assert.True(stats!.minutes >= 0);
        Assert.True(stats.sprints >= 0);
        Assert.True(stats.streakDays >= 0);
    }

    [Fact]
    public async Task ProgressStats_ReturnsStandingAndQuestSnapshot()
    {
        using var client = _fixture.CreateClient();

        var response = await client.GetAsync("/api/stats/progress");
        response.EnsureSuccessStatusCode();

        var stats = await response.Content.ReadFromJsonAsync<ProgressResponse>();
        Assert.NotNull(stats);
        Assert.False(string.IsNullOrWhiteSpace(stats!.standing));
        Assert.InRange(stats.percentToNext, 0, 100);
        Assert.True(stats.totalCompleted >= 0);
        Assert.NotNull(stats.quest);
    }

    [Fact]
    public async Task FavoritesEndpoint_ReturnsOnlyFavorites()
    {
        using var client = _fixture.CreateClient();

        var favorites = await client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects/favorites");
        Assert.NotNull(favorites);
        var favoriteList = favorites!;
        Assert.Single(favoriteList);
        Assert.True(favoriteList[0].isFavorite);
    }

    [Fact]
    public async Task RecentSprintsEndpoint_ReturnsLatestFiveWithProjectNames()
    {
        using var client = _fixture.CreateClient();

        var results = await client.GetFromJsonAsync<List<RecentSprintResponse>>("/api/sprints/recent");
        Assert.NotNull(results);
        Assert.NotEmpty(results!);
        Assert.All(results!, sprint => Assert.False(string.IsNullOrWhiteSpace(sprint.projectName)));
        Assert.True(results!.Count <= 5);
    }

    private sealed record TodayStatsResponse(int minutes, int sprints, int streakDays);

    private sealed record ProgressResponse(string standing, int percentToNext, int totalCompleted, int? nextThreshold, QuestSnapshot quest);

    private sealed record QuestSnapshot(int dailyGoal, int dailyCompleted, int weeklyGoal, int weeklyCompleted, int epicGoal, int epicCompleted);

    private sealed record ProjectResponse(Guid id, string name, bool isFavorite, DateTime createdAt, DateTime? lastUsedAt);

    private sealed record RecentSprintResponse(Guid id, string projectName, int durationMinutes, DateTime startedAtUtc, SprintStatus status);
}


