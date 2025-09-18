using Microsoft.AspNetCore.Mvc;
using TempoForge.Application.Sprints;

namespace TempoForge.Api.Controllers;

/// <summary>
/// Provides aggregated sprint statistics.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly ISprintService _sprintService;

    public StatsController(ISprintService sprintService)
    {
        _sprintService = sprintService;
    }

    /// <summary>
    /// Retrieves today's focused minutes, sprint count, and streak length.
    /// </summary>
    [HttpGet("today")]
    [ProducesResponseType(typeof(TodayStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TodayStatsDto>> GetToday(CancellationToken ct)
    {
        var stats = await _sprintService.GetTodayStatsAsync(ct);
        return Ok(stats);
    }

    /// <summary>
    /// Retrieves overall progress standings across all completed sprints.
    /// </summary>
    [HttpGet("progress")]
    [ProducesResponseType(typeof(ProgressDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProgressDto>> GetProgress(CancellationToken ct)
    {
        var stats = await _sprintService.GetProgressAsync(ct);
        return Ok(stats);
    }
}
