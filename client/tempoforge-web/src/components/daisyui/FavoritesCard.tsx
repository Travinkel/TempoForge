import React from 'react'

type FavoritesCardProps = {
  items: string[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  className?: string
}

export default function FavoritesCard({ items, loading = false, error, onRetry, className = '' }: FavoritesCardProps) {
  const cardClassName = ['card', 'glow-box', 'text-amber-100', 'min-h-[200px]', className].filter(Boolean).join(' ')

  return (
    <div className={cardClassName}>
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="heading-gilded gold-text text-xl">Favorites</h2>
          {error && onRetry && (
            <button
              type="button"
              className="btn btn-xs border border-amber-500/40 bg-black/40 text-amber-200/80 hover:border-amber-400"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex gap-2">
            {[0, 1, 2].map(index => (
              <div
                key={index}
                className="h-9 w-32 animate-pulse rounded-full border border-amber-500/20 bg-black/40"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded border border-red-500/40 bg-red-900/20 px-3 py-2 text-sm text-red-200">
            Unable to load favorites.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded border border-amber-500/20 bg-black/30 px-3 py-2 text-sm text-amber-100/70">
            Mark a project as favorite to see it here.
          </div>
        ) : (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {items.map(item => (
              <div
                key={item}
                className="whitespace-nowrap rounded-full border border-amber-500/40 bg-gradient-to-b from-[#3b2915] to-[#1b0d05] px-4 py-2 text-amber-50 shadow-[inset_0_1px_0_rgba(255,200,120,0.15)]"
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
