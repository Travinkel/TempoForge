using Microsoft.EntityFrameworkCore;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;

namespace TempoForge.Application.Projects;

public class ProjectService : IProjectService
{
    private readonly TempoForgeDbContext _db;

    public ProjectService(TempoForgeDbContext db)
    {
        _db = db;
    }

    public async Task<Project> CreateAsync(ProjectCreateDto dto, CancellationToken ct)
    {
        if (dto.Name is null)
        {
            throw new ArgumentNullException(nameof(dto.Name));
        }

        var name = dto.Name.Trim();
        if (name.Length is < 3 or > 80)
        {
            throw new ArgumentOutOfRangeException(nameof(dto.Name), "Name must be between 3 and 80 characters.");
        }

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = name,
            IsFavorite = dto.IsFavorite,
            CreatedAt = DateTime.UtcNow
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync(ct);
        return project;
    }

    public async Task<Project?> GetAsync(Guid id, CancellationToken ct)
        => await _db.Projects.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<List<Project>> GetAllAsync(CancellationToken ct)
        => await _db.Projects
            .OrderByDescending(x => x.LastUsedAt ?? x.CreatedAt)
            .ToListAsync(ct);

    public async Task<List<Project>> GetFavoritesAsync(CancellationToken ct)
        => await _db.Projects
            .Where(x => x.IsFavorite)
            .OrderByDescending(x => x.LastUsedAt ?? x.CreatedAt)
            .ToListAsync(ct);

    public async Task<Project?> UpdateAsync(Guid id, ProjectUpdateDto dto, CancellationToken ct)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (project is null)
        {
            return null;
        }

        if (dto.Name is not null)
        {
            var name = dto.Name.Trim();
            if (name.Length is < 3 or > 80)
            {
                throw new ArgumentOutOfRangeException(nameof(dto.Name));
            }

            project.Name = name;
        }

        if (dto.IsFavorite.HasValue)
        {
            project.IsFavorite = dto.IsFavorite.Value;
        }

        await _db.SaveChangesAsync(ct);
        return project;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (project is null)
        {
            return false;
        }

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
