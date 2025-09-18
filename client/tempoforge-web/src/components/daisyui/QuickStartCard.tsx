import React from 'react'
import { Droplet } from 'lucide-react'
import type { Project } from '../../api/projects'

type DurationOption = number | 'custom'

type QuickStartCardProps = {
  projects: Project[]
  favorites: Project[]
  loading?: boolean
  error?: string | null
  plannedProjectId: string | null
  plannedDurationMinutes: number
  sprintStarting?: boolean
  onPlanSprint: (projectId: string | null, durationMinutes: number) => void
  onStartSprint: (projectId: string, durationMinutes: number) => Promise<void>
  onAddProject: (name: string, track: number, isFavorite: boolean) => Promise<void>
  onToggleFavorite: (projectId: string, nextValue: boolean) => Promise<void>
}

export default function QuickStartCard({
  projects,
  favorites,
  loading = false,
  error,
  plannedProjectId,
  plannedDurationMinutes,
  sprintStarting = false,
  onPlanSprint,
  onStartSprint,
  onAddProject,
  onToggleFavorite,
}: QuickStartCardProps) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(plannedProjectId)
  const [duration, setDuration] = React.useState<DurationOption>(plannedDurationMinutes)
  const [pending, setPending] = React.useState<boolean>(false)

  React.useEffect(() => {
    setSelectedProjectId(plannedProjectId)
  }, [plannedProjectId])

  React.useEffect(() => {
    setDuration(plannedDurationMinutes)
  }, [plannedDurationMinutes])

  React.useEffect(() => {
    if (selectedProjectId) {
      const numericDuration = typeof duration === 'number' ? duration : plannedDurationMinutes
      onPlanSprint(selectedProjectId, numericDuration)
    }
  }, [selectedProjectId])

  const handleSelectProject = React.useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId)
      const numericDuration = typeof duration === 'number' ? duration : plannedDurationMinutes
      onPlanSprint(projectId, numericDuration)
    },
    [duration, onPlanSprint, plannedDurationMinutes],
  )

  const handleDurationChange = React.useCallback(
    (option: DurationOption) => {
      if (option === 'custom') {
        const input = window.prompt('Enter sprint duration (minutes)', String(plannedDurationMinutes))
        if (!input) {
          return
        }
        const minutes = Number.parseInt(input, 10)
        if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 180) {
          window.alert('Please enter a value between 1 and 180 minutes.')
          return
        }
        setDuration(minutes)
        onPlanSprint(selectedProjectId, minutes)
        return
      }
      setDuration(option)
      onPlanSprint(selectedProjectId, option)
    },
    [onPlanSprint, plannedDurationMinutes, selectedProjectId],
  )

  const handleAddProject = React.useCallback(async () => {
    const name = window.prompt('Project name')?.trim()
    if (!name) {
      return
    }
    const trackStr = window.prompt('Track (1=Work, 2=Study)', '1') || '1'
    const track = Number(trackStr) === 2 ? 2 : 1
    const favorite = window.confirm('Mark as favorite?')
    try {
      await onAddProject(name, track, favorite)
    } catch (error) {
      console.error('Failed to add project', error)
      window.alert('Failed to add project. Please try again.')
    }
  }, [onAddProject])

  const handleToggleFavorite = React.useCallback(
    async (project: Project) => {
      try {
        await onToggleFavorite(project.id, !project.isFavorite)
      } catch (error) {
        console.error('Failed to toggle favorite', error)
        window.alert('Unable to update favorite right now.')
      }
    },
    [onToggleFavorite],
  )

  const handleStart = React.useCallback(async () => {
    if (!selectedProjectId) {
      window.alert('Select a project before starting a sprint.')
      return
    }
    const minutes = typeof duration === 'number' ? duration : plannedDurationMinutes
    setPending(true)
    try {
      await onStartSprint(selectedProjectId, minutes)
    } catch (error) {
      console.error('Failed to start sprint', error)
      window.alert('Failed to start sprint. Please try again.')
    } finally {
      setPending(false)
    }
  }, [duration, onStartSprint, plannedDurationMinutes, selectedProjectId])

  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <h2 className="card-title font-cinzel text-primary">Quick Start</h2>
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded bg-base-100/10" />
            <div className="h-10 animate-pulse rounded bg-base-100/10" />
            <div className="h-10 animate-pulse rounded bg-base-100/10" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {error && <div className="rounded bg-base-100/10 px-3 py-2 text-sm text-error-content">{error}</div>}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {favorites.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className={
ounded-full border px-3 py-1 transition-colors }
                  >
                    {project.name}
                  </button>
                ))}
                <button onClick={handleAddProject} className="rounded-full bg-gray-600 px-3 py-1 text-white hover:bg-gray-500">
                  + Add
                </button>
              </div>
              {favorites.length === 0 && (
                <div className="mt-3 text-sm opacity-80">Make a project a favorite to quick-launch it.</div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {[15, 25, 45, 'custom' as const].map(value => (
                <button
                  key={value.toString()}
                  onClick={() => handleDurationChange(value)}
                  className={tn btn-sm }
                >
                  {value === 'custom' ? 'Custom' : ${value}m}
                </button>
              ))}
            </div>

            <div>
              <button
                className="btn btn-lg bg-red-700 text-white hover:bg-red-600"
                onClick={handleStart}
                disabled={pending || sprintStarting || !selectedProjectId}
              >
                {pending || sprintStarting ? 'Starting…' : 'Start Sprint'}
              </button>
            </div>

            <div className="mt-2">
              <div className="mb-1 text-sm opacity-70">All Projects</div>
              <ul className="divide-y divide-base-100/20">
                {projects.map(project => (
                  <li key={project.id} className="flex items-center justify-between py-2">
                    <span>{project.name}</span>
                    <button onClick={() => handleToggleFavorite(project)} aria-label="Toggle favorite">
                      <Droplet className={project.isFavorite ? 'text-red-600' : 'text-gray-500 hover:text-red-500'} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
