import React from 'react'
import { Droplet } from 'lucide-react'
import type { Project } from '../../api/projects'
import { getProjects, addProject, updateProject } from '../../api/projects'

type DurationOption = number | 'custom'

export default function QuickStartCard() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null)
  const [duration, setDuration] = React.useState<DurationOption>(25)

  const favorites = projects.filter(p => p.isFavorite)

  React.useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  const onAddProject = async () => {
    const name = window.prompt('Project name')?.trim()
    if (!name) return
    const trackStr = window.prompt('Track (1=Work, 2=Study)', '1') || '1'
    const track = Number(trackStr) === 2 ? 2 : 1
    const fav = window.confirm('Mark as favorite?')
    await addProject(name, track, fav)
    setProjects(await getProjects())
  }

  const toggleFavorite = async (project: Project) => {
    await updateProject(project.id, { isFavorite: !project.isFavorite })
    setProjects(await getProjects())
  }

  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <h2 className="card-title font-cinzel text-primary">Quick Start</h2>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex gap-2 flex-wrap items-center">
              {favorites.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`px-3 py-1 rounded-full border transition-colors ${
                    selectedProjectId === project.id
                      ? 'bg-yellow-600 text-black border-yellow-700'
                      : 'bg-gray-800 text-gray-200 border-gray-600'
                  }`}
                >
                  {project.name}
                </button>
              ))}
              <button onClick={onAddProject} className="px-3 py-1 rounded-full bg-gray-600 text-white hover:bg-gray-500">
                + Add
              </button>
            </div>
            {favorites.length === 0 && (
              <div className="mt-3 text-sm opacity-80">Forge your first favorite ??</div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {[15, 25, 45, 'custom' as const].map(value => (
              <button
                key={value.toString()}
                onClick={() => setDuration(value)}
                className={`btn btn-sm ${duration === value ? 'btn-primary' : ''}`}
              >
                {value === 'custom' ? 'Custom' : `${value}m`}
              </button>
            ))}
          </div>

          <div>
            <button className="btn bg-red-700 text-white border-red-800 hover:bg-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] btn-lg">
              Start Sprint
            </button>
          </div>

          <div className="mt-2">
            <div className="text-sm mb-1 opacity-70">Favorites</div>
            <ul className="divide-y divide-base-100/20">
              {projects.map(project => (
                <li key={project.id} className="flex items-center justify-between py-2">
                  <span>{project.name}</span>
                  <button onClick={() => toggleFavorite(project)} aria-label="Toggle favorite">
                    <Droplet className={project.isFavorite ? 'text-red-600' : 'text-gray-500 hover:text-red-500'} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
