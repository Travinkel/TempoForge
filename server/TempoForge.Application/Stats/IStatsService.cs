namespace TempoForge.Application.Stats;

public interface IStatsService
{
    Task<TodayStatsDto> GetTodayStatsAsync(CancellationToken ct);
    Task<ProgressDto> GetProgressAsync(CancellationToken ct);
}
