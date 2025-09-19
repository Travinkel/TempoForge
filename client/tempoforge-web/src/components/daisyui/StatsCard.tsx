import React from 'react'

interface StatsCardProps {
  minutes?: number | null
  sprints?: number | null
  streakDays?: number | null
  loading?: boolean
  className?: string
}

const formatValue = (value?: number | null, formatter?: (value: number) => string) => {
  if (value === null || value === undefined) {
    return '--'
  }

  return formatter ? formatter(value) : `${value}`
}

const skeletonArray = [0, 1, 2]

export default function StatsCard({ minutes, sprints, streakDays, loading = false, className = '' }: StatsCardProps) {
  const items = [
    { label: 'Minutes today', value: formatValue(minutes, (val) => `${val}m`) },
    { label: 'Sprints today', value: formatValue(sprints) },
    { label: 'Streak', value: formatValue(streakDays, (val) => `${val} day${val === 1 ? '' : 's'}`) },
  ]

  const rootClass = ['card', 'glow-box', 'text-amber-100', 'min-h-[220px]', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      <div className="card-body gap-5">
        <div className="flex items-center justify-between">
          <h2 className="heading-gilded gold-text text-xl">Today's Stats</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {skeletonArray.map((key) => (
              <div
                key={key}
                className="h-20 animate-pulse rounded border border-amber-500/25 bg-black/25"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded border border-amber-500/25 bg-black/35 px-4 py-3 text-center"
              >
                <div className="text-xs uppercase tracking-[0.28em] text-amber-200/70">
                  {item.label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-amber-50 drop-shadow-[0_0_8px_rgba(249,115,22,0.45)]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
