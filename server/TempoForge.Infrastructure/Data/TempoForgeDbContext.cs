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
    public DbSet<Quest> Quests => Set<Quest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var project = modelBuilder.Entity<Project>();
        project.HasKey(x => x.Id);
        project.Property(x => x.Name).IsRequired().HasMaxLength(80);
        project.Property(x => x.IsFavorite).HasDefaultValue(false);
        project.Property(x => x.CreatedAt).HasColumnType("timestamptz");
        project.Property(x => x.LastUsedAt).HasColumnType("timestamptz");
        project.HasIndex(x => x.IsFavorite);
        project.HasIndex(x => x.LastUsedAt);

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
            .HasFilter("\"Status\" = 0")
            .IsUnique();

        var quest = modelBuilder.Entity<Quest>();
        quest.HasKey(x => x.Id);
        quest.Property(x => x.Name).IsRequired().HasMaxLength(120);
        quest.Property(x => x.Type).HasConversion<int>();
        quest.Property(x => x.Goal).IsRequired();
        quest.Property(x => x.Progress).IsRequired().HasDefaultValue(0);
        quest.Property(x => x.Reward).HasMaxLength(200);
        quest.Property(x => x.RewardClaimed).HasDefaultValue(false);
        quest.Property(x => x.ExpiresAt).HasColumnType("timestamptz").IsRequired();
        quest.Property(x => x.CreatedAt).HasColumnType("timestamptz");
        quest.Property(x => x.UserProfileId);
        quest.ToTable("Quests", t =>
        {
            t.HasCheckConstraint("CK_Quests_Goal", "\"Goal\" >= 0");
            t.HasCheckConstraint("CK_Quests_Progress", "\"Progress\" >= 0");
        });
        quest.HasIndex(x => x.Type).IsUnique();
        quest.HasIndex(x => x.ExpiresAt);

        base.OnModelCreating(modelBuilder);
    }
}
