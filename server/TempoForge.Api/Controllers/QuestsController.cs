using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using TempoForge.Application.Quests;

namespace TempoForge.Api.Controllers;

/// <summary>
/// Provides read-only access to quest progress as well as reward interactions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class QuestsController : ControllerBase
{
    private readonly IQuestService _service;

    public QuestsController(IQuestService service)
        => _service = service;

    /// <summary>
    /// Retrieves the current quest progress summary (daily, weekly, epic).
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(List<QuestDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<QuestDto>>> GetActive(CancellationToken ct)
    {
        var quests = await _service.GetActiveAsync(ct) ?? new List<QuestDto>();
        return Ok(quests);
    }

    /// <summary>
    /// Retrieves the active quest entities grouped by type for reward tracking.
    /// </summary>
    [HttpGet("active/details")]
    [ProducesResponseType(typeof(ActiveQuestsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ActiveQuestsDto>> GetDetailedActive(CancellationToken ct)
    {
        var quests = await _service.GetActiveQuestsAsync(ct);
        return Ok(quests ?? new ActiveQuestsDto(null, null, null));
    }

    /// <summary>
    /// Marks a quest reward as claimed once its goal has been met.
    /// </summary>
    [HttpPost("{id:guid}/claim")]
    [ProducesResponseType(typeof(QuestDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<QuestDetailDto>> Claim(Guid id, CancellationToken ct)
    {
        try
        {
            var quest = await _service.ClaimRewardAsync(id, ct);
            if (quest is null)
            {
                return NotFound(CreateProblem(StatusCodes.Status404NotFound, "Quest not found", $"Quest '{id}' was not found."));
            }

            return Ok(quest);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(CreateProblem(StatusCodes.Status409Conflict, "Quest not yet completed", ex.Message));
        }
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
