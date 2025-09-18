import React from 'react'

type RecentItem = {
  project: string
  duration: string
  when: string
}

type RecentCardProps = {
  items: RecentItem[]
  loading?: boolean
  onExport?: () => void
  error?: string | null
  onRetry?: () => void
}

export default function RecentCard({ items, loading = false, onExport, error, onRetry }: RecentCardProps) {
  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="card-title font-cinzel text-primary">Recent History</h2>
          <button className="btn btn-xs" onClick={onExport} disabled={!onExport}>
            Export
          </button>
        </div>
        {loading ? (
          <ul className="mt-2 space-y-2">
            {[0, 1, 2].map(index => (
              <li key={index} className="h-12 animate-pulse rounded bg-base-100/10" />
            ))}
          </ul>
        ) : error ? (
          <div className="rounded bg-base-100/10 px-3 py-2 text-sm opacity-90">
            {error}
            {onRetry && (
              <button type="button" className="ml-2 underline" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded bg-base-100/10 px-3 py-2 text-sm opacity-80">No recent sprints yet.</div>
        ) : (
          <ul className="mt-2">
            {items.map((item, index) => (
              <li key={${item.project}-} className="flex items-center justify-between border-b border-base-100/20 py-2 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <div className="font-medium">{item.project}</div>
                    <div className="text-sm opacity-70">{item.when}</div>
                  </div>
                </div>
                <div className="badge badge-secondary">{item.duration}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
