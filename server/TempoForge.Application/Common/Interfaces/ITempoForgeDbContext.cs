using Microsoft.EntityFrameworkCore;
using TempoForge.Domain.Entities;

namespace TempoForge.Application.Common.Interfaces;

public interface ITempoForgeDbContext
{
    DbSet<Project> Projects { get; }
    DbSet<Sprint> Sprints { get; }
    DbSet<Quest> Quests { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
