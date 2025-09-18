using Microsoft.AspNetCore.Http;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using TempoForge.Application.Sprints;

namespace TempoForge.Api.Controllers;

/// <summary>
/// Manages sprint lifecycle operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SprintsController : ControllerBase
{
    private readonly ISprintService _service;

    public SprintsController(ISprintService service)
    {
        _service = service;
    }

    /// <summary>
    /// Retrieves a sprint by identifier.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SprintDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SprintDto>> GetById(Guid id, CancellationToken ct)
    {
        var sprint = await _service.GetAsync(id, ct);
        if (sprint is null)
        {
            return NotFound(CreateProblem(StatusCodes.Status404NotFound, "Sprint not found", $"Sprint '{id}' was not found."));
        }

        return Ok(SprintDto.From(sprint));
    }

    /// <summary>
    /// Starts a new sprint for the specified project.
    /// </summary>
    [HttpPost("start")]
    [ProducesResponseType(typeof(SprintDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SprintDto>> Start([FromBody] StartSprintRequest request, CancellationToken ct)
    {
        try
        {
            var sprint = await _service.StartAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = sprint.Id }, SprintDto.From(sprint));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(CreateProblem(StatusCodes.Status404NotFound, "Project not found", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(CreateProblem(StatusCodes.Status409Conflict, "Sprint already running", ex.Message));
        }
    }

    /// <summary>
    /// Marks a running sprint as complete.
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(SprintDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SprintDto>> Complete(Guid id, CancellationToken ct)
    {
        try
        {
            var sprint = await _service.CompleteAsync(id, ct);
            if (sprint is null)
            {
                return NotFound(CreateProblem(StatusCodes.Status404NotFound, "Sprint not found", $"Sprint '{id}' was not found."));
            }

            return Ok(SprintDto.From(sprint));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(CreateProblem(StatusCodes.Status409Conflict, "Sprint cannot be completed", ex.Message));
        }
    }

    /// <summary>
    /// Aborts a running sprint.
    /// </summary>
    [HttpPost("{id:guid}/abort")]
    [ProducesResponseType(typeof(SprintDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SprintDto>> Abort(Guid id, CancellationToken ct)
    {
        try
        {
            var sprint = await _service.AbortAsync(id, ct);
            if (sprint is null)
            {
                return NotFound(CreateProblem(StatusCodes.Status404NotFound, "Sprint not found", $"Sprint '{id}' was not found."));
            }

            return Ok(SprintDto.From(sprint));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(CreateProblem(StatusCodes.Status409Conflict, "Sprint cannot be aborted", ex.Message));
        }
    }

    /// <summary>
    /// Retrieves the currently running sprint if one exists.
    /// </summary>
    [HttpGet("running")]
    [ProducesResponseType(typeof(SprintDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SprintDto>> GetRunning(CancellationToken ct)
    {
        var sprint = await _service.GetRunningAsync(ct);
        if (sprint is null)
        {
            return NotFound(CreateProblem(StatusCodes.Status404NotFound, "Sprint not found", "No sprint is currently running."));
        }

        return Ok(SprintDto.From(sprint));
    }

    /// <summary>
    /// Retrieves the most recent sprint activity entries.
    /// </summary>
    [HttpGet("recent")]
    [ProducesResponseType(typeof(IEnumerable<RecentSprintDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RecentSprintDto>>> GetRecent([FromQuery] int take = 5, CancellationToken ct = default)
    {
        var sprints = await _service.GetRecentAsync(take, ct);
        return Ok(sprints.Select(RecentSprintDto.From));
    }

    private ProblemDetails CreateProblem(int statusCode, string title, string detail)
        => new()
        {
            Title = title,
            Status = statusCode,
            Detail = detail,
            Instance = HttpContext.Request.Path
        };
}


