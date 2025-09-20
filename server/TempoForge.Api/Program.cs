using System;
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

// Rely on ASPNETCORE_URLS (Dockerfile), don't override Kestrel in code.

// Services
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
        options.InvalidModelStateResponseFactory = context =>
            new BadRequestObjectResult(new ValidationProblemDetails(context.ModelState)));

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

builder.Services.AddDbContext<TempoForgeDbContext>(o =>
{
    o.UseNpgsql(conn, npgsql => npgsql.EnableRetryOnFailure());
});
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IQuestService, QuestService>();
builder.Services.AddScoped<ISprintService, SprintService>();
builder.Services.AddScoped<IStatsService, StatsService>();

var clientOriginsSetting = builder.Configuration["ClientOrigins"] ?? builder.Configuration["ClientOrigin"];
var allowedOrigins = (clientOriginsSetting ?? "http://localhost:5173")
    .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
if (allowedOrigins.Length == 0)
{
    allowedOrigins = new[] { "http://localhost:5173" };
}

builder.Services.AddCors(o => o.AddPolicy("web", p => p
    .WithOrigins(allowedOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

// Apply migrations without blocking startup if DB has hiccups
app.Lifetime.ApplicationStarted.Register(() =>
{
    _ = Task.Run(async () =>
    {
        using var scope = app.Services.CreateScope();
        try
        {
            var db = scope.ServiceProvider.GetRequiredService<TempoForgeDbContext>();
            await db.Database.MigrateAsync();

            if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
            {
                DataSeeder.Seed(db, app.Environment);
            }

            if (app.Environment.IsDevelopment())
            {
                await TempoForgeSeeder.SeedAsync(db);
            }
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "Database migration failed at startup");
            // Do not rethrow; let app start so /health and Swagger work
        }
    });
});

// Pipeline
app.UseGlobalProblemDetails();
app.UseCors("web");
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

// Health + friendly root
app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    timeUtc = DateTime.UtcNow
}));

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();

// Needed for integration testing
public partial class Program
{
}
