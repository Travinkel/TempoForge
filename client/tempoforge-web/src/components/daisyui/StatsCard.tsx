import React from 'react'

type StatItem = {
  label: string
  value: string
}

type StatsCardProps = {
  items?: StatItem[]
}

export default function StatsCard({ items }: StatsCardProps) {
  const displayItems = React.useMemo<StatItem[]>(
    () =>
      items ?? [
        { label: 'Minutes today', value: '50' },
        { label: 'Sprints', value: '2' },
        { label: 'Streak', value: '4 days' },
      ],
    [items]
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {displayItems.map(item => (
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
