using System.ComponentModel.DataAnnotations;
using TempoForge.Domain.Entities;

namespace TempoForge.Application.Projects;

/// <summary>
/// Payload used to create a new project.
/// </summary>
public class ProjectCreateDto
{
    [Required]
    [StringLength(80, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    public bool IsFavorite { get; set; }
}

/// <summary>
/// Payload used to update an existing project.
/// </summary>
public class ProjectUpdateDto
{
    [StringLength(80, MinimumLength = 3)]
    public string? Name { get; set; }

    public bool? IsFavorite { get; set; }
}

/// <summary>
/// Projection representing a project.
/// </summary>
public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsFavorite { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }

    public static ProjectDto From(Project project) => new()
    {
        Id = project.Id,
        Name = project.Name,
        IsFavorite = project.IsFavorite,
        CreatedAt = project.CreatedAt,
        LastUsedAt = project.LastUsedAt
    };
}
