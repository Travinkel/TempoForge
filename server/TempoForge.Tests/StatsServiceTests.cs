using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TempoForge.Application.Quests;
using TempoForge.Application.Stats;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;
using Xunit;

namespace TempoForge.Tests;

public class StatsServiceTests
{
    [Fact]
    public async Task TodayStats_IncludesSprintJustAfterUtcMidnight_WhenLocalTimezoneIsOffset()
    {
        var originalTz = Environment.GetEnvironmentVariable("TZ");
        try
        {
            Environment.SetEnvironmentVariable("TZ", "America/Los_Angeles");
            TimeZoneInfo.ClearCachedData();

            var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new TempoForgeDbContext(options);
            var projectId = Guid.NewGuid();
            context.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Test",
                CreatedAt = DateTime.UtcNow,
                IsFavorite = false
            });

            var midnightUtc = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
            var completedAt = midnightUtc.AddMinutes(5);

            context.Sprints.Add(new Sprint
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                DurationMinutes = 25,
                StartedAt = completedAt.AddMinutes(-25),
                CompletedAt = completedAt,
                Status = SprintStatus.Completed
            });

            await context.SaveChangesAsync();

            var service = new StatsService(context, new StubQuestService());

            var stats = await service.GetTodayStatsAsync(CancellationToken.None);

            Assert.Equal(25, stats.Minutes);
            Assert.Equal(1, stats.Sprints);
            Assert.Equal(1, stats.StreakDays);
        }
        finally
        {
            Environment.SetEnvironmentVariable("TZ", originalTz);
            TimeZoneInfo.ClearCachedData();
        }
    }

    private sealed class StubQuestService : IQuestService
    {
        public Task<List<QuestDto>> GetActiveAsync(CancellationToken ct = default) => Task.FromResult(new List<QuestDto>());

        public Task<ActiveQuestsDto> GetActiveQuestsAsync(CancellationToken ct) => Task.FromResult(new ActiveQuestsDto(null, null, null));

        public Task AdvanceQuestAsync(QuestType type, int amount, CancellationToken ct) => Task.CompletedTask;

        public Task<QuestDetailDto?> ClaimRewardAsync(Guid questId, CancellationToken ct) => Task.FromResult<QuestDetailDto?>(null);
    }
}
