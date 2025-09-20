import React from "react"

import CardShell from "./CardShell"

type TimerCardProps = {
  label: string
  subtitle: string
  active: boolean
  isCritical: boolean
  canStart?: boolean
  onStart: () => void
  onCancel: () => void
  onComplete: () => void
  className?: string
}

export default function TimerCard({
  label,
  subtitle,
  active,
  isCritical,
  canStart = true,
  onStart,
  onCancel,
  onComplete,
  className = "",
}: TimerCardProps) {
  const timerClass = isCritical
    ? "text-6xl font-mono text-error drop-shadow"
    : "text-6xl font-mono text-primary drop-shadow"

  return (
    <CardShell className={className} fullHeight>
      <div className="card-body items-center justify-center gap-5 text-center">
        <h2 className="text-lg font-semibold text-base-content">Focus Timer</h2>
        <div className={timerClass}>{label}</div>
        <div className="text-sm text-base-content/70">{subtitle}</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {active ? (
            <>
              <button
                type="button"
                className="btn btn-outline btn-error"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onComplete}
              >
                Complete
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onStart}
              disabled={!canStart}
            >
              Start Sprint
            </button>
          )}
        </div>
      </div>
    </CardShell>
  )
}
