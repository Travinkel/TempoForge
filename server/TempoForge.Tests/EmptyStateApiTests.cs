using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TempoForge.Domain.Entities;
using TempoForge.Tests.Infrastructure;
using Xunit;

namespace TempoForge.Tests;

public class EmptyStateApiTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public EmptyStateApiTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
        _fixture.ResetDatabaseAsync(reseed: false).GetAwaiter().GetResult();
    }

    [Fact]
    public async Task EmptyDatabase_ReturnsOkWithEmptyPayloads()
    {
        using var client = _fixture.CreateClient();

        var favoritesResponse = await client.GetAsync("/api/projects/favorites");
        Assert.Equal(HttpStatusCode.OK, favoritesResponse.StatusCode);
        var favorites = await favoritesResponse.Content.ReadFromJsonAsync<List<ProjectFavoritesResponse>>();
        Assert.NotNull(favorites);
        Assert.Empty(favorites!);

        var recentResponse = await client.GetAsync("/api/sprints/recent");
        Assert.Equal(HttpStatusCode.OK, recentResponse.StatusCode);
        var recent = await recentResponse.Content.ReadFromJsonAsync<List<RecentSprintResponse>>();
        Assert.NotNull(recent);
        Assert.Empty(recent!);

        var todayResponse = await client.GetAsync("/api/stats/today");
        Assert.Equal(HttpStatusCode.OK, todayResponse.StatusCode);
        var today = await todayResponse.Content.ReadFromJsonAsync<TodayStatsResponse>();
        Assert.NotNull(today);
        Assert.Equal(0, today!.Minutes);
        Assert.Equal(0, today.Sprints);
        Assert.Equal(0, today.StreakDays);

        var progressResponse = await client.GetAsync("/api/stats/progress");
        Assert.Equal(HttpStatusCode.OK, progressResponse.StatusCode);
        var progress = await progressResponse.Content.ReadFromJsonAsync<ProgressResponse>();
        Assert.NotNull(progress);
        Assert.Equal(0, progress!.TotalCompleted);
        Assert.NotNull(progress.Quest);
        Assert.True(progress.PercentToNext >= 0);

        var runningResponse = await client.GetAsync("/api/sprints/running");
        Assert.Equal(HttpStatusCode.OK, runningResponse.StatusCode);
        await using var runningStream = await runningResponse.Content.ReadAsStreamAsync();
        using var runningJson = await JsonDocument.ParseAsync(runningStream);
        Assert.Equal(JsonValueKind.Object, runningJson.RootElement.ValueKind);
        Assert.Empty(runningJson.RootElement.EnumerateObject());
    }

    private sealed record ProjectFavoritesResponse(Guid Id, bool IsFavorite);
    private sealed record RecentSprintResponse(Guid Id, string ProjectName, int DurationMinutes, DateTime StartedAtUtc, SprintStatus Status);
    private sealed record TodayStatsResponse(int Minutes, int Sprints, int StreakDays);
    private sealed record QuestSnapshotResponse(int DailyGoal, int DailyCompleted, int WeeklyGoal, int WeeklyCompleted, int EpicGoal, int EpicCompleted);
    private sealed record ProgressResponse(string Standing, int PercentToNext, int TotalCompleted, int? NextThreshold, QuestSnapshotResponse Quest);
}
