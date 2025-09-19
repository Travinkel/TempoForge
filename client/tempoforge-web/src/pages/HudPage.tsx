import React from 'react'

import AvatarSprite from '../components/hud/AvatarSprite'
import LifeOrb from '../components/hud/LifeOrb'
import ManaOrb from '../components/hud/ManaOrb'
import QuestPanel from '../components/hud/QuestPanel'
import StatsPanel from '../components/hud/StatsPanel'
import ActionBar from '../components/hud/ActionBar'
import { useSprintContext } from '../context/SprintContext'
import { useUserSettings } from '../context/UserSettingsContext'

const HUD_BACKGROUND = '/assets/town.png'
const HUD_GRAIN = '/assets/grain.png'

export default function HudPage(): JSX.Element {
  const allowLayoutToggle = import.meta.env.DEV

  const {
    portalState,
    active,
    remainingRatio,
    completedRatio,
    percentToNext,
    timerLabel,
    isCritical,
    canStart,
    actionPending,
    actionError,
    questDaily,
    questWeekly,
    statsSummary,
    todayStats,
    progressStats,
    metricsLoading,
    metricsError,
    refreshMetrics,
    startSprint,
    cancelSprint,
    completeSprint,
  } = useSprintContext()

  const { setLayout } = useUserSettings()
  const showLayoutToggle = allowLayoutToggle && typeof setLayout === 'function'

  const handleReturnToDashboard = React.useCallback(() => {
    setLayout('daisyui')
  }, [setLayout])

  const actionBarProgress = active ? completedRatio : percentToNext

  const actionBarLabel = active
    ? timerLabel
    : progressStats
      ? `Standing: ${progressStats.standing} (${Math.round(percentToNext * 100)}%)`
      : undefined

  return (
    <div className="relative flex min-h-screen w-full justify-center overflow-hidden bg-black text-yellow-100">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${HUD_BACKGROUND}')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[url('${HUD_GRAIN}')] opacity-15 mix-blend-soft-light"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full flex-col">
        {showLayoutToggle && (
          <div className="flex justify-end px-6 pt-6">
            <button
              type="button"
              className="pointer-events-auto rounded border border-yellow-500/60 bg-yellow-800/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-200 shadow-[0_0_14px_rgba(217,119,6,0.45)] transition hover:border-yellow-300/80 hover:bg-yellow-700/40"
              onClick={handleReturnToDashboard}
            >
              Return to DaisyUI
            </button>
          </div>
        )}

        <div className="flex-1 px-6 pb-28 pt-10">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6">
            {metricsError && (
              <div className="pointer-events-auto rounded border border-red-800/50 bg-red-900/40 px-4 py-3 text-sm shadow-lg shadow-red-900/40">
                <div className="font-semibold uppercase tracking-[0.2em] text-red-200">Warning</div>
                <div className="text-red-100/90">{metricsError}</div>
                <button
                  type="button"
                  className="mt-2 rounded bg-red-800/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-red-100 transition hover:bg-red-700/60"
                  onClick={() => refreshMetrics(true)}
                >
                  Retry
                </button>
              </div>
            )}

            {actionError && (
              <div className="pointer-events-auto rounded border border-yellow-800/50 bg-yellow-900/40 px-4 py-3 text-sm shadow-lg shadow-yellow-900/40">
                <div className="font-semibold uppercase tracking-[0.2em] text-yellow-200">Notice</div>
                <div className="text-yellow-100/90">{actionError}</div>
              </div>
            )}

            <div className="grid flex-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="pointer-events-auto flex flex-col gap-4">
                <QuestPanel daily={questDaily} weekly={questWeekly} />
                {progressStats && (
                  <div className="rounded border border-yellow-500/30 bg-black/40 px-6 py-4 text-center shadow-lg shadow-black/50 backdrop-blur-sm">
                    <div className="font-cinzel text-xs uppercase tracking-[0.4em] text-yellow-200/90">
                      Forge Standing
                    </div>
                    <div className="gold-text mt-1 text-3xl font-semibold">{progressStats.standing}</div>
                    <div className="mt-2 text-xs text-yellow-100/80">
                      {Math.round(progressStats.percentToNext * 100)}% to next threshold
                    </div>
                  </div>
                )}
              </div>

              <div className="pointer-events-auto flex flex-col gap-4 md:items-end">
                <StatsPanel
                  streakDays={statsSummary.streakDays}
                  todayMinutes={statsSummary.todayMinutes}
                  todaySprints={statsSummary.todaySprints}
                  totalSprints={statsSummary.totalSprints}
                  loading={metricsLoading}
                />

                {todayStats && (
                  <div className="rounded border border-yellow-500/20 bg-black/35 px-6 py-4 text-sm text-yellow-100/90 shadow-md shadow-black/50 backdrop-blur-sm md:w-[340px]">
                    <div className="gold-text text-base font-semibold uppercase tracking-[0.3em]">
                      Today&apos;s Focus
                    </div>
                    <div className="mt-3 flex justify-between">
                      <span className="text-yellow-200/90">Sprints</span>
                      <span className="font-semibold">{todayStats.sprintCount}</span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-yellow-200/90">Minutes</span>
                      <span className="font-semibold">{todayStats.minutesFocused}</span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-yellow-200/90">Streak</span>
                      <span className="font-semibold">{todayStats.streakDays} days</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex w-full justify-center pb-10">
          <div className="relative flex w-full max-w-5xl flex-col items-center justify-end">
            <AvatarSprite
              state={portalState}
              className="pointer-events-none absolute bottom-32 left-1/2 -translate-x-1/2 drop-shadow-[0_12px_18px_rgba(0,0,0,0.85)]"
            />

            <div className="flex w-full items-end justify-between gap-6 px-6 md:px-10">
              <LifeOrb
                progress={remainingRatio}
                label={timerLabel}
                pulsing={isCritical}
                className="drop-shadow-[0_14px_30px_rgba(239,68,68,0.45)]"
              />
              <ActionBar
                progress={actionBarProgress}
                timerLabel={actionBarLabel}
                canStart={!active && canStart && !actionPending}
                canCancel={active && !actionPending}
                canComplete={active && !actionPending}
                canViewStats
                onStart={() => {
                  void startSprint()
                }}
                onCancel={() => {
                  void cancelSprint()
                }}
                onComplete={() => {
                  void completeSprint()
                }}
                onViewStats={() => {
                  void refreshMetrics(true)
                }}
                className="w-full max-w-xl"
              />
              <ManaOrb
                progress={remainingRatio}
                pulsing={isCritical}
                className="drop-shadow-[0_14px_30px_rgba(14,165,233,0.35)]"
              />
            </div>
          </div>
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/80 text-yellow-100 backdrop-blur-md">
          <AvatarSprite state={portalState} />
          <div className="gold-text font-cinzel text-sm uppercase tracking-[0.35em]">Focus Mode Engaged</div>
          <div className="max-w-sm text-center text-xs text-yellow-100/80 md:text-sm">
            Stay with the sprint. Use the action bar below if you need to cancel early.
          </div>
          <ActionBar
            progress={completedRatio}
            timerLabel={timerLabel}
            canStart={false}
            canCancel={!actionPending}
            canComplete={!actionPending}
            onCancel={() => {
              void cancelSprint()
            }}
            onComplete={() => {
              void completeSprint()
            }}
            onViewStats={() => {
              void refreshMetrics(true)
            }}
            className="w-full max-w-xl"
          />
          <div className="text-xs opacity-80 md:text-sm">Press Cancel to forfeit this sprint</div>
        </div>
      )}
    </div>
  )
}

