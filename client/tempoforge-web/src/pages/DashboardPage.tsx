import React from 'react'

import StatsCard from '../components/daisyui/StatsCard'
import ProgressCard from '../components/daisyui/ProgressCard'
import RecentCard from '../components/daisyui/RecentCard'
import FavoritesCard from '../components/daisyui/FavoritesCard'
import { useSprintContext } from '../context/SprintContext'
import type { Project as ProjectDto } from '../api/projects'
import { getFavoriteProjects } from '../api/projects'

const formatRecentTimestamp = (iso: string): string => {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 1) {
    return 'Just now'
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

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type QuestCardProps = {
  title: string
  items: { label: string; completed: boolean }[]
  className?: string
}

function QuestCard({ title, items, className = '' }: QuestCardProps) {
  const wrapperClass = ['card', 'glow-box', 'text-amber-100', 'min-h-[200px]', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClass}>
      <div className="card-body gap-3">
        <h3 className="heading-gilded gold-text text-lg">{title}</h3>
        <ul className="space-y-2 text-sm">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-start gap-2">
              <span
                className={`mt-1 inline-flex h-3 w-3 flex-shrink-0 rounded-full ring-1 ring-amber-200/70 ${
                  item.completed
                    ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.65)]'
                    : 'bg-gray-500'
                }`}
              />
              <span
                className={
                  item.completed
                    ? 'line-through text-amber-200/60'
                    : 'text-amber-100/90'
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function DashboardPage(): JSX.Element {
  const {
    progressStats,
    todayStats,
    recentSprints,
    questDaily,
    questWeekly,
    metricsLoading,
    metricsError,
    refreshMetrics,
  } = useSprintContext()

  const [favorites, setFavorites] = React.useState<ProjectDto[]>([])
  const [favoritesLoading, setFavoritesLoading] = React.useState<boolean>(true)
  const [favoritesError, setFavoritesError] = React.useState<string | null>(null)

  const loadFavorites = React.useCallback(async () => {
    setFavoritesLoading(true)
    setFavoritesError(null)
    try {
      const data = await getFavoriteProjects()
      setFavorites(data)
    } catch (error) {
      console.error('Failed to load favorite projects', error)
      setFavoritesError('Unable to load favorites.')
    } finally {
      setFavoritesLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadFavorites()
  }, [loadFavorites])

  const statsCardData = React.useMemo(
    () => ({
      minutes: todayStats?.minutesFocused ?? null,
      sprints: todayStats?.sprintCount ?? null,
      streakDays: todayStats?.streakDays ?? null,
    }),
    [todayStats],
  )

  const recentItems = React.useMemo(
    () =>
      recentSprints.map((item) => ({
        project: item.projectName,
        duration: `${item.durationMinutes}m`,
        when: formatRecentTimestamp(item.startedAtUtc),
      })),
    [recentSprints],
  )

  const summaryGrid = (
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        className="min-h-[220px] lg:col-span-2"
        minutes={statsCardData.minutes}
        sprints={statsCardData.sprints}
        streakDays={statsCardData.streakDays}
        loading={metricsLoading}
      />

      <ProgressCard
        className="min-h-[220px]"
        progress={progressStats}
        loading={metricsLoading}
      />

      <QuestCard
        title="Daily Quests"
        items={questDaily}
        className="min-h-[200px]"
      />

      <QuestCard
        title="Weekly Quests"
        items={questWeekly}
        className="min-h-[200px]"
      />

      <RecentCard
        className="min-h-[220px] lg:col-span-2"
        items={recentItems}
        loading={metricsLoading}
        error={metricsError}
        onRetry={() => refreshMetrics(true)}
      />

      <FavoritesCard
        className="min-h-[200px]"
        items={favorites.map((f) => f.name)}
        loading={favoritesLoading}
        error={favoritesError}
        onRetry={loadFavorites}
      />
    </div>
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-300/40">
      <div className="pointer-events-none absolute inset-0 bg-[url('/assets/grain.png')] opacity-10 mix-blend-soft-light" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-base-300/60 via-base-200/10 to-base-300/80" />

      <div className="relative z-10 py-10">
        <div className="mx-auto max-w-7xl px-4 text-center md:text-left">
          <h1 className="text-4xl font-bold metal-text md:text-5xl">TempoForge</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.35em] text-amber-200/80">Forge Command Dashboard</p>
          <p className="mt-3 text-sm text-amber-100/80 md:max-w-2xl">
            Track sprints, rally quests, and steward the forge with live realm updates.
          </p>
        </div>

        {metricsError && (
          <div className="mx-auto mt-6 max-w-7xl px-4">
            <div className="alert alert-error bg-error/20 text-error-content shadow-lg shadow-red-900/30 backdrop-blur">
              <span>{metricsError}</span>
              <button
                className="btn btn-sm"
                onClick={() => refreshMetrics(true)}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">{summaryGrid}</div>
      </div>
    </div>
  )
}
