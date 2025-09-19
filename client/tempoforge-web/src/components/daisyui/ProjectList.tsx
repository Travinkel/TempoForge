
import React from "react";
import type { Project } from "../../api/projects";

export type { Project };

const formatTimestamp = (
  value: string | null | undefined,
  emptyFallback: string,
): string => {
  if (!value) {
    return emptyFallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleString();
};

export function ProjectList({
  items,
  onDelete,
  onToggleFavorite,
}: {
  items: Project[];
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, nextValue: boolean) => void;
}) {
  if (!items?.length) {
    return (
      <div className="rounded border border-amber-500/25 bg-black/35 px-4 py-3 text-sm text-amber-100/75">
        No projects yet.
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((p) => (
        <li key={p.id} className="card glow-box text-amber-100">
          <div className="card-body gap-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="heading-gilded gold-text text-lg">{p.name}</h3>
              <div className="flex gap-2">
                {onToggleFavorite && (
                  <button
                    className="btn btn-xs border border-amber-500/40 bg-black/40 text-amber-200/80 hover:border-amber-400"
                    onClick={() => onToggleFavorite(p.id, !p.isFavorite)}
                  >
                    {p.isFavorite ? "Unfavorite" : "Favorite"}
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn btn-xs border border-red-500/40 bg-red-900/40 text-red-200 hover:border-red-400"
                    onClick={() => onDelete(p.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {p.isFavorite && (
              <span className="inline-flex w-max rounded-full border border-amber-500/40 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.28em] text-amber-200/80">
                Favorite
              </span>
            )}

            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
              Created {formatTimestamp(p.createdAt, "Unknown")}
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
              Last used {formatTimestamp(p.lastUsedAt, "Not used yet")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
