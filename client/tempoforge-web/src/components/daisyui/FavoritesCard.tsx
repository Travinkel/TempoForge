import React from "react"

import CardShell from "./CardShell"

type FavoritesCardProps = {
  items: string[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  className?: string
}

export default function FavoritesCard({ items, loading = false, error, onRetry, className = "" }: FavoritesCardProps) {
  return (
    <CardShell className={className}>
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-base-content">Favorites</h2>
          {error && onRetry && (
            <button type="button" className="btn btn-xs btn-outline" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex gap-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-9 w-32 animate-pulse rounded-full border border-base-content/15 bg-base-100/60" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
            Unable to load favorites.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-base-content/10 bg-base-100/70 px-3 py-2 text-sm text-base-content/70">
            Mark a project as favorite to see it here.
          </div>
        ) : (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {items.map((item) => (
              <div
                key={item}
                className="whitespace-nowrap rounded-full border border-base-content/15 bg-base-100/80 px-4 py-2 text-sm text-base-content shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </CardShell>
  )
}
