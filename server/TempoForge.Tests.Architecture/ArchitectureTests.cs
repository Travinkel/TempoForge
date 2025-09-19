using NetArchTest.Rules;
using TempoForge.Application.Projects;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;
using TempoForge.Api;
using Xunit;

namespace TempoForge.Tests.Architecture;

public static class ArchitectureTestHelpers
{
    public static string Describe(this TestResult result)
    {
        if (result.IsSuccessful)
        {
            return string.Empty;
        }

        var failing = string.Join(Environment.NewLine, result.FailingTypeNames);
        return $"Failing types:{Environment.NewLine}{failing}";
    }
}

public class ArchitectureTests
{
    private const string ApplicationNamespace = "TempoForge.Application";
    private const string DomainNamespace = "TempoForge.Domain";
    private const string InfrastructureNamespace = "TempoForge.Infrastructure";

    [Fact]
    public void Domain_Should_Not_Depend_On_Application_Or_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Project).Assembly)
            .Should()
            .NotHaveDependencyOnAll(ApplicationNamespace, InfrastructureNamespace)
            .GetResult();

        Assert.True(result.IsSuccessful, result.Describe());
    }

    [Fact]
    public void Application_Should_Not_Depend_On_Infrastructure()
    {
        var result = Types.InAssembly(typeof(ProjectService).Assembly)
            .Should()
            .NotHaveDependencyOn(InfrastructureNamespace)
            .GetResult();

        Assert.True(result.IsSuccessful, result.Describe());
    }

    [Fact]
    public void Api_Should_Not_Depend_On_Infrastructure_Beyond_Composition()
    {
        var result = Types.InAssembly(typeof(Program).Assembly)
            .That()
            .DoNotHaveName("Program")
            .Should()
            .NotHaveDependencyOn(InfrastructureNamespace)
            .GetResult();

        Assert.True(result.IsSuccessful, result.Describe());
    }
}
