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
    return <div className="alert shadow"><span>No projects yet.</span></div>;
  }
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map(p => (
        <li key={p.id} className="card bg-base-200 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title">
                {p.name}
                {p.isFavorite && (
                  <span className="badge badge-primary ml-2">Favorite</span>
                )}
              </h3>
              <div className="flex gap-2">
                {onToggleFavorite && (
                  <button
                    className="btn btn-xs"
                    onClick={() => onToggleFavorite(p.id, !p.isFavorite)}
                  >
                    {p.isFavorite ? "Unfavorite" : "Favorite"}
                  </button>
                )}
                {onDelete && (
                  <button className="btn btn-xs btn-error" onClick={() => onDelete(p.id)}>Delete</button>
                )}
              </div>
            </div>
            <p className="text-sm opacity-70">
              Created {formatTimestamp(p.createdAt, "Unknown")}
            </p>
            <p className="text-sm opacity-70">
              Last used {formatTimestamp(p.lastUsedAt, "Not used yet")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
