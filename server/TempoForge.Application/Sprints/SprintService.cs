using Microsoft.EntityFrameworkCore;
using TempoForge.Application.Quests;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;

namespace TempoForge.Application.Sprints;

public class SprintService : ISprintService
{
    private readonly TempoForgeDbContext _db;
    private readonly IQuestService _questService;

    public SprintService(TempoForgeDbContext db, IQuestService questService)
    {
        _db = db;
        _questService = questService;
    }

    public async Task<Sprint> StartAsync(StartSprintRequest request, CancellationToken ct)
    {
        if (request.ProjectId == Guid.Empty)
        {
            throw new ArgumentException("ProjectId is required", nameof(request));
        }

        if (request.DurationMinutes is < 1 or > 180)
        {
            throw new ArgumentOutOfRangeException(nameof(request.DurationMinutes), "Duration must be between 1 and 180 minutes.");
        }

        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == request.ProjectId, ct);
        if (project is null)
        {
            throw new KeyNotFoundException("Project not found");
        }

        var active = await _db.Sprints.FirstOrDefaultAsync(s => s.Status == SprintStatus.Running, ct);
        if (active is not null)
        {
            throw new InvalidOperationException("A sprint is already running");
        }

        var now = DateTime.UtcNow;
        project.LastUsedAt = now;

        var sprint = new Sprint
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            Project = project,
            DurationMinutes = request.DurationMinutes,
            StartedAt = now,
            Status = SprintStatus.Running
        };

        await _db.Sprints.AddAsync(sprint, ct);
        await _db.SaveChangesAsync(ct);
        return sprint;
    }

    public async Task<Sprint?> CompleteAsync(Guid sprintId, CancellationToken ct)
    {
        var sprint = await _db.Sprints
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == sprintId, ct);
        if (sprint is null)
        {
            return null;
        }

        if (sprint.Status != SprintStatus.Running)
        {
            throw new InvalidOperationException("Only running sprints can be completed");
        }

        var now = DateTime.UtcNow;
        sprint.Status = SprintStatus.Completed;
        sprint.CompletedAt = now;
        if (sprint.Project is not null)
        {
            sprint.Project.LastUsedAt = now;
        }

        await _db.SaveChangesAsync(ct);

        await _questService.AdvanceQuestAsync(QuestType.Daily, 1, ct);
        await _questService.AdvanceQuestAsync(QuestType.Weekly, 1, ct);
        await _questService.AdvanceQuestAsync(QuestType.Epic, 1, ct);

        return sprint;
    }

    public async Task<Sprint?> AbortAsync(Guid sprintId, CancellationToken ct)
    {
        var sprint = await _db.Sprints
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == sprintId, ct);
        if (sprint is null)
        {
            return null;
        }

        if (sprint.Status != SprintStatus.Running)
        {
            throw new InvalidOperationException("Only running sprints can be aborted");
        }

        var now = DateTime.UtcNow;
        sprint.Status = SprintStatus.Aborted;
        sprint.AbortedAt = now;
        if (sprint.Project is not null)
        {
            sprint.Project.LastUsedAt = now;
        }

        await _db.SaveChangesAsync(ct);
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

    public async Task<Sprint?> GetAsync(Guid sprintId, CancellationToken ct)
        => await _db.Sprints
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == sprintId, ct);
}
