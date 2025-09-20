using ArchUnitNET.Domain;
using ArchUnitNET.Loader;
using static ArchUnitNET.Fluent.ArchRuleDefinition;
using TempoForge.Api;
using TempoForge.Application.Projects;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;
using Xunit;

namespace TempoForge.Tests.Architecture;

public class ArchitectureFixture
{
    public ArchitectureFixture()
    {
        Architecture = new ArchLoader().LoadAssemblies(
            typeof(Project).Assembly,
            typeof(ProjectService).Assembly,
            typeof(TempoForgeDbContext).Assembly,
            typeof(Program).Assembly
        ).Build();
    }

    public Architecture Architecture { get; }
}

public class ArchitectureTests : IClassFixture<ArchitectureFixture>
{
    private const string ApiNamespace = "TempoForge.Api";
    private const string ApplicationNamespace = "TempoForge.Application";
    private const string DomainNamespace = "TempoForge.Domain";
    private const string InfrastructureNamespace = "TempoForge.Infrastructure";

    private readonly Architecture _architecture;

    public ArchitectureTests(ArchitectureFixture fixture)
    {
        _architecture = fixture.Architecture;
    }

    [Fact]
    public void Domain_Should_Not_Depend_On_Application_Or_Infrastructure()
    {
        var domainTypes = Types().That()
            .ResideInNamespace(DomainNamespace, true)
            .As("Domain layer types");

        var applicationOrInfrastructureTypes = Types().That()
            .ResideInNamespace(ApplicationNamespace, true)
            .Or().ResideInNamespace(InfrastructureNamespace, true)
            .As("Application or infrastructure layer types");

        domainTypes.Should()
            .NotDependOnAny(applicationOrInfrastructureTypes)
            .Because("the domain layer must remain independent from other layers")
            .Check(_architecture);
    }

    [Fact]
    public void Application_Should_Not_Depend_On_Infrastructure()
    {
        var applicationTypes = Types().That()
            .ResideInNamespace(ApplicationNamespace, true)
            .As("Application layer types");

        var infrastructureTypes = Types().That()
            .ResideInNamespace(InfrastructureNamespace, true)
            .As("Infrastructure layer types");

        applicationTypes.Should()
            .NotDependOnAny(infrastructureTypes)
            .Because("the application layer should be decoupled from infrastructure concerns")
            .Check(_architecture);
    }

    [Fact]
    public void Api_Should_Not_Depend_On_Infrastructure_Beyond_Composition()
    {
        var apiTypes = Types().That()
            .ResideInNamespace(ApiNamespace, true)
            .And().AreNot(typeof(Program))
            .As("API composition types excluding Program");

        var infrastructureTypes = Types().That()
            .ResideInNamespace(InfrastructureNamespace, true)
            .As("Infrastructure layer types");

        apiTypes.Should()
            .NotDependOnAny(infrastructureTypes)
            .Because("API components other than Program should not take direct infrastructure dependencies")
            .Check(_architecture);
    }
}
