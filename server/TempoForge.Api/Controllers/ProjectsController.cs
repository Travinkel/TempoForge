using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using TempoForge.Application.Projects;
using TempoForge.Domain.Entities;

namespace TempoForge.Api.Controllers;

/// <summary>
/// Exposes CRUD operations for projects.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _service;

    public ProjectsController(IProjectService service)
    {
        _service = service;
    }

    /// <summary>
    /// Retrieves all projects, optionally filtering by favorites.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProjectDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll([FromQuery] bool? favorites, CancellationToken ct)
    {
        var items = await _service.GetAllAsync(ct);
        if (favorites is true)
        {
            items = items.Where(p => p.IsFavorite).ToList();
        }

        return Ok(items.Select(ProjectDto.From));
    }

    /// <summary>
    /// Retrieves only favorite projects.
    /// </summary>
    [HttpGet("favorites")]
    [ProducesResponseType(typeof(IEnumerable<ProjectDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetFavorites(CancellationToken ct)
    {
        var favorites = await _service.GetFavoritesAsync(ct) ?? new List<Project>();
        var projection = favorites.Select(ProjectDto.From).ToList();
        return Ok(projection);
    }

    /// <summary>
    /// Retrieves a single project by identifier.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectDto>> Get(Guid id, CancellationToken ct)
    {
        var project = await _service.GetAsync(id, ct);
        if (project is null)
        {
            return NotFound(CreateProblem(StatusCodes.Status404NotFound, "Project not found", $"Project '{id}' was not found."));
        }

        return Ok(ProjectDto.From(project));
    }

    /// <summary>
    /// Creates a new project.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<ProjectDto>> Create([FromBody] ProjectCreateDto dto, CancellationToken ct)
    {
        var project = await _service.CreateAsync(dto, ct);
        var response = ProjectDto.From(project);
        return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
    }

    /// <summary>
    /// Updates an existing project.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectDto>> Update(Guid id, [FromBody] ProjectUpdateDto dto, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, dto, ct);
        if (updated is null)
        {
            return NotFound(CreateProblem(StatusCodes.Status404NotFound, "Project not found", $"Project '{id}' was not found."));
        }

        return Ok(ProjectDto.From(updated));
    }

    /// <summary>
    /// Deletes an existing project.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var deleted = await _service.DeleteAsync(id, ct);
        if (!deleted)
        {
            return NotFound(CreateProblem(StatusCodes.Status404NotFound, "Project not found", $"Project '{id}' was not found."));
        }

        return NoContent();
    }

    private ProblemDetails CreateProblem(int statusCode, string title, string detail)
        => new()
        {
            Title = title,
            Status = statusCode,
            Detail = detail,
            Instance = HttpContext.Request.Path
        };
}
