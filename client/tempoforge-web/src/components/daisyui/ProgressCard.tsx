import React from "react"
import type { ProgressStats } from "../../api/sprints"

import CardShell from "./CardShell"

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

export default function ProgressCard({ progress, loading = false, className = "" }: ProgressCardProps) {
  const pct = clamp01(progress?.percentToNext ?? 0)
  const pctDisplay = Math.round(pct * 100)
  const nextLabel = React.useMemo(() => {
    if (!progress) return "Awaiting progress data"
    if (progress.nextThreshold === null) return "Max rank achieved"
    const remaining = Math.max(progress.nextThreshold - progress.completedSprints, 0)
    return `${remaining} sprint${remaining === 1 ? "" : "s"} to next rank`
  }, [progress])

  const summaryLabel = loading ? "Calculating progress..." : nextLabel
  const standingLabel = loading ? "-" : progress?.standing ?? "N/A"

  return (
    <CardShell className={className}>
      <div className="card-body gap-5 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-base-content">Rank Progress</h2>
            <p className="text-sm text-base-content/70">{summaryLabel}</p>
          </div>
          <div className="rounded-full border border-base-content/10 bg-base-100/70 px-3 py-1 text-xs uppercase tracking-[0.28em] text-base-content/70">
            Standing: {standingLabel}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-base-content/60">
            <span>Progress</span>
            <span>{loading ? "--" : `${pctDisplay}%`}</span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-base-content/10 bg-base-300/50">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${loading ? 0 : pctDisplay}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-base-content/10 bg-base-100/70 px-3 py-2">
            <div className="text-xs uppercase tracking-[0.24em] text-base-content/60">Completed</div>
            <div className="text-lg font-semibold text-base-content">
              {loading ? "-" : progress?.completedSprints ?? "-"}
            </div>
          </div>
          <div className="rounded-xl border border-base-content/10 bg-base-100/70 px-3 py-2">
            <div className="text-xs uppercase tracking-[0.24em] text-base-content/60">Next Threshold</div>
            <div className="text-lg font-semibold text-base-content">
              {loading ? "-" : progress?.nextThreshold ?? "Maxed"}
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  )
}
