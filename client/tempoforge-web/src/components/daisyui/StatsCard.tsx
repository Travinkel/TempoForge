import React from 'react'

type StatsCardProps = {
  minutes?: number | null
  sprints?: number | null
  streakDays?: number | null
  loading?: boolean
}

const formatValue = (value?: number | null, formatter?: (value: number) => string) => {
  if (value === null || value === undefined) {
    return '--'
  }
  return formatter ? formatter(value) : `${value}`
}

export default function StatsCard({ minutes, sprints, streakDays, loading = false }: StatsCardProps) {
  const items = [
    { label: 'Minutes today', value: formatValue(minutes, val => `${val}m`) },
    { label: 'Sprints today', value: formatValue(sprints) },
    { label: 'Streak', value: formatValue(streakDays, val => `${val} day${val === 1 ? '' : 's'}`) },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {loading
        ? [0, 1, 2].map(index => (
            <div key={index} className="card bg-neutral text-neutral-content">
              <div className="card-body h-full animate-pulse p-4" />
            </div>
          ))
        : items.map(item => (
            <div key={item.label} className="card bg-neutral text-neutral-content">
              <div className="card-body p-4">
                <div className="text-sm opacity-70">{item.label}</div>
                <div className="text-2xl font-bold">{item.value}</div>
              </div>
            </div>
          ))}
    </div>
  )
}
