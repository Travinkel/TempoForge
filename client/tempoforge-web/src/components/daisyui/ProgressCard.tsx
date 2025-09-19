import React from 'react'
import type { ProgressStats } from '../../api/sprints'

type ProgressCardProps = {
  progress: ProgressStats | null
  loading?: boolean
  className?: string
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

export default function ProgressCard({ progress, loading = false, className = '' }: ProgressCardProps) {
  const pct = clamp01(progress?.percentToNext ?? 0)
  const pctDisplay = Math.round(pct * 100)
  const nextLabel = React.useMemo(() => {
    if (!progress) return 'Awaiting progress data'
    if (progress.nextThreshold === null) return 'Max rank achieved'
    const remaining = Math.max(progress.nextThreshold - progress.completedSprints, 0)
    return `${remaining} sprint${remaining === 1 ? '' : 's'} to next rank`
  }, [progress])

  const summaryLabel = loading ? 'Calculating progress...' : nextLabel
  const standingLabel = loading ? '—' : progress?.standing ?? 'N/A'

  const cardClassName = ['card', 'glow-box', 'text-amber-100', 'min-h-[200px]', className].filter(Boolean).join(' ')

  return (
    <div className={cardClassName}>
      <div className="card-body gap-5 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="heading-gilded gold-text text-xl">Rank Progress</h2>
            <p className="text-sm text-amber-100/75">{summaryLabel}</p>
          </div>
          <div className="rounded border border-amber-500/40 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.28em] text-amber-200/80">
            Standing: {standingLabel}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-amber-200/70">
            <span>Progress</span>
            <span>{loading ? '--' : `${pctDisplay}%`}</span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-amber-500/30 bg-black/60">
            <div
              className="h-full molten-gold transition-all duration-500"
              style={{ width: `${loading ? 0 : pctDisplay}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded border border-amber-500/15 bg-black/30 px-3 py-2">
            <div className="text-xs uppercase tracking-[0.24em] text-amber-200/60">Completed</div>
            <div className="text-lg font-semibold text-amber-50">
              {loading ? '—' : progress?.completedSprints ?? '—'}
            </div>
          </div>
          <div className="rounded border border-amber-500/15 bg-black/30 px-3 py-2">
            <div className="text-xs uppercase tracking-[0.24em] text-amber-200/60">Next Threshold</div>
            <div className="text-lg font-semibold text-amber-50">
              {loading ? '—' : progress?.nextThreshold ?? 'Maxed'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

