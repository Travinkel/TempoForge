using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace TempoForge.Api.Middleware;

public static class ApiExceptionMiddleware
{
    public static void UseGlobalProblemDetails(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(handlerApp =>
        {
            handlerApp.Run(async context =>
            {
                var exceptionHandler = context.Features.Get<IExceptionHandlerFeature>();
                var ex = exceptionHandler?.Error;

                var (title, status) = ex switch
                {
                    KeyNotFoundException => ("Not Found", StatusCodes.Status404NotFound),
                    InvalidOperationException => ("Conflict", StatusCodes.Status409Conflict),
                    ArgumentOutOfRangeException => ("Bad Request", StatusCodes.Status400BadRequest),
                    ArgumentException => ("Bad Request", StatusCodes.Status400BadRequest),
                    _ => ("An unexpected error occurred", StatusCodes.Status500InternalServerError)
                };

                var problem = new ProblemDetails
                {
                    Type = GetProblemType(status),
                    Title = title,
                    Status = status,
                    Detail = ex?.Message,
                    Instance = context.Request.Path
                };
                problem.Extensions["traceId"] = context.TraceIdentifier;

                context.Response.ContentType = "application/problem+json";
                context.Response.StatusCode = status;
                await context.Response.WriteAsJsonAsync(problem);
            });
        });
    }

    private static string GetProblemType(int status) => status switch
    {
        StatusCodes.Status400BadRequest => "https://httpstatuses.io/400",
        StatusCodes.Status404NotFound => "https://httpstatuses.io/404",
        StatusCodes.Status409Conflict => "https://httpstatuses.io/409",
        _ => "https://httpstatuses.io/500"
    };
}
