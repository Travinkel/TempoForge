import React from 'react'
import QuickStartCard from '../components/daisyui/QuickStartCard'
import StatsCard from '../components/daisyui/StatsCard'
import ProgressCard from '../components/daisyui/ProgressCard'
import RecentCard from '../components/daisyui/RecentCard'
import FavoritesCard from '../components/daisyui/FavoritesCard'
import Navbar from '../components/daisyui/Navbar'
import TimerCard from '../components/daisyui/TimerCard'
import { ProjectForm, type ProjectCreateInput } from '../components/daisyui/ProjectForm'
import { ProjectList, type Project as ProjectListItem } from '../components/daisyui/ProjectList'
import { useSprintContext } from '../context/SprintContext'
import { useUserSettings } from '../context/UserSettingsContext'
import type { Project as ProjectDto } from '../api/projects'
import { getProjects, getFavoriteProjects, addProject, updateProject, deleteProject } from '../api/projects'

const formatRecentTimestamp = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 0) {
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
  }
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const mapTrackLabel = (track: number): ProjectListItem['track'] => (track === 2 ? 'Study' : 'Work')

const toProjectListItem = (project: ProjectDto): ProjectListItem => ({
  id: project.id,
  name: project.name,
  track: mapTrackLabel(project.track),
  pinned: project.pinned,
  createdAt: project.createdAt,
})

type QuestCardProps = {
  title: string
  items: { label: string; completed: boolean }[]
}

function QuestCard({ title, items }: QuestCardProps) {
  return (
    <div className="card bg-neutral text-neutral-content shadow">
      <div className="card-body gap-3">
        <h3 className="card-title text-lg font-cinzel text-primary">{title}</h3>
        <ul className="space-y-2 text-sm">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-start gap-2">
              <span
                className={`mt-1 inline-flex h-3 w-3 flex-shrink-0 rounded-full ${
                  item.completed ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.65)]' : 'bg-gray-500'
                }`}
              />
              <span className={item.completed ? 'opacity-90 line-through' : 'opacity-80'}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DashboardPage(): JSX.Element {
  const {
    timerLabel,
    active,
    activeSprint,
    canStart,
    progressStats,
    todayStats,
    recentSprints,
    metricsLoading,
    metricsError,
    refreshMetrics,
    questDaily,
    questWeekly,
    statsSummary,
    isCritical,
    startSprint,
    cancelSprint,
    completeSprint,
    plannedProjectId,
    plannedDurationMinutes,
    setPlannedSprint,
    actionPending,
    actionError,
    clearActionError,
  } = useSprintContext()

  const { layout, setLayout } = useUserSettings()
  const handleToggleLayout = React.useCallback(() => {
    setLayout(layout === 'dashboard' ? 'hud' : 'dashboard')
  }, [layout, setLayout])

  const [projects, setProjects] = React.useState<ProjectDto[]>([])
  const [projectsLoading, setProjectsLoading] = React.useState<boolean>(true)
  const [projectsError, setProjectsError] = React.useState<string | null>(null)
  const [favorites, setFavorites] = React.useState<ProjectDto[]>([])
  const [favoritesLoading, setFavoritesLoading] = React.useState<boolean>(true)
  const [favoritesError, setFavoritesError] = React.useState<string | null>(null)
  const [projectSubmitting, setProjectSubmitting] = React.useState<boolean>(false)
  const [projectActionPending, setProjectActionPending] = React.useState<boolean>(false)
  const [quickStartError, setQuickStartError] = React.useState<string | null>(null)

  const loadProjects = React.useCallback(async () => {
    setProjectsLoading(true)
    setProjectsError(null)
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects', error)
      setProjectsError('Unable to load projects right now.')
    } finally {
      setProjectsLoading(false)
    }
  }, [])

  const loadFavorites = React.useCallback(async () => {
    setFavoritesLoading(true)
    setFavoritesError(null)
    try {
      const data = await getFavoriteProjects()
      setFavorites(data)
    } catch (error) {
      console.error('Failed to load favorite projects', error)
      setFavoritesError('Unable to load favorites right now.')
    } finally {
      setFavoritesLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadProjects()
    loadFavorites()
  }, [loadProjects, loadFavorites])

  const handleQuickAddProject = React.useCallback(
    async (name: string, track: number, isFavorite: boolean) => {
      setProjectActionPending(true)
      setQuickStartError(null)
      try {
        await addProject(name, track, isFavorite, false)
        await Promise.all([loadProjects(), loadFavorites()])
      } catch (error) {
        console.error('Failed to add project', error)
        setQuickStartError('Failed to add project. Please try again.')
        throw error
      } finally {
        setProjectActionPending(false)
      }
    },
    [loadProjects, loadFavorites],
  )

  const handleToggleFavorite = React.useCallback(
    async (projectId: string, nextValue: boolean) => {
      setProjectActionPending(true)
      setQuickStartError(null)
      setFavoritesError(null)
      try {
        await updateProject(projectId, { isFavorite: nextValue })
        await Promise.all([loadProjects(), loadFavorites()])
      } catch (error) {
        console.error('Failed to update favorite project', error)
        const message = 'Unable to update favorites right now.'
        setFavoritesError(message)
        setQuickStartError(message)
        throw error
      } finally {
        setProjectActionPending(false)
      }
    },
    [loadProjects, loadFavorites],
  )

  const handleTogglePin = React.useCallback(
    async (projectId: string, nextValue: boolean) => {
      setProjectActionPending(true)
      setProjectsError(null)
      try {
        await updateProject(projectId, { pinned: nextValue })
        await loadProjects()
      } catch (error) {
        console.error('Failed to update project pin state', error)
        setProjectsError('Unable to update project right now.')
      } finally {
        setProjectActionPending(false)
      }
    },
    [loadProjects],
  )

  const handleDeleteProject = React.useCallback(
    async (projectId: string) => {
      if (!window.confirm('Delete this project? This cannot be undone.')) {
        return
      }
      setProjectActionPending(true)
      setProjectsError(null)
      try {
        await deleteProject(projectId)
        await Promise.all([loadProjects(), loadFavorites()])
      } catch (error) {
        console.error('Failed to delete project', error)
        setProjectsError('Unable to delete project right now.')
      } finally {
        setProjectActionPending(false)
      }
    },
    [loadProjects, loadFavorites],
  )

  const handleProjectFormSubmit = React.useCallback(
    async (input: ProjectCreateInput) => {
      setProjectSubmitting(true)
      try {
        const trackNumber = input.track === 'Study' ? 2 : 1
        await addProject(input.name, trackNumber, false, input.pinned)
        await Promise.all([loadProjects(), loadFavorites()])
      } catch (error) {
        console.error('Failed to create project', error)
        throw error
      } finally {
        setProjectSubmitting(false)
      }
    },
    [loadProjects, loadFavorites],
  )

  const handlePlanSprint = React.useCallback(
    (projectId: string | null, durationMinutes: number) => {
      clearActionError()
      setPlannedSprint(projectId, durationMinutes)
    },
    [clearActionError, setPlannedSprint],
  )

  const handleStartSprint = React.useCallback(
    async (projectId: string, durationMinutes: number) => {
      await startSprint({ projectId, durationMinutes })
    },
    [startSprint],
  )

  const plannedProject = React.useMemo(() => {
    return projects.find(p => p.id === plannedProjectId) ?? favorites.find(p => p.id === plannedProjectId) ?? null
  }, [projects, favorites, plannedProjectId])

  const statsCardItems = React.useMemo(
    () => [
      { label: 'Minutes today', value: `${todayStats?.minutesFocused ?? 0}` },
      { label: 'Sprints today', value: `${todayStats?.sprintCount ?? 0}` },
      { label: 'Standing', value: progressStats?.standing ?? 'N/A' },
    ],
    [todayStats, progressStats],
  )

  const recentItems = React.useMemo(() => {
    return recentSprints.map(item => ({
      project: item.projectName,
      duration: `${item.durationMinutes}m`,
      when: formatRecentTimestamp(item.startedAtUtc),
    }))
  }, [recentSprints])

  const projectListItems = React.useMemo(() => projects.map(toProjectListItem), [projects])

  const timerSubtitle = active
    ? activeSprint?.projectName
      ? `Focus sprint in progress • ${activeSprint.projectName}`
      : 'Focus sprint in progress'
    : plannedProject
      ? `${plannedProject.name} • ${plannedDurationMinutes}m`
      : 'Select a project to plan your next sprint'

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar layout={layout} onToggleLayout={handleToggleLayout} />
      <main className="container mx-auto max-w-6xl px-4 py-6">
        {metricsError && (
          <div className="mb-4">
            <div className="alert alert-error shadow-lg">
              <span>{metricsError}</span>
              <button className="btn btn-sm" onClick={() => refreshMetrics(true)}>
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <QuickStartCard
              projects={projects}
              favorites={favorites}
              loading={projectsLoading || favoritesLoading}
              error={quickStartError || actionError || favoritesError}
              plannedProjectId={plannedProjectId}
              plannedDurationMinutes={plannedDurationMinutes}
              sprintStarting={actionPending || projectActionPending}
              onPlanSprint={handlePlanSprint}
              onStartSprint={handleStartSprint}
              onAddProject={handleQuickAddProject}
              onToggleFavorite={handleToggleFavorite}
            />
            <StatsCard items={statsCardItems} loading={metricsLoading} />
            <ProgressCard progress={progressStats} loading={metricsLoading} />
            <FavoritesCard
              items={favorites.map(f => f.name)}
              loading={favoritesLoading}
              error={favoritesError}
              onRetry={loadFavorites}
            />
            <RecentCard
              items={recentItems}
              loading={metricsLoading}
              error={metricsError}
              onRetry={() => refreshMetrics(true)}
            />
          </div>
          <div className="space-y-4 lg:col-span-1">
            <TimerCard
              label={timerLabel}
              subtitle={timerSubtitle}
              active={active}
              isCritical={isCritical}
              canStart={canStart && !!plannedProjectId}
              onStart={() => startSprint()}
              onCancel={cancelSprint}
              onComplete={completeSprint}
            />
            {actionError && (
              <div className="alert alert-warning bg-warning/10 text-warning-content">
                <span>{actionError}</span>
              </div>
            )}
            <QuestCard title="Daily Quests" items={questDaily} />
            <QuestCard title="Weekly Quests" items={questWeekly} />
            <div className="card bg-neutral text-neutral-content">
              <div className="card-body gap-2">
                <h3 className="card-title text-base font-semibold">Streak & Totals</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded bg-base-100/10 px-2 py-3">
                    <div className="text-xs opacity-70">Streak</div>
                    <div className="text-lg font-bold">{statsSummary.streakDays}</div>
                  </div>
                  <div className="rounded bg-base-100/10 px-2 py-3">
                    <div className="text-xs opacity-70">Minutes</div>
                    <div className="text-lg font-bold">{statsSummary.todayMinutes}</div>
                  </div>
                  <div className="rounded bg-base-100/10 px-2 py-3">
                    <div className="text-xs opacity-70">Sprints</div>
                    <div className="text-lg font-bold">{statsSummary.totalSprints}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project Management</h2>
            {projectActionPending && <span className="text-sm opacity-70">Updating…</span>}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ProjectForm onSubmit={handleProjectFormSubmit} submitting={projectSubmitting} />
            <div className="card bg-neutral text-neutral-content">
              <div className="card-body gap-3">
                {projectsError && (
                  <div className="alert alert-warning bg-warning/10 text-warning-content">
                    <span>{projectsError}</span>
                    <button type="button" className="btn btn-xs" onClick={loadProjects}>
                      Retry
                    </button>
                  </div>
                )}
                {projectsLoading ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map(index => (
                      <div key={index} className="h-16 animate-pulse rounded bg-base-100/10" />
                    ))}
                  </div>
                ) : (
                  <ProjectList
                    items={projectListItems}
                    onDelete={handleDeleteProject}
                    onTogglePin={handleTogglePin}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
