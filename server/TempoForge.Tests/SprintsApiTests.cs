using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using TempoForge.Domain.Entities;
using TempoForge.Tests.Infrastructure;
using Xunit;

namespace TempoForge.Tests;

[Collection(ApiTestCollection.Name)]
public class SprintsApiTests
{
    private readonly ApiTestFixture _fixture;
    private readonly bool _dockerAvailable;
    private readonly string _skipReason;

    public SprintsApiTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
        _dockerAvailable = fixture.DockerAvailable;
        _skipReason = fixture.SkipReason;
    }

    [Fact]
    public async Task StartSprint_ReturnsCreated()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Alpha");

        var response = await client.PostAsJsonAsync("/api/sprints/start", new { ProjectId = projectId, DurationMinutes = 25 });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var sprint = await response.Content.ReadFromJsonAsync<SprintResponse>();
        Assert.NotNull(sprint);
        Assert.Equal(SprintStatus.Running, sprint!.Status);
        Assert.Equal(projectId, sprint.ProjectId);
    }

    [Fact]
    public async Task StartSprint_WhenRunning_ReturnsConflict()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Conflict Project");

        var first = await client.PostAsJsonAsync("/api/sprints/start", new { ProjectId = projectId, DurationMinutes = 30 });
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        var second = await client.PostAsJsonAsync("/api/sprints/start", new { ProjectId = projectId, DurationMinutes = 20 });

        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
        var problem = await second.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.NotNull(problem);
        Assert.Equal(StatusCodes.Status409Conflict, problem!.Status);
    }

    [Fact]
    public async Task CompleteSprint_UpdatesStatusAndStats()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Completion Project");
        var started = await StartSprintAsync(client, projectId, 30);

        var completeResponse = await PostWithoutBodyAsync(client, $"/api/sprints/{started.Id}/complete");
        Assert.Equal(HttpStatusCode.OK, completeResponse.StatusCode);
        var completed = await completeResponse.Content.ReadFromJsonAsync<SprintResponse>();
        Assert.NotNull(completed);
        Assert.Equal(SprintStatus.Completed, completed!.Status);
        Assert.NotNull(completed.CompletedAtUtc);

        var today = await client.GetFromJsonAsync<TodayStatsResponse>("/api/stats/today");
        Assert.NotNull(today);
        Assert.Equal(1, today!.SprintCount);
        Assert.Equal(30, today.MinutesFocused);
        Assert.True(today.StreakDays >= 1);
    }

    [Fact]
    public async Task AbortSprint_DoesNotAffectStats()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Abort Project");
        var started = await StartSprintAsync(client, projectId, 25);

        var abortResponse = await PostWithoutBodyAsync(client, $"/api/sprints/{started.Id}/abort");
        Assert.Equal(HttpStatusCode.OK, abortResponse.StatusCode);
        var aborted = await abortResponse.Content.ReadFromJsonAsync<SprintResponse>();
        Assert.NotNull(aborted);
        Assert.Equal(SprintStatus.Aborted, aborted!.Status);

        var today = await client.GetFromJsonAsync<TodayStatsResponse>("/api/stats/today");
        Assert.NotNull(today);
        Assert.Equal(0, today!.SprintCount);
        Assert.Equal(0, today.MinutesFocused);
    }

    [Fact]
    public async Task RecentSprints_ReturnsMostRecentEntries()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();
        var alpha = await CreateProjectAsync(client, "Alpha Project");
        var beta = await CreateProjectAsync(client, "Beta Project");
        var gamma = await CreateProjectAsync(client, "Gamma Project");

        var first = await StartSprintAsync(client, alpha, 15);
        await PostWithoutBodyAsync(client, $"/api/sprints/{first.Id}/complete");

        var second = await StartSprintAsync(client, beta, 20);
        await PostWithoutBodyAsync(client, $"/api/sprints/{second.Id}/complete");

        var third = await StartSprintAsync(client, gamma, 25);
        await PostWithoutBodyAsync(client, $"/api/sprints/{third.Id}/complete");

        var recent = await client.GetFromJsonAsync<List<RecentSprintResponse>>("/api/sprints/recent?take=2");
        Assert.NotNull(recent);
        Assert.Equal(2, recent!.Count);
        Assert.Equal("Gamma Project", recent[0].ProjectName);
        Assert.Equal("Beta Project", recent[1].ProjectName);
    }

    [Fact]
    public async Task Progress_ReturnsSilverStandingWithPercent()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Progress Project");

        for (var i = 0; i < 25; i++)
        {
            var sprint = await StartSprintAsync(client, projectId, 10);
            await PostWithoutBodyAsync(client, $"/api/sprints/{sprint.Id}/complete");
        }

        var progress = await client.GetFromJsonAsync<ProgressResponse>("/api/stats/progress");
        Assert.NotNull(progress);
        Assert.Equal("Silver", progress!.Standing);
        Assert.Equal(25, progress.CompletedSprints);
        Assert.Equal(50, progress.NextThreshold);
        var expected = (25 - 20) / 30d;
        Assert.InRange(progress.PercentToNext, expected - 0.01, expected + 0.01);
    }

    [Fact]
    public async Task ToggleFavoritesEndpoint_ReflectsUpdatedFlag()
    {
        if (ShouldSkip()) return;

        await _fixture.ResetDatabaseAsync();
        using var client = _fixture.CreateClient();

        var explorerId = await CreateProjectAsync(client, "Explorer", isFavorite: false);
        var vanguardId = await CreateProjectAsync(client, "Vanguard", isFavorite: true);

        var favorites = await client.GetFromJsonAsync<List<ProjectFavoritesResponse>>("/api/projects/favorites");
        Assert.NotNull(favorites);
        Assert.Single(favorites!);
        Assert.Equal(vanguardId, favorites![0].Id);

        var promoteExplorer = await client.PutAsJsonAsync($"/api/projects/{explorerId}", new { IsFavorite = true });
        promoteExplorer.EnsureSuccessStatusCode();

        favorites = await client.GetFromJsonAsync<List<ProjectFavoritesResponse>>("/api/projects/favorites");
        Assert.NotNull(favorites);
        Assert.Equal(2, favorites!.Count);
        Assert.Contains(favorites!, f => f.Id == explorerId);

        var demoteExplorer = await client.PutAsJsonAsync($"/api/projects/{explorerId}", new { IsFavorite = false });
        demoteExplorer.EnsureSuccessStatusCode();

        favorites = await client.GetFromJsonAsync<List<ProjectFavoritesResponse>>("/api/projects/favorites");
        Assert.NotNull(favorites);
        Assert.Single(favorites!);
        Assert.Equal(vanguardId, favorites![0].Id);
        Assert.True(favorites[0].IsFavorite);
    }

    private static async Task<Guid> CreateProjectAsync(HttpClient client, string name, bool isFavorite = false)
    {
        var payload = new
        {
            Name = name,
            Track = Track.Work.ToString(),
            Pinned = false,
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

    private bool ShouldSkip()
    {
        if (_dockerAvailable)
        {
            return false;
        }

        Console.WriteLine($"Skipping test because Docker is unavailable: {_skipReason}.");
        return true;
    }

    private sealed record ProjectResponse(Guid Id, string Name);
    private sealed record ProjectFavoritesResponse(Guid Id, bool IsFavorite);

    private sealed record SprintResponse(Guid Id, Guid ProjectId, string ProjectName, int DurationMinutes, DateTime StartedAtUtc, DateTime? CompletedAtUtc, DateTime? AbortedAtUtc, SprintStatus Status);

    private sealed record RecentSprintResponse(Guid Id, string ProjectName, int DurationMinutes, DateTime StartedAtUtc, SprintStatus Status);

    private sealed record TodayStatsResponse(int SprintCount, int MinutesFocused, int StreakDays);

    private sealed record ProgressResponse(string Standing, int CompletedSprints, double PercentToNext, int? NextThreshold);
}


