using Microsoft.EntityFrameworkCore;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;

namespace TempoForge.Application.Quests;

public class QuestService : IQuestService
{
    private readonly TempoForgeDbContext _db;

    public QuestService(TempoForgeDbContext db)
    {
        _db = db;
    }

    public async Task<ActiveQuestsDto> GetActiveQuestsAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var quests = await _db.Quests
            .OrderBy(q => q.Type)
            .ToListAsync(ct);

        var dirty = false;
        foreach (var quest in quests)
        {
            dirty |= EnsureCurrent(quest, now);
        }

        if (dirty)
        {
            await _db.SaveChangesAsync(ct);
        }

        var daily = quests.FirstOrDefault(q => q.Type == QuestType.Daily);
        var weekly = quests.FirstOrDefault(q => q.Type == QuestType.Weekly);
        var epic = quests.FirstOrDefault(q => q.Type == QuestType.Epic);

        return new ActiveQuestsDto(Map(daily), Map(weekly), Map(epic));
    }

    public async Task AdvanceQuestAsync(QuestType type, int amount, CancellationToken ct)
    {
        if (amount <= 0)
        {
            return;
        }

        var now = DateTime.UtcNow;
        var quest = await _db.Quests.FirstOrDefaultAsync(q => q.Type == type, ct);
        if (quest is null)
        {
            return;
        }

        var modified = EnsureCurrent(quest, now);
        var newProgress = quest.Progress + amount;
        quest.Progress = quest.Type == QuestType.Epic ? newProgress : Math.Min(quest.Goal, newProgress);
        if (quest.Progress < quest.Goal)
        {
            quest.RewardClaimed = false;
        }

        if (modified || amount > 0)
        {
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<QuestDto?> ClaimRewardAsync(Guid questId, CancellationToken ct)
    {
        var quest = await _db.Quests.FirstOrDefaultAsync(q => q.Id == questId, ct);
        if (quest is null)
        {
            return null;
        }

        var now = DateTime.UtcNow;
        var modified = EnsureCurrent(quest, now);
        if (modified)
        {
            await _db.SaveChangesAsync(ct);
        }

        if (quest.Progress < quest.Goal)
        {
            throw new InvalidOperationException("Quest has not reached its goal yet.");
        }

        if (quest.RewardClaimed)
        {
            throw new InvalidOperationException("Quest reward already claimed.");
        }

        quest.RewardClaimed = true;
        await _db.SaveChangesAsync(ct);
        return Map(quest);
    }

    private static bool EnsureCurrent(Quest quest, DateTime now)
    {
        if (quest.Type == QuestType.Epic)
        {
            var epicExpiry = DateTime.SpecifyKind(DateTime.MaxValue, DateTimeKind.Utc);
            if (quest.ExpiresAt != epicExpiry)
            {
                quest.ExpiresAt = epicExpiry;
                return true;
            }

            return false;
        }

        if (quest.ExpiresAt > now)
        {
            return false;
        }

        var nextExpiry = quest.Type switch
        {
            QuestType.Daily => GetNextDailyExpiry(now),
            QuestType.Weekly => GetNextWeeklyExpiry(now),
            _ => now
        };

        quest.Reset(nextExpiry);
        return true;
    }

    private static DateTime GetNextDailyExpiry(DateTime reference)
    {
        var nextDay = reference.Date.AddDays(1);
        return DateTime.SpecifyKind(nextDay, DateTimeKind.Utc);
    }

    private static DateTime GetNextWeeklyExpiry(DateTime reference)
    {
        var daysUntilMonday = ((int)DayOfWeek.Monday - (int)reference.DayOfWeek + 7) % 7;
        if (daysUntilMonday == 0)
        {
            daysUntilMonday = 7;
        }

        var nextMonday = reference.Date.AddDays(daysUntilMonday);
        return DateTime.SpecifyKind(nextMonday, DateTimeKind.Utc);
    }

    private static QuestDto? Map(Quest? quest)
        => quest is null
            ? null
            : new QuestDto(
                quest.Id,
                quest.Name,
                quest.Type,
                quest.Goal,
                quest.Progress,
                quest.Reward,
                quest.ExpiresAt,
                quest.RewardClaimed);
}
