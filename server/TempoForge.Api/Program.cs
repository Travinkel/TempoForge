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

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<TempoForgeDbContext>();
    await db.Database.MigrateAsync();
    await TempoForgeSeeder.SeedAsync(db);
}

app.UseGlobalProblemDetails();
app.UseCors("web");
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();

public partial class Program { }
