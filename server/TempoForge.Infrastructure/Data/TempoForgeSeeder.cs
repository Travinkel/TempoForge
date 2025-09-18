using Microsoft.EntityFrameworkCore;
using TempoForge.Domain.Entities;

namespace TempoForge.Infrastructure.Data;

public static class TempoForgeSeeder
{
    public static readonly Guid ThesisProjectId = Guid.Parse("8B5E2F56-6B42-4F2C-9E63-6F4E5AC536AA");
    public static readonly Guid ClientProjectId = Guid.Parse("0C1F6F4D-3C63-4E8B-AE2D-0A2A25E93F1B");
    public static readonly Guid AlgorithmsProjectId = Guid.Parse("AE298B1D-77F4-4C07-A62F-E4F9C7C7AA21");

    public static async Task SeedAsync(TempoForgeDbContext db, CancellationToken ct = default)
    {
        await SeedProjectsAsync(db, ct);
        await SeedQuestsAsync(db, ct);
    }

    private static async Task SeedProjectsAsync(TempoForgeDbContext db, CancellationToken ct)
    {
        if (await db.Projects.AnyAsync(ct))
        {
            return;
        }

        var now = DateTime.UtcNow;
        var todayMorning = ToUtc(now.Date.AddHours(8));
        var yesterday = ToUtc(todayMorning.AddDays(-1));
        var lastWeek = ToUtc(todayMorning.AddDays(-5));

        var projects = new List<Project>
        {
            new()
            {
                Id = ThesisProjectId,
                Name = "Thesis Article",
                IsFavorite = true,
                CreatedAt = ToUtc(now.AddDays(-14)),
                LastUsedAt = ToUtc(todayMorning.AddHours(2))
            },
            new()
            {
                Id = ClientProjectId,
                Name = "Client Alpha",
                IsFavorite = false,
                CreatedAt = ToUtc(now.AddDays(-20)),
                LastUsedAt = ToUtc(yesterday.AddHours(1))
            },
            new()
            {
                Id = AlgorithmsProjectId,
                Name = "Algorithms Review",
                IsFavorite = false,
                CreatedAt = ToUtc(now.AddDays(-7)),
                LastUsedAt = ToUtc(lastWeek.AddHours(3))
            }
        };

        await db.Projects.AddRangeAsync(projects, ct);

        var sprints = new List<Sprint>
        {
            new()
            {
                Id = Guid.Parse("54A1C4CB-1F87-41D7-8808-9844B1963B1F"),
                ProjectId = ThesisProjectId,
                DurationMinutes = 45,
                StartedAt = ToUtc(todayMorning.AddHours(-2)),
                CompletedAt = ToUtc(todayMorning.AddHours(-1.25)),
                Status = SprintStatus.Completed
            },
            new()
            {
                Id = Guid.Parse("A4EFDA65-6B5E-4A0D-83FE-3B8CB500F31D"),
                ProjectId = ClientProjectId,
                DurationMinutes = 30,
                StartedAt = ToUtc(yesterday.AddHours(4)),
                CompletedAt = ToUtc(yesterday.AddHours(4.5)),
                Status = SprintStatus.Completed
            },
            new()
            {
                Id = Guid.Parse("6CE8D114-6C6D-4C1F-96E9-45F742F3B4EB"),
                ProjectId = AlgorithmsProjectId,
                DurationMinutes = 20,
                StartedAt = ToUtc(lastWeek.AddHours(2)),
                AbortedAt = ToUtc(lastWeek.AddHours(2.5)),
                Status = SprintStatus.Aborted
            }
        };

        await db.Sprints.AddRangeAsync(sprints, ct);
        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedQuestsAsync(TempoForgeDbContext db, CancellationToken ct)
    {
        if (await db.Quests.AnyAsync(ct))
        {
            return;
        }

        var now = DateTime.UtcNow;
        var dailyExpiry = ToUtc(now.Date.AddDays(1));
        var weeklyExpiry = ToUtc(GetNextMonday(now));
        var epicExpiry = DateTime.SpecifyKind(DateTime.MaxValue, DateTimeKind.Utc);

        var quests = new List<Quest>
        {
            new()
            {
                Id = Guid.Parse("E02A8019-59D3-4C2C-9CA3-71EE7FF5A715"),
                Name = "Complete 3 sprints today",
                Type = QuestType.Daily,
                Goal = 3,
                Progress = 0,
                Reward = "Daily momentum",
                ExpiresAt = dailyExpiry
            },
            new()
            {
                Id = Guid.Parse("B8936F1C-AC96-4B28-831F-C0CCF671E588"),
                Name = "Complete 15 sprints this week",
                Type = QuestType.Weekly,
                Goal = 15,
                Progress = 0,
                Reward = "Weekly chest",
                ExpiresAt = weeklyExpiry
            },
            new()
            {
                Id = Guid.Parse("7A20E670-8CE9-4F5F-9675-0A1F6B65BF54"),
                Name = "Reach 100 total sprints",
                Type = QuestType.Epic,
                Goal = 100,
                Progress = 0,
                Reward = "Epic banner",
                ExpiresAt = epicExpiry
            }
        };

        await db.Quests.AddRangeAsync(quests, ct);
        await db.SaveChangesAsync(ct);
    }

    private static DateTime ToUtc(DateTime value)
        => DateTime.SpecifyKind(value, DateTimeKind.Utc);

    private static DateTime GetNextMonday(DateTime value)
    {
        var daysUntilMonday = ((int)DayOfWeek.Monday - (int)value.DayOfWeek + 7) % 7;
        if (daysUntilMonday == 0)
        {
            daysUntilMonday = 7;
        }

        return value.Date.AddDays(daysUntilMonday);
    }
}
