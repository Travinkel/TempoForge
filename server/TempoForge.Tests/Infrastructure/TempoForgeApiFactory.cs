using System.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TempoForge.Infrastructure.Data;

namespace TempoForge.Tests.Infrastructure;

public sealed class TempoForgeApiFactory : WebApplicationFactory<Program>
{
    private readonly string _connectionString;

    public TempoForgeApiFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<TempoForgeDbContext>));
            if (descriptor is not null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<TempoForgeDbContext>(options =>
            {
                options.UseNpgsql(_connectionString);
            });
        });
    }
}
