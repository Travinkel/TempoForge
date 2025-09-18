using TempoForge.Domain.Entities;

namespace TempoForge.Application.Quests;

public record QuestDto(
    string Title,
    string Type,
    int Goal,
    int Progress,
    bool Completed);

public record QuestDetailDto(
    Guid Id,
    string Name,
    QuestType Type,
    int Goal,
    int Progress,
    string? Reward,
    DateTime ExpiresAt,
    bool RewardClaimed);

public record ActiveQuestsDto(QuestDetailDto? Daily, QuestDetailDto? Weekly, QuestDetailDto? Epic);
