using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using TempoForge.Domain.Entities;
using TempoForge.Tests.Infrastructure;
using Xunit;

namespace TempoForge.Tests;

public class EndToEndApiTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public EndToEndApiTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task SprintLifecycle_UpdatesProgressStats()
    {
        if (!_fixture.DockerAvailable)
        {
            return;
        }

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();
        var projectId = await CreateProjectAsync(client, "Lifecycle Project");

        var before = await client.GetFromJsonAsync<ProgressResponse>("/api/stats/progress");
        Assert.NotNull(before);

        var sprint = await StartSprintAsync(client, projectId, 30);
        await PostWithoutBodyAsync(client, $"/api/sprints/{sprint.Id}/complete");

        var after = await client.GetFromJsonAsync<ProgressResponse>("/api/stats/progress");
        Assert.NotNull(after);
        Assert.Equal(before!.totalCompleted + 1, after!.totalCompleted);
    }

    [Fact]
    public async Task ToggleFavorite_PersistsInFavoritesEndpoint()
    {
        if (!_fixture.DockerAvailable)
        {
            return;
        }

        await _fixture.ResetDatabaseAsync(reseed: true);
        using var client = _fixture.CreateClient();

        var projectId = await CreateProjectAsync(client, "Favorite Toggle", isFavorite: false);

        var favoritesBefore = await client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects/favorites");
        Assert.DoesNotContain(favoritesBefore ?? new(), project => project.Id == projectId);

        var update = new { IsFavorite = true };
        var response = await client.PutAsJsonAsync($"/api/projects/{projectId}", update);
        response.EnsureSuccessStatusCode();

        var favoritesAfter = await client.GetFromJsonAsync<List<ProjectResponse>>("/api/projects/favorites");
        Assert.Contains(favoritesAfter ?? new(), project => project.Id == projectId && project.IsFavorite);
    }

    private static async Task<Guid> CreateProjectAsync(HttpClient client, string name, bool isFavorite = false)
    {
        var payload = new { Name = name, IsFavorite = isFavorite };
        var response = await client.PostAsJsonAsync("/api/projects", payload);
        response.EnsureSuccessStatusCode();
        var project = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        return project!.Id;
    }

    private static async Task<SprintResponse> StartSprintAsync(HttpClient client, Guid projectId, int duration)
    {
        var response = await client.PostAsJsonAsync("/api/sprints/start", new { ProjectId = projectId, DurationMinutes = duration });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<SprintResponse>())!;
    }

    private static Task<HttpResponseMessage> PostWithoutBodyAsync(HttpClient client, string requestUri)
        => client.SendAsync(new HttpRequestMessage(HttpMethod.Post, requestUri));

    private sealed record ProjectResponse(Guid Id, string Name, bool IsFavorite, DateTime CreatedAt, DateTime? LastUsedAt);

    private sealed record SprintResponse(Guid Id, Guid ProjectId, string ProjectName, int DurationMinutes, DateTime StartedAtUtc, DateTime? CompletedAtUtc, DateTime? AbortedAtUtc, SprintStatus Status);

    private sealed record ProgressResponse(string standing, int percentToNext, int totalCompleted, int? nextThreshold, QuestSnapshot quest);

    private sealed record QuestSnapshot(int dailyGoal, int dailyCompleted, int weeklyGoal, int weeklyCompleted, int epicGoal, int epicCompleted);
}

