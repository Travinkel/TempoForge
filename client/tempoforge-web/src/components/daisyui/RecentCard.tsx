import React from 'react'

type RecentItem = {
  project: string
  duration: string
  when: string
}

type RecentCardProps = {
  items?: RecentItem[]
  onExport?: () => void
}

export default function RecentCard({ items, onExport }: RecentCardProps) {
  const displayItems = items ?? [
    { project: 'Client Alpha', duration: '25m', when: 'Today 14:10' },
    { project: 'Thesis Article', duration: '45m', when: 'Yesterday 19:20' },
    { project: 'Algorithms Review', duration: '15m', when: 'Yesterday 08:40' },
  ]

  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <div className="flex items-center justify-between mb-2">
          <h2 className="card-title font-cinzel text-primary">Recent History</h2>
          <button className="btn btn-xs" onClick={onExport} disabled={!onExport}>
            Export
          </button>
        </div>
        <ul className="mt-2">
          {displayItems.map((item, index) => (
            <li key={index} className="flex items-center justify-between py-2 border-b border-base-100/20 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div>
                  <div className="font-medium">{item.project}</div>
                  <div className="text-sm opacity-70">{item.when}</div>
                </div>
              </div>
              <div className="badge badge-secondary">{item.duration}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
