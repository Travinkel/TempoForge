using TempoForge.Domain.Entities;

namespace TempoForge.Application.Sprints;

public interface ISprintService
{
    Task<Sprint> StartAsync(StartSprintRequest request, CancellationToken ct);
    Task<Sprint?> CompleteAsync(Guid sprintId, CancellationToken ct);
    Task<Sprint?> AbortAsync(Guid sprintId, CancellationToken ct);
    Task<Sprint?> GetRunningAsync(CancellationToken ct);
    Task<List<Sprint>> GetRecentAsync(int take, CancellationToken ct);
    Task<Sprint?> GetAsync(Guid sprintId, CancellationToken ct);
}
