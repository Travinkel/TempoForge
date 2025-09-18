namespace TempoForge.Domain.Entities;

public enum Track
{
    Work = 1,
    Study = 2
}

public class Project
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Track Track { get; set; }
    public bool Pinned { get; set; }
    public bool IsFavorite { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}