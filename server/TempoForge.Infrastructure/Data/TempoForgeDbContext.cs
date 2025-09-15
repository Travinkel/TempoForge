using Microsoft.EntityFrameworkCore;
using TempoForge.Domain.Entities;

namespace TempoForge.Infrastructure.Data;

public class TempoForgeDbContext : DbContext
{
    public TempoForgeDbContext(DbContextOptions<TempoForgeDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var p = modelBuilder.Entity<Project>();
        p.HasKey(x => x.Id);
        p.Property(x => x.Name).IsRequired().HasMaxLength(80);
        p.Property(x => x.Track).HasConversion<int>();
        p.Property(x => x.Pinned).HasDefaultValue(false);
        p.Property(x => x.CreatedAt).HasColumnType("timestamptz");
        p.HasIndex(x => x.Track);
        base.OnModelCreating(modelBuilder);
    }
}