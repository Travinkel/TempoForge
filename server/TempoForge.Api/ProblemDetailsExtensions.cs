using Microsoft.AspNetCore.Mvc;

namespace TempoForge.Api;

public static class ProblemDetailsExtensions
{
    public static ProblemDetails CreateProblem(
        this ControllerBase controller,
        int statusCode,
        string title,
        string detail,
        string? instance = null)
    {
        ArgumentNullException.ThrowIfNull(controller);

        var requestPath = controller.HttpContext?.Request?.Path.Value;

        return new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = instance ?? requestPath
        };
    }
}
