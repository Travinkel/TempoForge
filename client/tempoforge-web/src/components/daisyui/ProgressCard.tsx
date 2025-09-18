import React from 'react'
import type { ProgressStats } from '../../api/sprints'

type ProgressCardProps = {
  progress: ProgressStats | null
  loading?: boolean
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

export default function ProgressCard({ progress, loading = false }: ProgressCardProps) {
  const pct = clamp01(progress?.percentToNext ?? 0)
  const pctDisplay = Math.round(pct * 100)
  const nextLabel = React.useMemo(() => {
    if (!progress) return 'Awaiting progress data'
    if (progress.nextThreshold === null) return 'Max rank achieved'
    const remaining = Math.max(progress.nextThreshold - progress.completedSprints, 0)
    return `${remaining} sprint${remaining === 1 ? '' : 's'} to next rank`
  }, [progress])

  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="opacity-70 font-cinzel">Progress</span>
              <span className="text-sm font-cinzel">{loading ? '--' : `${pctDisplay}%`}</span>
            </div>
            <div className="w-full h-3 bg-[#1b1b1b] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full molten-gold transition-all duration-500"
                style={{ width: `${loading ? 0 : pctDisplay}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="badge badge-primary badge-outline p-3">
              Standing: {progress?.standing ?? 'N/A'}
            </div>
            <div className="badge badge-secondary p-3">{loading ? 'Calculating...' : nextLabel}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
