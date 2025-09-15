import React from 'react'

export type Project = {
  id: string
  name: string
  track: 'Work' | 'Study'
  pinned: boolean
  createdAt: string
}

export function ProjectList({
  items,
  onDelete,
  onTogglePin,
}: {
  items: Project[]
  onDelete?: (id: string) => void
  onTogglePin?: (id: string, pinned: boolean) => void
}) {
  if (!items?.length) {
    return <div className="alert shadow"><span>No projects yet.</span></div>
  }
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map(p => (
        <li key={p.id} className="card bg-base-200 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title">
                {p.name}
                <span className="badge badge-outline ml-2">{p.track}</span>
                {p.pinned && <span className="badge badge-primary ml-2">Pinned</span>}
              </h3>
              <div className="flex gap-2">
                {onTogglePin && (
                  <button className="btn btn-xs" onClick={() => onTogglePin(p.id, !p.pinned)}>
                    {p.pinned ? 'Unpin' : 'Pin'}
                  </button>
                )}
                {onDelete && (
                  <button className="btn btn-xs btn-error" onClick={() => onDelete(p.id)}>Delete</button>
                )}
              </div>
            </div>
            <p className="text-sm opacity-70">Created {new Date(p.createdAt).toLocaleString()}</p>
          </div>
        </li>
      ))}
    </ul>
  )
} 