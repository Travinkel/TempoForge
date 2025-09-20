using Microsoft.AspNetCore.Mvc;
using TempoForge.Application.Stats;

namespace TempoForge.Api.Controllers;

/// <summary>
/// Provides aggregated sprint statistics.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly IStatsService _statsService;

    public StatsController(IStatsService statsService)
    {
        _statsService = statsService;
    }

    /// <summary>
    /// Retrieves today's focused minutes, sprint count, and streak length.
    /// </summary>
    [HttpGet("today")]
    [ProducesResponseType(typeof(TodayStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TodayStatsDto>> GetToday(CancellationToken ct)
    {
        var stats = await _statsService.GetTodayStatsAsync(ct);
        return Ok(stats ?? new TodayStatsDto(0, 0, 0));
    }

    /// <summary>
    /// Retrieves overall progress standings across all completed sprints.
    /// </summary>
    [HttpGet("progress")]
    [ProducesResponseType(typeof(ProgressDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProgressDto>> GetProgress(CancellationToken ct)
    {
        var stats = await _statsService.GetProgressAsync(ct);
        return Ok(stats ?? new ProgressDto("Bronze", 0, 0, null, new QuestSnapshot(0, 0, 0, 0, 0, 0)));
    }
}
