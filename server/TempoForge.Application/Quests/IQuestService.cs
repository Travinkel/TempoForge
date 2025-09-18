using TempoForge.Domain.Entities;

namespace TempoForge.Application.Quests;

public interface IQuestService
{
    Task<ActiveQuestsDto> GetActiveQuestsAsync(CancellationToken ct);
    Task AdvanceQuestAsync(QuestType type, int amount, CancellationToken ct);
    Task<QuestDto?> ClaimRewardAsync(Guid questId, CancellationToken ct);
}
