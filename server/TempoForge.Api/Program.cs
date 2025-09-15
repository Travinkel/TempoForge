using Microsoft.EntityFrameworkCore;
using TempoForge.Application.Projects;
using TempoForge.Infrastructure.Data;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TempoForge API", Version = "v1" });
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

app.UseCors("web");

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();

public partial class Program { }