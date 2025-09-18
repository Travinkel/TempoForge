using Microsoft.AspNetCore.Mvc;
using TempoForge.Application.Stats;

namespace TempoForge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly IStatsService _service;

    public StatsController(IStatsService service)
    {
        _service = service;
    }

    [HttpGet("today")]
    public async Task<ActionResult<TodayStatsDto>> GetToday(CancellationToken ct)
    {
        var stats = await _service.GetTodayAsync(ct);
        return Ok(stats);
    }

    [HttpGet("progress")]
    public async Task<ActionResult<ProgressStatsDto>> GetProgress(CancellationToken ct)
    {
        var stats = await _service.GetProgressAsync(ct);
        return Ok(stats);
    }
}
