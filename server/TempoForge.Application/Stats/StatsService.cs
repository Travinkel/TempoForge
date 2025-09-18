using Microsoft.EntityFrameworkCore;
using TempoForge.Application.Quests;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;

namespace TempoForge.Application.Stats;

public class StatsService : IStatsService
{
    private const int DefaultDailyGoal = 3;
    private const int DefaultWeeklyGoal = 15;
    private const int DefaultEpicGoal = 100;
    private const int BronzeTarget = 20;
    private const int SilverTarget = 50;
    private static readonly TimeSpan StreakLookbackWindow = TimeSpan.FromDays(30);

    private readonly TempoForgeDbContext _db;
    private readonly IQuestService _questService;

    public StatsService(TempoForgeDbContext db, IQuestService questService)
    {
        _db = db;
        _questService = questService;
    }

    public async Task<TodayStatsDto> GetTodayStatsAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var startOfDay = now.Date;
        var endOfDay = startOfDay.AddDays(1);

        var todaysSprints = await _db.Sprints
            .AsNoTracking()
            .Where(s => s.Status == SprintStatus.Completed && s.CompletedAt >= startOfDay && s.CompletedAt < endOfDay)
            .Select(s => new { s.DurationMinutes })
            .ToListAsync(ct);

        var minutes = todaysSprints.Sum(s => s.DurationMinutes);
        var count = todaysSprints.Count;
        var streak = await CalculateStreakAsync(startOfDay, ct);

        return new TodayStatsDto(minutes, count, streak);
    }

    public async Task<ProgressDto> GetProgressAsync(CancellationToken ct)
    {
        var totalCompleted = await _db.Sprints.CountAsync(s => s.Status == SprintStatus.Completed, ct);
        var (standing, nextThreshold, percentToNext) = CalculateStanding(totalCompleted);

        var activeQuests = await _questService.GetActiveQuestsAsync(ct);
        var snapshot = BuildQuestSnapshot(activeQuests);

        return new ProgressDto(standing, percentToNext, totalCompleted, nextThreshold, snapshot);
    }

    private async Task<int> CalculateStreakAsync(DateTime startOfDayUtc, CancellationToken ct)
    {
        var lookbackStart = startOfDayUtc.Subtract(StreakLookbackWindow);
        var endExclusive = startOfDayUtc.AddDays(1);

        var completionsByDay = await _db.Sprints
            .Where(s => s.Status == SprintStatus.Completed && s.CompletedAt >= lookbackStart && s.CompletedAt < endExclusive)
            .GroupBy(s => s.CompletedAt!.Value.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var completionLookup = completionsByDay.ToDictionary(x => x.Date, x => x.Count);

        var cursor = startOfDayUtc;
        var streak = 0;
        while (completionLookup.TryGetValue(cursor, out var dailyCount) && dailyCount >= DefaultDailyGoal)
        {
            streak++;
            cursor = cursor.AddDays(-1);
        }

        return streak;
    }

    private static (string Standing, int? NextThreshold, int PercentToNext) CalculateStanding(int totalCompleted)
    {
        if (totalCompleted < BronzeTarget)
        {
            var percent = BronzeTarget == 0 ? 100 : (int)Math.Clamp(totalCompleted / (double)BronzeTarget * 100, 0, 100);
            return ("Bronze", BronzeTarget, percent);
        }

        if (totalCompleted < SilverTarget)
        {
            var progress = totalCompleted - BronzeTarget;
            var target = SilverTarget - BronzeTarget;
            var percent = target == 0 ? 100 : (int)Math.Clamp(progress / (double)target * 100, 0, 100);
            return ("Silver", SilverTarget, percent);
        }

        return ("Gold", null, 100);
    }

    private static QuestSnapshot BuildQuestSnapshot(ActiveQuestsDto quests)
    {
        var dailyGoal = quests.Daily?.Goal ?? DefaultDailyGoal;
        var dailyProgress = quests.Daily?.Progress ?? 0;
        var weeklyGoal = quests.Weekly?.Goal ?? DefaultWeeklyGoal;
        var weeklyProgress = quests.Weekly?.Progress ?? 0;
        var epicGoal = quests.Epic?.Goal ?? DefaultEpicGoal;
        var epicProgress = quests.Epic?.Progress ?? 0;

        return new QuestSnapshot(dailyGoal, dailyProgress, weeklyGoal, weeklyProgress, epicGoal, epicProgress);
    }
}
