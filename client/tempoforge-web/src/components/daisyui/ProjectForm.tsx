import React from "react"

import CardShell from "./CardShell"

export type ProjectCreateInput = {
  name: string
  isFavorite: boolean
}

export function ProjectForm({
  initial,
  onSubmit,
  submitting = false,
}: {
  initial?: Partial<ProjectCreateInput>
  onSubmit: (input: ProjectCreateInput) => Promise<void> | void
  submitting?: boolean
}) {
  const [name, setName] = React.useState(initial?.name ?? "")
  const [isFavorite, setIsFavorite] = React.useState<boolean>(initial?.isFavorite ?? false)
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    await Promise.resolve(onSubmit({ name, isFavorite })).catch((err: any) => {
      if (err?.status === 400 && err?.problemDetails) {
        setErrors(err.problemDetails.errors ?? {})
      } else {
        console.error(err)
      }
    })
  }

  return (
    <CardShell as="form" onSubmit={handleSubmit}>
      <div className="card-body gap-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.24em] text-base-content/60">Name</label>
          <input
            className="input input-bordered w-full"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
          />
          {errors["Name"] && <span className="text-xs text-error">{errors["Name"][0]}</span>}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-base-content/10 bg-base-100/70 px-4 py-3">
          <div className="text-sm text-base-content/80">Mark as favorite</div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="toggle toggle-secondary"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            Save
          </button>
        </div>
      </div>
    </CardShell>
  )
}
