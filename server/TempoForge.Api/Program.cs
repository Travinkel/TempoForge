using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TempoForge.Api.Middleware;
using TempoForge.Application.Projects;
using TempoForge.Application.Quests;
using TempoForge.Application.Sprints;
using TempoForge.Application.Stats;
using TempoForge.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel for Fly.io (port 8080)
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8080);
});

// Add services
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
            new BadRequestObjectResult(new ValidationProblemDetails(context.ModelState));
    });

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

// Connection string
var conn = builder.Configuration.GetConnectionString("Default")
           ?? builder.Configuration["ConnectionStrings:Default"]
           ?? "Host=localhost;Database=tempo;Username=tempo;Password=tempo";

builder.Services.AddDbContext<TempoForgeDbContext>(o => o.UseNpgsql(conn));
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IQuestService, QuestService>();
builder.Services.AddScoped<QuestService>();
builder.Services.AddScoped<ISprintService, SprintService>();
builder.Services.AddScoped<IStatsService, StatsService>();

builder.Services.AddCors(o => o.AddPolicy("web", p => p
    .WithOrigins(builder.Configuration["ClientOrigin"] ?? "http://localhost:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

// Apply migrations at startup (both dev + production)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<TempoForgeDbContext>();
        await db.Database.MigrateAsync();
        if (app.Environment.IsDevelopment())
            await TempoForgeSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Database migration failed at startup");
    }
}


// Middleware pipeline
app.UseGlobalProblemDetails();
app.UseCors("web");
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();

// Simple health check endpoint
app.MapGet("/health", () => Results.Ok(new 
{
    status = "ok",
    timeUtc = DateTime.UtcNow
}));


app.Run();

// Needed for integration testing
public partial class Program { }
