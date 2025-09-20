import React from "react"

import CardShell from "./CardShell"

interface StatsCardProps {
  minutes?: number | null
  sprints?: number | null
  streakDays?: number | null
  loading?: boolean
  className?: string
}

const formatValue = (value?: number | null, formatter?: (value: number) => string) => {
  if (value === null || value === undefined) {
    return "--"
  }

  return formatter ? formatter(value) : `${value}`
}

const skeletonArray = [0, 1, 2]

export default function StatsCard({ minutes, sprints, streakDays, loading = false, className = "" }: StatsCardProps) {
  const items = [
    { label: "Minutes Today", value: formatValue(minutes, (val) => `${val}m`) },
    { label: "Sprints Today", value: formatValue(sprints) },
    { label: "Streak", value: formatValue(streakDays, (val) => `${val} day${val === 1 ? "" : "s"}`) },
  ]

  return (
    <CardShell className={className} fullHeight>
      <div className="card-body gap-5">
        <div className="flex items-center justify-between">
          <h2 className="heading-gilded gold-text text-lg tracking-[0.4em]">TODAY'S STATS</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {skeletonArray.map((key) => (
              <div
                key={key}
                className="h-20 animate-pulse rounded-xl border border-base-content/10 bg-base-100/50"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-base-content/10 bg-base-100/70 px-4 py-3 text-center shadow-sm"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-base-content/60">
                  {item.label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-primary drop-shadow-sm">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardShell>
  )
}
