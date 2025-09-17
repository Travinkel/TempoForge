using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TempoForge.Application.Projects;
using TempoForge.Domain.Entities;
using TempoForge.Infrastructure.Data;

namespace TempoForge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
	private readonly IProjectService _service;
	private readonly TempoForgeDbContext _db; // For simple queries if needed
	public ProjectsController(IProjectService service, TempoForgeDbContext db)
	{
		_service = service; _db = db;
	}

	[HttpGet]
	public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll(CancellationToken ct)
	{
		var items = await _service.GetAllAsync(ct);
		return Ok(items.Select(ProjectDto.From));
	}

	[HttpGet("{id:guid}")]
	public async Task<ActionResult<ProjectDto>> Get(Guid id, CancellationToken ct)
	{
 	var p = await _service.GetAsync(id, ct);
 	if (p is null) throw new KeyNotFoundException("Project not found");
 	return Ok(ProjectDto.From(p));
	}

 [HttpPost]
 public async Task<ActionResult<ProjectDto>> Create([FromBody] ProjectCreateDto dto, CancellationToken ct)
 {
 	if (!ModelState.IsValid) return ValidationProblem(ModelState);
 	var p = await _service.CreateAsync(dto, ct);
 	return CreatedAtAction(nameof(Get), new { id = p.Id }, ProjectDto.From(p));
 }

	[HttpPut("{id:guid}")]
	public async Task<ActionResult<ProjectDto>> Update(Guid id, [FromBody] ProjectUpdateDto dto, CancellationToken ct)
	{
		if (!ModelState.IsValid) return ValidationProblem(ModelState);
 	var p = await _service.UpdateAsync(id, dto, ct);
 	return p is null ? NotFound() : Ok(ProjectDto.From(p));
	}

	[HttpDelete("{id:guid}")]
	public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
	{
		var ok = await _service.DeleteAsync(id, ct);
		return ok ? NoContent() : NotFound();
	}
}