import React from "react"
import type { Project } from "../../api/projects"

import CardShell from "./CardShell"

export type { Project }

const formatTimestamp = (value: string | null | undefined, emptyFallback: string): string => {
  if (!value) {
    return emptyFallback
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown"
  }

  return parsed.toLocaleString()
}

export function ProjectList({
  items,
  onDelete,
  onToggleFavorite,
}: {
  items: Project[]
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string, nextValue: boolean) => void
}) {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-base-content/10 bg-base-100/70 px-4 py-3 text-sm text-base-content/70">
        No projects yet.
      </div>
    )
  }
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((p) => (
        <CardShell as="li" key={p.id}>
          <div className="card-body gap-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-base-content">{p.name}</h3>
              <div className="flex gap-2">
                {onToggleFavorite && (
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => onToggleFavorite(p.id, !p.isFavorite)}
                  >
                    {p.isFavorite ? "Unfavorite" : "Favorite"}
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn btn-xs btn-outline btn-error"
                    onClick={() => onDelete(p.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {p.isFavorite && (
              <span className="badge badge-secondary w-max uppercase tracking-[0.2em] text-xs">
                Favorite
              </span>
            )}

            <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">
              Created {formatTimestamp(p.createdAt, "Unknown")}
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">
              Last used {formatTimestamp(p.lastUsedAt, "Not used yet")}
            </p>
          </div>
        </CardShell>
      ))}
    </ul>
  )
}
