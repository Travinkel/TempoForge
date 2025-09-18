using TempoForge.Domain.Entities;

namespace TempoForge.Application.Quests;

public record QuestDto(
    Guid Id,
    string Name,
    QuestType Type,
    int Goal,
    int Progress,
    string? Reward,
    DateTime ExpiresAt,
    bool RewardClaimed);

public record ActiveQuestsDto(QuestDto? Daily, QuestDto? Weekly, QuestDto? Epic);
