using Microsoft.EntityFrameworkCore;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;

namespace TempoForge.Application.Projects;

public class ProjectService : IProjectService
{
    private readonly TempoForgeDbContext _db;
    public ProjectService(TempoForgeDbContext db) => _db = db;

    public async Task<Project> CreateAsync(ProjectCreateDto dto, CancellationToken ct)
    {
        if (dto.Name is null || dto.Name.Trim().Length < 3 || dto.Name.Length > 80)
            throw new ArgumentOutOfRangeException(nameof(dto.Name), "Name must be 3..80");
        if (dto.Track is null) throw new ArgumentNullException(nameof(dto.Track));

        var p = new Project
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Track = dto.Track.Value,
            Pinned = dto.Pinned,
            CreatedAt = DateTime.UtcNow
        };
        _db.Projects.Add(p);
        await _db.SaveChangesAsync(ct);
        return p;
    }

    public async Task<Project?> GetAsync(Guid id, CancellationToken ct)
        => await _db.Projects.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<List<Project>> GetAllAsync(CancellationToken ct)
        => await _db.Projects.OrderByDescending(x => x.CreatedAt).ToListAsync(ct);

    public async Task<Project?> UpdateAsync(Guid id, ProjectUpdateDto dto, CancellationToken ct)
    {
        var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return null;
        if (dto.Name is not null)
        {
            var name = dto.Name.Trim();
            if (name.Length < 3 || name.Length > 80) throw new ArgumentOutOfRangeException(nameof(dto.Name));
            p.Name = name;
        }
        if (dto.Track is not null) p.Track = dto.Track.Value;
        if (dto.Pinned.HasValue) p.Pinned = dto.Pinned.Value;
        await _db.SaveChangesAsync(ct);
        return p;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return false;
        _db.Projects.Remove(p);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}