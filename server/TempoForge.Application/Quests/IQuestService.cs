using TempoForge.Domain.Entities;

namespace TempoForge.Application.Quests;

public interface IQuestService
{
    Task<List<QuestDto>> GetActiveAsync(CancellationToken ct = default);
    Task<ActiveQuestsDto> GetActiveQuestsAsync(CancellationToken ct);
    Task AdvanceQuestAsync(QuestType type, int amount, CancellationToken ct);
    Task<QuestDetailDto?> ClaimRewardAsync(Guid questId, CancellationToken ct);
}
