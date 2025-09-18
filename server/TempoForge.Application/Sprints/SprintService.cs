using System.Linq;
using Microsoft.EntityFrameworkCore;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;

namespace TempoForge.Application.Sprints;

public class SprintService : ISprintService
{
    private const int DailyGoal = 3;
    private const int WeeklyGoal = 15;
    private readonly TempoForgeDbContext _db;

    public SprintService(TempoForgeDbContext db)
    {
        _db = db;
    }

    public async Task<Sprint> StartAsync(StartSprintRequest request, CancellationToken ct)
    {
        if (request.ProjectId == Guid.Empty)
            throw new ArgumentException("ProjectId is required", nameof(request));

        var projectExists = await _db.Projects.AnyAsync(p => p.Id == request.ProjectId, ct);
        if (!projectExists)
            throw new KeyNotFoundException("Project not found");

        var active = await _db.Sprints.FirstOrDefaultAsync(s => s.Status == SprintStatus.Running, ct);
        if (active is not null)
            throw new InvalidOperationException("A sprint is already running");

        var sprint = new Sprint
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            DurationMinutes = request.DurationMinutes,
            StartedAt = DateTime.UtcNow,
            Status = SprintStatus.Running
        };

        await _db.Sprints.AddAsync(sprint, ct);
        await _db.SaveChangesAsync(ct);
        await _db.Entry(sprint).Reference(s => s.Project).LoadAsync(ct);
        return sprint;
    }

    public async Task<Sprint?> CompleteAsync(Guid sprintId, CancellationToken ct)
    {
        var sprint = await _db.Sprints.FirstOrDefaultAsync(s => s.Id == sprintId, ct);
        if (sprint is null)
            return null;
        if (sprint.Status != SprintStatus.Running)
            throw new InvalidOperationException("Only running sprints can be completed");

        sprint.Status = SprintStatus.Completed;
        sprint.CompletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        await _db.Entry(sprint).Reference(s => s.Project).LoadAsync(ct);
        return sprint;
    }

    public async Task<Sprint?> AbortAsync(Guid sprintId, CancellationToken ct)
    {
        var sprint = await _db.Sprints.FirstOrDefaultAsync(s => s.Id == sprintId, ct);
        if (sprint is null)
            return null;
        if (sprint.Status != SprintStatus.Running)
            throw new InvalidOperationException("Only running sprints can be aborted");

        sprint.Status = SprintStatus.Aborted;
        sprint.AbortedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        await _db.Entry(sprint).Reference(s => s.Project).LoadAsync(ct);
        return sprint;
    }

    public async Task<Sprint?> GetRunningAsync(CancellationToken ct)
        => await _db.Sprints
            .AsNoTracking()
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Status == SprintStatus.Running, ct);

    public async Task<List<Sprint>> GetRecentAsync(int take, CancellationToken ct)
    {
        take = take <= 0 ? 5 : take;
        return await _db.Sprints
            .AsNoTracking()
            .Include(s => s.Project)
            .OrderByDescending(s => s.StartedAt)
            .Take(take)
            .ToListAsync(ct);
    }

    public async Task<TodayStatsDto> GetTodayStatsAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var startOfDay = now.Date;
        var endOfDay = startOfDay.AddDays(1);

        var today = await _db.Sprints
            .Where(s => s.Status == SprintStatus.Completed && s.CompletedAt >= startOfDay && s.CompletedAt < endOfDay)
            .ToListAsync(ct);

        var minutes = today.Sum(s => s.DurationMinutes);
        var count = today.Count;
        var streak = await CalculateStreakAsync(startOfDay, ct);
        return new TodayStatsDto(count, minutes, streak);
    }

    public async Task<ProgressDto> GetProgressAsync(CancellationToken ct)
    {
        var totalCompleted = await _db.Sprints.CountAsync(s => s.Status == SprintStatus.Completed, ct);
        var (standing, nextThreshold, percentToNext) = CalculateStanding(totalCompleted);

        var now = DateTime.UtcNow;
        var startOfDay = now.Date;
        var endOfDay = startOfDay.AddDays(1);
        var startOfWeek = startOfDay.AddDays(-6);

        var dailyCompleted = await _db.Sprints.CountAsync(s =>
            s.Status == SprintStatus.Completed && s.CompletedAt >= startOfDay && s.CompletedAt < endOfDay, ct);

        var weeklyCompleted = await _db.Sprints.CountAsync(s =>
            s.Status == SprintStatus.Completed && s.CompletedAt >= startOfWeek && s.CompletedAt < endOfDay, ct);

        return new ProgressDto(standing, totalCompleted, percentToNext, nextThreshold)
        {
            Quest = new QuestSnapshot(DailyGoal, dailyCompleted, WeeklyGoal, weeklyCompleted)
        };
    }

    public async Task<Sprint?> GetAsync(Guid sprintId, CancellationToken ct)
        => await _db.Sprints
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == sprintId, ct);

    private async Task<int> CalculateStreakAsync(DateTime startOfDayUtc, CancellationToken ct)
    {
        var lookbackStart = startOfDayUtc.AddDays(-30);
        var endExclusive = startOfDayUtc.AddDays(1);
        var completionsByDay = await _db.Sprints
            .Where(s => s.Status == SprintStatus.Completed && s.CompletedAt >= lookbackStart && s.CompletedAt < endExclusive)
            .GroupBy(s => s.CompletedAt!.Value.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var completionLookup = completionsByDay.ToDictionary(x => x.Date, x => x.Count);

        var cursor = startOfDayUtc;
        var streak = 0;
        while (completionLookup.TryGetValue(cursor, out var dailyCount) && dailyCount >= DailyGoal)
        {
            streak++;
            cursor = cursor.AddDays(-1);
        }

        return streak;
    }

    private static (string Standing, int? NextThreshold, double PercentToNext) CalculateStanding(int totalCompleted)
    {
        const int BronzeUpper = 20;
        const int SilverUpper = 50;

        if (totalCompleted < BronzeUpper)
        {
            var percent = BronzeUpper == 0 ? 1 : totalCompleted / (double)BronzeUpper;
            return ("Bronze", BronzeUpper, Math.Clamp(percent, 0, 1));
        }

        if (totalCompleted < SilverUpper)
        {
            var progress = totalCompleted - BronzeUpper;
            var span = SilverUpper - BronzeUpper;
            var percent = span == 0 ? 1 : progress / (double)span;
            return ("Silver", SilverUpper, Math.Clamp(percent, 0, 1));
        }

        return ("Gold", null, 1);
    }
}
