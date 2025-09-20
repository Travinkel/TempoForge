using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TempoForge.Api;
using Xunit;

namespace TempoForge.Tests;

public class ProblemDetailsExtensionsTests
{
    [Fact]
    public void CreateProblem_UsesRequestPathWhenInstanceNotProvided()
    {
        var controller = new TestController("/quests/123");

        var problem = controller.CreateProblem(StatusCodes.Status404NotFound, "Missing", "Quest not found");

        Assert.Equal(StatusCodes.Status404NotFound, problem.Status);
        Assert.Equal("Missing", problem.Title);
        Assert.Equal("Quest not found", problem.Detail);
        Assert.Equal("/quests/123", problem.Instance);
    }

    [Fact]
    public void CreateProblem_UsesProvidedInstanceWhenSupplied()
    {
        var controller = new TestController("/quests/123");

        var problem = controller.CreateProblem(
            StatusCodes.Status409Conflict,
            "Conflict",
            "Quest already claimed",
            "/custom-instance");

        Assert.Equal("/custom-instance", problem.Instance);
    }

    private sealed class TestController : ControllerBase
    {
        public TestController(string path)
        {
            var context = new DefaultHttpContext();
            context.Request.Path = path;
            ControllerContext = new ControllerContext
            {
                HttpContext = context
            };
        }
    }
}
