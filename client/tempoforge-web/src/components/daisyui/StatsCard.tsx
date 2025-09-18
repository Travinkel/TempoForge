import React from 'react'

type StatItem = {
  label: string
  value: string
}

type StatsCardProps = {
  items: StatItem[]
  loading?: boolean
}

export default function StatsCard({ items, loading = false }: StatsCardProps) {
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
