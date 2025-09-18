using Microsoft.EntityFrameworkCore;
using TempoForge.Application.Quests;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;
using Xunit;

namespace TempoForge.Tests;

public class QuestServiceTests
{
    private static TempoForgeDbContext CreateContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<TempoForgeDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;
        return new TempoForgeDbContext(options);
    }

    [Fact]
    public async Task AdvanceQuestAsync_CapsDailyProgressAtGoal()
    {
        await using var db = CreateContext(nameof(AdvanceQuestAsync_CapsDailyProgressAtGoal));
        db.Quests.Add(new Quest
        {
            Id = Guid.NewGuid(),
            Name = "Daily",
            Type = QuestType.Daily,
            Goal = 3,
            Progress = 2,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        });
        await db.SaveChangesAsync();

        var sut = new QuestService(db);
        await sut.AdvanceQuestAsync(QuestType.Daily, 5, CancellationToken.None);

        var quest = await db.Quests.SingleAsync();
        Assert.Equal(3, quest.Progress);
        Assert.False(quest.RewardClaimed);
    }

    [Fact]
    public async Task AdvanceQuestAsync_PersistsEpicBeyondGoal()
    {
        await using var db = CreateContext(nameof(AdvanceQuestAsync_PersistsEpicBeyondGoal));
        db.Quests.Add(new Quest
        {
            Id = Guid.NewGuid(),
            Name = "Epic",
            Type = QuestType.Epic,
            Goal = 100,
            Progress = 98,
            ExpiresAt = DateTime.SpecifyKind(DateTime.MaxValue, DateTimeKind.Utc)
        });
        await db.SaveChangesAsync();

        var sut = new QuestService(db);
        await sut.AdvanceQuestAsync(QuestType.Epic, 5, CancellationToken.None);

        var quest = await db.Quests.SingleAsync();
        Assert.Equal(103, quest.Progress);
    }

    [Fact]
    public async Task GetActiveQuestsAsync_ResetsExpiredDaily()
    {
        await using var db = CreateContext(nameof(GetActiveQuestsAsync_ResetsExpiredDaily));
        var dailyId = Guid.NewGuid();
        db.Quests.AddRange(
            new Quest
            {
                Id = dailyId,
                Name = "Daily",
                Type = QuestType.Daily,
                Goal = 3,
                Progress = 2,
                ExpiresAt = DateTime.UtcNow.AddMinutes(-5)
            },
            new Quest
            {
                Id = Guid.NewGuid(),
                Name = "Weekly",
                Type = QuestType.Weekly,
                Goal = 10,
                Progress = 5,
                ExpiresAt = DateTime.UtcNow.AddDays(2)
            });
        await db.SaveChangesAsync();

        var sut = new QuestService(db);
        var quests = await sut.GetActiveQuestsAsync(CancellationToken.None);

        Assert.NotNull(quests.Daily);
        Assert.Equal(0, quests.Daily!.Progress);
        Assert.True(quests.Daily.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task ClaimRewardAsync_ThrowsWhenIncomplete()
    {
        await using var db = CreateContext(nameof(ClaimRewardAsync_ThrowsWhenIncomplete));
        var questId = Guid.NewGuid();
        db.Quests.Add(new Quest
        {
            Id = questId,
            Name = "Daily",
            Type = QuestType.Daily,
            Goal = 3,
            Progress = 1,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        });
        await db.SaveChangesAsync();

        var sut = new QuestService(db);

        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.ClaimRewardAsync(questId, CancellationToken.None));
    }

    [Fact]
    public async Task ClaimRewardAsync_MarksQuestClaimed()
    {
        await using var db = CreateContext(nameof(ClaimRewardAsync_MarksQuestClaimed));
        var questId = Guid.NewGuid();
        db.Quests.Add(new Quest
        {
            Id = questId,
            Name = "Daily",
            Type = QuestType.Daily,
            Goal = 2,
            Progress = 2,
            Reward = "Badge",
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        });
        await db.SaveChangesAsync();

        var sut = new QuestService(db);
        var claimed = await sut.ClaimRewardAsync(questId, CancellationToken.None);

        Assert.NotNull(claimed);
        Assert.True(claimed!.RewardClaimed);

        var quest = await db.Quests.SingleAsync();
        Assert.True(quest.RewardClaimed);
    }
}
