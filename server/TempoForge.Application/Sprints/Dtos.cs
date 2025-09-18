using System.ComponentModel.DataAnnotations;
using TempoForge.Domain.Entities;

namespace TempoForge.Application.Sprints;

/// <summary>
/// Request payload used to start a new sprint for a project.
/// </summary>
public record StartSprintRequest(
    [property: Required] Guid ProjectId,
    [property: Range(1, 180)] int DurationMinutes
);

/// <summary>
/// Projection describing a sprint and related project metadata.
/// </summary>
public record SprintDto(
    Guid Id,
    Guid ProjectId,
    string ProjectName,
    int DurationMinutes,
    DateTime StartedAtUtc,
    DateTime? CompletedAtUtc,
    DateTime? AbortedAtUtc,
    SprintStatus Status
)
{
    public static SprintDto From(Sprint sprint) => new(
        sprint.Id,
        sprint.ProjectId,
        sprint.Project?.Name ?? string.Empty,
        sprint.DurationMinutes,
        sprint.StartedAt,
        sprint.CompletedAt,
        sprint.AbortedAt,
        sprint.Status);
}

/// <summary>
/// Summary row for displaying recent sprint activity.
/// </summary>
public record RecentSprintDto(
    Guid Id,
    string ProjectName,
    int DurationMinutes,
    DateTime StartedAtUtc,
    SprintStatus Status
)
{
    public static RecentSprintDto From(Sprint sprint) => new(
        sprint.Id,
        sprint.Project?.Name ?? string.Empty,
        sprint.DurationMinutes,
        sprint.StartedAt,
        sprint.Status);
}

/// <summary>
/// Daily metrics for sprint activity.
/// </summary>
public record TodayStatsDto(int SprintCount, int MinutesFocused, int StreakDays);

/// <summary>
/// Progress metrics representing the user standing across all completed sprints.
/// </summary>
public record ProgressDto(
    string Standing,
    int CompletedSprints,
    double PercentToNext,
    int? NextThreshold
)
{
    public QuestSnapshot Quest { get; init; } = new(0, 0, 0, 0);
}

public record QuestSnapshot(int DailyGoal, int DailyCompleted, int WeeklyGoal, int WeeklyCompleted);

