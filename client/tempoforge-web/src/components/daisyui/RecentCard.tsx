
import React from "react";

type RecentItem = {
  project: string;
  duration: string;
  when: string;
};

type RecentCardProps = {
  items?: RecentItem[];
  loading?: boolean;
  onExport?: () => void;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
};

export default function RecentCard({
  items = [],
  loading = false,
  onExport,
  error,
  onRetry,
  className = '',
}: RecentCardProps) {
  const showExport = Boolean(onExport);
  const cardClassName = ['card', 'glow-box', 'text-amber-100', 'min-h-[200px]', className].filter(Boolean).join(' ');

  return (
    <div className={cardClassName}>
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="heading-gilded gold-text text-xl">Recent History</h2>
          <div className="flex gap-2">
            {error && onRetry && (
              <button
                type="button"
                className="btn btn-xs border border-amber-500/40 bg-black/40 text-amber-200/80 hover:border-amber-400"
                onClick={onRetry}
              >
                Retry
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs border border-amber-500/40 bg-amber-500/80 text-black hover:bg-amber-400 disabled:opacity-40"
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
                className="h-14 animate-pulse rounded border border-amber-500/20 bg-black/30"
              />
            ))}
          </ul>
        ) : error ? (
          <div className="rounded border border-red-500/40 bg-red-900/20 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded border border-amber-500/20 bg-black/30 px-3 py-2 text-sm text-amber-100/75">
            No recent sprints yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={`${item.project}-${index}`}
                className="flex items-center justify-between rounded border border-amber-500/20 bg-black/30 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
                  <div>
                    <div className="font-semibold text-amber-50">{item.project}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-amber-200/70">{item.when}</div>
                  </div>
                </div>
                <span className="rounded-full border border-amber-500/40 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200/80">
                  {item.duration}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
