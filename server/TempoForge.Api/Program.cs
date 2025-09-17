using Microsoft.EntityFrameworkCore;
using TempoForge.Application.Projects;
using TempoForge.Infrastructure.Data;
using Microsoft.OpenApi.Models;
using TempoForge.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TempoForge API", Version = "v1" });
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
        c.SupportNonNullableReferenceTypes();
    }
});

var conn = builder.Configuration.GetConnectionString("Default")
           ?? builder.Configuration["ConnectionStrings:Default"]
           ?? "Host=localhost;Database=tempo;Username=tempo;Password=tempo";

builder.Services.AddDbContext<TempoForgeDbContext>(o => o.UseNpgsql(conn));

builder.Services.AddScoped<IProjectService, ProjectService>();

builder.Services.AddCors(o => o.AddPolicy("web", p => p
    .WithOrigins(builder.Configuration["ClientOrigin"] ?? "http://localhost:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

// Auto-apply migrations in Development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<TempoForgeDbContext>();
    db.Database.Migrate();
}

// Global exception handling with ProblemDetails
app.UseGlobalProblemDetails();

app.UseCors("web");

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();

public partial class Program { }