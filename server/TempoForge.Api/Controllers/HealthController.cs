using Microsoft.AspNetCore.Mvc;

namespace TempoForge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var payload = new
        {
            status = "OK",
            version = typeof(Program).Assembly.GetName().Version?.ToString() ?? "dev",
            timeUtc = DateTime.UtcNow
        };
        return Ok(payload);
    }
}