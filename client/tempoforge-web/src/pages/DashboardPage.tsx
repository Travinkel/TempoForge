import React from "react"

import StatsCard from "../components/daisyui/StatsCard"
import ProgressCard from "../components/daisyui/ProgressCard"
import RecentCard from "../components/daisyui/RecentCard"
import FavoritesCard from "../components/daisyui/FavoritesCard"
import { useSprintContext } from "../context/SprintContext"
import type { Project as ProjectDto } from "../api/projects"
import { getFavoriteProjects } from "../api/projects"

type QuestCardProps = {
  title: string
  items: { label: string; completed: boolean }[]
  className?: string
}

function QuestCard({ title, items, className = "" }: QuestCardProps) {
  const wrapperClass = [
    "card",
    "bg-base-200/80",
    "text-base-content",
    "border",
    "border-base-content/10",
    "shadow-lg",
    "backdrop-blur",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={wrapperClass}>
      <div className="card-body gap-3">
        <h3 className="text-lg font-semibold text-base-content">{title}</h3>
        <ul className="space-y-2 text-sm">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-start gap-2">
              <span
                className={`mt-1 inline-flex h-3 w-3 flex-shrink-0 rounded-full border border-base-content/20 ${
                  item.completed ? "bg-success" : "bg-base-300"
                }`}
              />
              <span className={item.completed ? "line-through text-base-content/50" : "text-base-content/80"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const formatRecentTimestamp = (iso: string): string => {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return "Unknown"
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 1) {
    return "Just now"
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
    return `Yesterday ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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
      console.error("Failed to load favorite projects", error)
      setFavoritesError("Unable to load favorites.")
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 py-10">
        <div className="mx-auto max-w-7xl px-4 text-center md:text-left">
          <h1 className="text-4xl font-bold text-base-content md:text-5xl">TempoForge</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.35em] text-base-content/60">Forge Command Dashboard</p>
          <p className="mt-3 text-sm text-base-content/70 md:max-w-2xl">
            Track sprints, rally quests, and steward the forge with live updates gathered from your focus routines.
          </p>
        </div>

        {metricsError && (
          <div className="mx-auto mt-6 max-w-7xl px-4">
            <div className="alert alert-error">
              <span>{metricsError}</span>
              <button className="btn btn-sm" onClick={() => refreshMetrics(true)}>
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              className="lg:col-span-2"
              minutes={statsCardData.minutes}
              sprints={statsCardData.sprints}
              streakDays={statsCardData.streakDays}
              loading={metricsLoading}
            />

            <ProgressCard progress={progressStats ?? null} loading={metricsLoading} />

            <QuestCard title="Daily Quests" items={questDaily} />

            <QuestCard title="Weekly Quests" items={questWeekly} />

            <RecentCard
              className="lg:col-span-2"
              items={recentItems}
              loading={metricsLoading}
              error={metricsError}
              onRetry={() => refreshMetrics(true)}
            />

            <FavoritesCard
              items={favorites.map((f) => f.name)}
              loading={favoritesLoading}
              error={favoritesError}
              onRetry={loadFavorites}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
