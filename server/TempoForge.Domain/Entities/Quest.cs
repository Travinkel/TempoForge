namespace TempoForge.Domain.Entities;

public enum QuestType
{
    Daily = 0,
    Weekly = 1,
    Epic = 2
}

public class Quest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public QuestType Type { get; set; }
    public int Goal { get; set; }
    public int Progress { get; set; }
    public string? Reward { get; set; }
    public DateTime ExpiresAt { get; set; }
    public Guid? UserProfileId { get; set; }
    public bool RewardClaimed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public void Reset(DateTime newExpiry)
    {
        Progress = 0;
        RewardClaimed = false;
        ExpiresAt = newExpiry;
    }

    public double CompletionPercent => Goal <= 0 ? 1d : Math.Clamp(Progress / (double)Goal, 0d, 1d);
}
