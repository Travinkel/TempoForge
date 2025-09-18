import React from 'react'
import Navbar from '../components/daisyui/Navbar'
import DashboardPage from './DashboardPage'
import HudPage from './HudPage'
import { useSprintContext } from '../context/SprintContext'
import { useUserSettings } from '../context/UserSettingsContext'

type QuestItem = {
  label: string
  completed: boolean
}

type RecentItem = {
  project: string
  duration: string
  when: string
}

const clamp01 = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0
  }
  if (value < 0) {
    return 0
  }
  if (value > 1) {
    return 1
  }
  return value
}

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

export default function Dashboard(): JSX.Element {
  const {
    active,
    timerLabel,
    remainingRatio,
    completedRatio,
    isCritical,
    portalState,
    progressStats,
    todayStats,
    recentSprints,
    metricsLoading,
    metricsError,
    refreshMetrics,
    startSprint,
    cancelSprint,
    completeSprint,
  } = useSprintContext()

  const { layout, toggleLayout } = useUserSettings()

  const statsItems = React.useMemo(
    () => [
      { label: 'Minutes today', value: `${todayStats?.minutesFocused ?? 0}` },
      { label: 'Sprints today', value: `${todayStats?.sprintCount ?? 0}` },
      { label: 'Standing', value: progressStats?.standing ?? 'N/A' },
    ],
    [todayStats, progressStats],
  )

  const buildQuestList = React.useCallback(
    (type: 'daily' | 'weekly'): QuestItem[] => {
      if (metricsLoading && !progressStats) {
        return [
          { label: `Loading ${type} goals...`, completed: false },
          { label: 'Loading progress...', completed: false },
        ]
      }
      if (!progressStats) {
        return type === 'daily'
          ? [
              { label: 'Complete 3 sprints today', completed: false },
              { label: 'Maintain your streak', completed: false },
            ]
          : [
              { label: 'Complete 12 sprints this week', completed: false },
              { label: 'Keep forging momentum', completed: false },
            ]
      }

      const { quest } = progressStats
      if (type === 'daily') {
        const dailyGoal = quest.dailyGoal || 0
        const completed = quest.dailyCompleted
        const bounded = dailyGoal > 0 ? Math.min(completed, dailyGoal) : completed
        const streakDays = todayStats?.streakDays ?? 0
        return [
          {
            label: `Complete ${dailyGoal} sprint${dailyGoal === 1 ? '' : 's'} today (${bounded}/${dailyGoal})`,
            completed: dailyGoal > 0 && completed >= dailyGoal,
          },
          {
            label: `Maintain streak (${streakDays} day${streakDays === 1 ? '' : 's'})`,
            completed: dailyGoal > 0 ? streakDays >= dailyGoal : streakDays > 0,
          },
        ]
      }

      const weeklyGoal = quest.weeklyGoal || 0
      const weeklyCompleted = quest.weeklyCompleted
      const boundedWeekly = weeklyGoal > 0 ? Math.min(weeklyCompleted, weeklyGoal) : weeklyCompleted
      const remainingToNext =
        progressStats.nextThreshold === null
          ? 0
          : Math.max(progressStats.nextThreshold - progressStats.completedSprints, 0)
      const nextLabel =
        progressStats.nextThreshold === null
          ? 'At max rank'
          : `${remainingToNext} sprint${remainingToNext === 1 ? '' : 's'} to next rank`

      return [
        {
          label: `Complete ${weeklyGoal} sprint${weeklyGoal === 1 ? '' : 's'} this week (${boundedWeekly}/${weeklyGoal})`,
          completed: weeklyGoal > 0 && weeklyCompleted >= weeklyGoal,
        },
        {
          label: nextLabel,
          completed: progressStats.nextThreshold === null,
        },
      ]
    },
    [metricsLoading, progressStats, todayStats],
  )

  const questDaily = React.useMemo(() => buildQuestList('daily'), [buildQuestList])
  const questWeekly = React.useMemo(() => buildQuestList('weekly'), [buildQuestList])

  const recentItems = React.useMemo<RecentItem[] | undefined>(() => {
    if (!recentSprints.length) {
      return undefined
    }
    return recentSprints.map(item => ({
      project: item.projectName,
      duration: `${item.durationMinutes}m`,
      when: formatRecentTimestamp(item.startedAtUtc),
    }))
  }, [recentSprints])

  const percentToNext = progressStats ? clamp01(progressStats.percentToNext) : 0
  const actionBarProgress = active ? completedRatio : percentToNext
  const actionBarLabel = active
    ? timerLabel
    : progressStats
      ? `Standing: ${progressStats.standing} (${Math.round(percentToNext * 100)}%)`
      : undefined

  const statsPanel = React.useMemo(
    () => ({
      streakDays: todayStats?.streakDays ?? 0,
      todayMinutes: todayStats?.minutesFocused ?? 0,
      totalSprints: progressStats?.completedSprints ?? 0,
    }),
    [todayStats, progressStats],
  )

  const handleRefresh = React.useCallback(() => {
    void refreshMetrics(true)
  }, [refreshMetrics])

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar layout={layout} onToggleLayout={toggleLayout} />
      {layout === 'daisyui' ? (
        <DashboardPage
          statsItems={statsItems}
          progressStats={progressStats}
          progressLoading={metricsLoading}
          recentItems={recentItems}
          timerLabel={timerLabel}
          timerSubtitle={active ? 'Focus sprint in progress' : 'Ready to forge your focus'}
          metricsError={metricsError}
          onRetry={handleRefresh}
        />
      ) : (
        <HudPage
          portalState={portalState}
          questDaily={questDaily}
          questWeekly={questWeekly}
          lifeOrb={{ progress: remainingRatio, label: timerLabel, pulsing: isCritical }}
          manaOrb={{ progress: remainingRatio }}
          actionBar={{
            progress: actionBarProgress,
            timerLabel: actionBarLabel,
            canStart: !active,
            canCancel: active,
            canComplete: active,
            canViewStats: true,
            onStart: startSprint,
            onCancel: cancelSprint,
            onComplete: completeSprint,
            onViewStats: handleRefresh,
          }}
          statsPanel={statsPanel}
          metricsError={metricsError}
          onRetry={handleRefresh}
          active={active}
          overlayActionBar={{
            progress: completedRatio,
            timerLabel,
            onCancel: cancelSprint,
            onComplete: completeSprint,
            onViewStats: handleRefresh,
          }}
        />
      )}
    </div>
  )
}
