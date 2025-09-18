import ActionBar, { type ActionBarProps } from '../components/hud/ActionBar'
import LifeOrb from '../components/hud/LifeOrb'
import ManaOrb from '../components/hud/ManaOrb'
import QuestPanel from '../components/hud/QuestPanel'
import StatsPanel from '../components/hud/StatsPanel'
import AvatarSprite from '../components/hud/AvatarSprite'
import type { PortalCinematicState } from '../hooks/usePortalCinematics'

type QuestItem = {
  label: string
  completed: boolean
}

type HudPageProps = {
  portalState: PortalCinematicState
  questDaily: QuestItem[]
  questWeekly: QuestItem[]
  lifeOrb: {
    progress: number
    label: string
    pulsing: boolean
  }
  manaOrb: {
    progress: number
  }
  actionBar: ActionBarProps
  statsPanel: {
    streakDays: number
    todayMinutes: number
    totalSprints: number
  }
  metricsError?: string | null
  onRetry?: () => void
  active: boolean
  overlayActionBar: {
    progress: number
    timerLabel: string
    onCancel: () => void
    onComplete: () => void
    onViewStats: () => void
  }
}

export default function HudPage({
  portalState,
  questDaily,
  questWeekly,
  lifeOrb,
  manaOrb,
  actionBar,
  statsPanel,
  metricsError,
  onRetry,
  active,
  overlayActionBar,
}: HudPageProps): JSX.Element {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-black text-yellow-100">
      <div className="town-porthole absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-black/40 to-black" aria-hidden="true" />
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute bottom-[9%] left-1/2 -translate-x-1/2">
          <AvatarSprite state={portalState} />
        </div>
      </div>

      <div className="relative z-20 flex min-h-[calc(100vh-4rem)] flex-col justify-end pb-10">
        {metricsError && (
          <div className="mx-auto mb-6 max-w-lg rounded border border-red-800/50 bg-red-900/40 px-4 py-3 text-sm shadow-lg shadow-red-900/40">
            <div className="font-semibold uppercase tracking-[0.2em] text-red-200">Warning</div>
            <div className="text-red-100/90">{metricsError}</div>
            {onRetry && (
              <button
                type="button"
                className="mt-2 rounded bg-red-800/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-red-100"
                onClick={onRetry}
              >
                Retry
              </button>
            )}
          </div>
        )}

        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex items-end justify-between gap-6">
            <div className="pointer-events-auto flex flex-col gap-4">
              <QuestPanel daily={questDaily} weekly={questWeekly} />
              <LifeOrb progress={lifeOrb.progress} label={lifeOrb.label} pulsing={lifeOrb.pulsing} />
            </div>
            <div className="pointer-events-auto flex flex-col items-center gap-6">
              <ActionBar
                progress={actionBar.progress}
                timerLabel={actionBar.timerLabel}
                canStart={actionBar.canStart}
                canCancel={actionBar.canCancel}
                canComplete={actionBar.canComplete}
                canViewStats={actionBar.canViewStats}
                onStart={actionBar.onStart}
                onCancel={actionBar.onCancel}
                onComplete={actionBar.onComplete}
                onViewStats={actionBar.onViewStats}
              />
            </div>
            <div className="pointer-events-auto flex flex-col items-end gap-4">
              <StatsPanel
                streakDays={statsPanel.streakDays}
                todayMinutes={statsPanel.todayMinutes}
                totalSprints={statsPanel.totalSprints}
              />
              <ManaOrb progress={manaOrb.progress} />
            </div>
          </div>
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-yellow-100">
            <AvatarSprite state={portalState} />
            <div className="font-cinzel text-sm uppercase tracking-[0.35em]">Focus Mode Engaged</div>
            <div className="max-w-sm text-xs text-yellow-100/80 md:text-sm">
              Stay with the sprint. Use the action bar below if you need to cancel early.
            </div>
            <ActionBar
              progress={overlayActionBar.progress}
              timerLabel={overlayActionBar.timerLabel}
              canStart={false}
              canCancel
              canComplete
              onCancel={overlayActionBar.onCancel}
              onComplete={overlayActionBar.onComplete}
              onViewStats={overlayActionBar.onViewStats}
              className="mx-auto"
            />
            <div className="text-sm opacity-80">Press Cancel to forfeit this sprint</div>
          </div>
        </div>
      )}
    </div>
  )
}
