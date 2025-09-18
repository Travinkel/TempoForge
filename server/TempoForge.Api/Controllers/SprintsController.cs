using Microsoft.AspNetCore.Mvc;

namespace TempoForge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SprintsController : ControllerBase
{
    public record TodayStatsDto(int Minutes, int Sprints, int StreakDays);
    public record RecentSprintDto(Guid Id, string Project, int DurationMinutes, DateTime StartedAtUtc);

    // Stub: return sample numbers. In future, calculate from DB.
    [HttpGet("today")]
    public ActionResult<TodayStatsDto> GetToday()
        => Ok(new TodayStatsDto(Minutes: 50, Sprints: 2, StreakDays: 4));

    // Stub recent list
    [HttpGet("recent")]
    public ActionResult<IEnumerable<RecentSprintDto>> GetRecent()
    {
        var now = DateTime.UtcNow;
        var list = new List<RecentSprintDto>
        {
            new RecentSprintDto(Guid.NewGuid(), "Client Alpha", 25, now.AddHours(-5)),
            new RecentSprintDto(Guid.NewGuid(), "Thesis Article", 45, now.AddDays(-1).AddHours(-2)),
            new RecentSprintDto(Guid.NewGuid(), "Algorithms Review", 15, now.AddDays(-1).AddHours(-10))
        };
        return Ok(list);
    }
}
