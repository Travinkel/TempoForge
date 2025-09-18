using System.Linq;
using Microsoft.AspNetCore.Mvc;
using TempoForge.Application.Sprints;

namespace TempoForge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SprintsController : ControllerBase
{
    private readonly ISprintService _service;

    public SprintsController(ISprintService service)
    {
        _service = service;
    }

    [HttpPost("start")]
    public async Task<ActionResult<SprintDto>> Start([FromBody] SprintStartDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var sprint = await _service.StartAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = sprint.Id }, SprintDto.From(sprint));
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<SprintDto>> Complete(Guid id, CancellationToken ct)
    {
        var sprint = await _service.CompleteAsync(id, ct);
        if (sprint is null)
            return NotFound();
        return Ok(SprintDto.From(sprint));
    }

    [HttpPost("{id:guid}/abort")]
    public async Task<ActionResult<SprintDto>> Abort(Guid id, CancellationToken ct)
    {
        var sprint = await _service.AbortAsync(id, ct);
        if (sprint is null)
            return NotFound();
        return Ok(SprintDto.From(sprint));
    }

    [HttpGet("running")]
    public async Task<ActionResult<SprintDto>> GetRunning(CancellationToken ct)
    {
        var sprint = await _service.GetRunningAsync(ct);
        if (sprint is null)
            return NoContent();
        return Ok(SprintDto.From(sprint));
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<RecentSprintDto>>> GetRecent([FromQuery] int take = 5, CancellationToken ct = default)
    {
        var sprints = await _service.GetRecentAsync(take, ct);
        return Ok(sprints.Select(RecentSprintDto.From));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SprintDto>> GetById(Guid id, CancellationToken ct)
    {
        var sprint = await _service.GetAsync(id, ct);
        if (sprint is null)
            return NotFound();
        return Ok(SprintDto.From(sprint));
    }
}
