using Microsoft.AspNetCore.Mvc;
using TempoForge.Application.Quests;
using TempoForge.Domain.Entities;

namespace TempoForge.Api.Controllers;

/// <summary>
/// Provides read-only access to active quests and reward claiming.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class QuestsController : ControllerBase
{
    private readonly IQuestService _questService;

    public QuestsController(IQuestService questService)
    {
        _questService = questService;
    }

    /// <summary>
    /// Retrieves the active quests grouped by type (daily, weekly, epic).
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(ActiveQuestsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ActiveQuestsDto>> GetActive(CancellationToken ct)
    {
        var quests = await _questService.GetActiveQuestsAsync(ct);
        return Ok(quests);
    }

    /// <summary>
    /// Marks a quest reward as claimed once its goal has been met.
    /// </summary>
    [HttpPost("{id:guid}/claim")]
    [ProducesResponseType(typeof(QuestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<QuestDto>> Claim(Guid id, CancellationToken ct)
    {
        try
        {
            var quest = await _questService.ClaimRewardAsync(id, ct);
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
