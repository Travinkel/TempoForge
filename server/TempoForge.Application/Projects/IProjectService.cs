using TempoForge.Domain.Entities;

namespace TempoForge.Application.Projects;

public interface IProjectService
{
    Task<Project> CreateAsync(ProjectCreateDto dto, CancellationToken ct);
    Task<Project?> GetAsync(Guid id, CancellationToken ct);
    Task<List<Project>> GetAllAsync(CancellationToken ct);
    Task<Project?> UpdateAsync(Guid id, ProjectUpdateDto dto, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}