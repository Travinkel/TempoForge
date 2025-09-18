import React from 'react'

type FavoritesCardProps = {
  items: string[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

export default function FavoritesCard({ items, loading = false, error, onRetry }: FavoritesCardProps) {
  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="card-title font-cinzel text-primary">Favorites</h2>
          {error && onRetry && (
            <button type="button" className="btn btn-xs" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex gap-2">
            {[0, 1, 2].map(index => (
              <div key={index} className="h-9 w-32 animate-pulse rounded-full bg-base-100/30" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded bg-base-100/10 px-3 py-2 text-sm opacity-90">Unable to load favorites.</div>
        ) : items.length === 0 ? (
          <div className="rounded bg-base-100/10 px-3 py-2 text-sm opacity-80">
            Mark a project as favorite to see it here.
          </div>
        ) : (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {items.map(item => (
              <div
                key={item}
                className="whitespace-nowrap rounded-full border border-yellow-700/60 bg-gradient-to-b from-[#3b3b3b] to-[#222] px-4 py-2 text-yellow-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
