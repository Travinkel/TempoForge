namespace TempoForge.Domain.Entities;

public enum SprintStatus
{
    Running = 1,
    Completed = 2,
    Aborted = 3
}

public class Sprint
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }
    public int DurationMinutes { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? AbortedAt { get; set; }
    public SprintStatus Status { get; set; }
}

