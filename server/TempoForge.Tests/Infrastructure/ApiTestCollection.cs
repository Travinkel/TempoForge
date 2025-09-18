using Xunit;

namespace TempoForge.Tests.Infrastructure;

[CollectionDefinition(Name)]
public class ApiTestCollection : ICollectionFixture<ApiTestFixture>
{
    public const string Name = "TempoForge API";
}
