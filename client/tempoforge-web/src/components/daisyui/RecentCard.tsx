import React from "react"

type RecentItem = {
  project: string
  duration: string
  when: string
}

type RecentCardProps = {
  items?: RecentItem[]
  loading?: boolean
  onExport?: () => void
  error?: string | null
  onRetry?: () => void
  className?: string
}

export default function RecentCard({
  items = [],
  loading = false,
  onExport,
  error,
  onRetry,
  className = "",
}: RecentCardProps) {
  const showExport = Boolean(onExport)
  const cardClassName = [
    "card",
    "bg-base-200/80",
    "text-base-content",
    "border",
    "border-base-content/10",
    "shadow-lg",
    "backdrop-blur",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={cardClassName}>
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-base-content">Recent History</h2>
          <div className="flex gap-2">
            {error && onRetry && (
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={onRetry}
              >
                Retry
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs btn-primary"
              onClick={onExport}
              disabled={!showExport}
            >
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <ul className="space-y-3">
            {[0, 1, 2].map((index) => (
              <li
                key={index}
                className="h-14 animate-pulse rounded-xl border border-base-content/10 bg-base-100/60"
              />
            ))}
          </ul>
        ) : error ? (
          <div className="rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-base-content/10 bg-base-100/70 px-3 py-2 text-sm text-base-content/70">
            No recent sprints yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={`${item.project}-${index}`}
                className="flex items-center justify-between rounded-xl border border-base-content/10 bg-base-100/70 px-4 py-3 text-sm shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                  <div>
                    <div className="font-semibold text-base-content">{item.project}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-base-content/60">{item.when}</div>
                  </div>
                </div>
                <span className="rounded-full border border-base-content/15 bg-base-200/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-base-content/70">
                  {item.duration}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
