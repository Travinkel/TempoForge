using Microsoft.EntityFrameworkCore;
using TempoForge.Domain.Entities;

namespace TempoForge.Infrastructure.Data;

public class TempoForgeDbContext : DbContext
{
    public TempoForgeDbContext(DbContextOptions<TempoForgeDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Sprint> Sprints => Set<Sprint>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var project = modelBuilder.Entity<Project>();
        project.HasKey(x => x.Id);
        project.Property(x => x.Name).IsRequired().HasMaxLength(80);
        project.Property(x => x.Track).HasConversion<int>();
        project.Property(x => x.Pinned).HasDefaultValue(false);
        project.Property(x => x.IsFavorite).HasDefaultValue(false);
        project.Property(x => x.CreatedAt).HasColumnType("timestamptz");
        project.HasIndex(x => x.Track);

        var sprint = modelBuilder.Entity<Sprint>();
        sprint.HasKey(x => x.Id);
        sprint.HasIndex(x => x.ProjectId);
        sprint.Property(x => x.DurationMinutes).IsRequired();
        sprint.Property(x => x.StartedAt).HasColumnType("timestamptz").HasDefaultValueSql("NOW()");
        sprint.Property(x => x.CompletedAt).HasColumnType("timestamptz");
        sprint.Property(x => x.AbortedAt).HasColumnType("timestamptz");
        sprint.Property(x => x.Status).HasConversion<int>();
        sprint.HasOne(x => x.Project)
            .WithMany()
            .HasForeignKey(x => x.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
        sprint.ToTable("Sprints", t => t.HasCheckConstraint("CK_Sprints_Duration_Minutes", "\"DurationMinutes\" > 0"));
        sprint.HasIndex(x => x.Status)
            .HasDatabaseName("IX_Sprints_Running")
            .HasFilter("\"Status\" = 1")
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}

