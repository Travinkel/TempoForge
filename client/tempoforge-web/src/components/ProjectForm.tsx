import React from 'react'

export type Track = 'Work' | 'Study'

export type ProjectCreateInput = {
  name: string
  track: Track
  pinned: boolean
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
  const [name, setName] = React.useState(initial?.name ?? '')
  const [track, setTrack] = React.useState<Track>(initial?.track ?? 'Work')
  const [pinned, setPinned] = React.useState<boolean>(initial?.pinned ?? false)
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    await Promise.resolve(onSubmit({ name, track, pinned })).catch((err: any) => {
      if (err?.status === 400 && err?.problemDetails) {
        setErrors(err.problemDetails.errors ?? {})
      } else {
        console.error(err)
      }
    })
  }

  return (
    <form className="card bg-base-200 p-4 shadow gap-3" onSubmit={handleSubmit}>
      <div className="form-control">
        <label className="label"><span className="label-text">Name</span></label>
        <input
          className="input input-bordered"
          placeholder="Project name"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={80}
          required
        />
        {errors['Name'] && <span className="text-error text-sm mt-1">{errors['Name'][0]}</span>}
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Track</span></label>
        <select className="select select-bordered" value={track} onChange={e => setTrack(e.target.value as Track)}>
          <option value="Work">Work</option>
          <option value="Study">Study</option>
        </select>
        {errors['Track'] && <span className="text-error text-sm mt-1">{errors['Track'][0]}</span>}
      </div>

      <div className="form-control">
        <label className="cursor-pointer label justify-start gap-3">
          <input type="checkbox" className="toggle" checked={pinned} onChange={e => setPinned(e.target.checked)} />
          <span className="label-text">Pinned</span>
        </label>
      </div>

      <div className="mt-2 flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={submitting}>Save</button>
      </div>
    </form>
  )
} 