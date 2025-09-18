using TempoForge.Domain.Entities;

namespace TempoForge.Application.Stats;

public record TodayStatsDto(int Minutes, int Sprints, int StreakDays);

public record QuestSnapshot(
    int DailyGoal,
    int DailyCompleted,
    int WeeklyGoal,
    int WeeklyCompleted,
    int EpicGoal,
    int EpicCompleted);

public record ProgressDto(
    string Standing,
    int PercentToNext,
    int TotalCompleted,
    int? NextThreshold,
    QuestSnapshot Quest);
