using Microsoft.AspNetCore.Mvc;
using TempoForge.Application.Sprints;

namespace TempoForge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly ISprintService _service;

    public StatsController(ISprintService service)
    {
        _service = service;
    }

    [HttpGet("today")]
    public async Task<ActionResult<TodayStatsDto>> GetToday(CancellationToken ct)
    {
        var stats = await _service.GetTodayStatsAsync(ct);
        return Ok(stats);
    }

    [HttpGet("progress")]
    public async Task<ActionResult<ProgressDto>> GetProgress(CancellationToken ct)
    {
        var stats = await _service.GetProgressAsync(ct);
        return Ok(stats);
    }
}
