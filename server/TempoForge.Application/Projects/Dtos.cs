using System.ComponentModel.DataAnnotations;
using TempoForge.Domain.Entities;

namespace TempoForge.Application.Projects;

public class ProjectCreateDto
{
    [Required]
    [StringLength(80, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public Track? Track { get; set; }

    public bool Pinned { get; set; }
}

public class ProjectUpdateDto
{
    [StringLength(80, MinimumLength = 3)]
    public string? Name { get; set; }

    public Track? Track { get; set; }

    public bool? Pinned { get; set; }
}

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Track Track { get; set; }
    public bool Pinned { get; set; }
    public DateTime CreatedAt { get; set; }

    public static ProjectDto From(Project p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Track = p.Track,
        Pinned = p.Pinned,
        CreatedAt = p.CreatedAt
    };
}