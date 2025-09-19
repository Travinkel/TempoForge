
import React from "react";

export type ProjectCreateInput = {
  name: string;
  isFavorite: boolean;
};

export function ProjectForm({
  initial,
  onSubmit,
  submitting = false,
}: {
  initial?: Partial<ProjectCreateInput>;
  onSubmit: (input: ProjectCreateInput) => Promise<void> | void;
  submitting?: boolean;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [isFavorite, setIsFavorite] = React.useState<boolean>(
    initial?.isFavorite ?? false,
  );
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    await Promise.resolve(onSubmit({ name, isFavorite })).catch((err: any) => {
      if (err?.status === 400 && err?.problemDetails) {
        setErrors(err.problemDetails.errors ?? {});
      } else {
        console.error(err);
      }
    });
  };

  return (
    <form className="card glow-box text-amber-100" onSubmit={handleSubmit}>
      <div className="card-body gap-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.24em] text-amber-200/70">Name</label>
          <input
            className="input input-bordered bg-black/40 text-amber-100 shadow-inner shadow-black/40 focus:border-amber-400 focus:outline-none"
            placeholder="Project name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={80}
            required
          />
          {errors["Name"] && (
            <span className="text-xs text-red-300">{errors["Name"][0]}</span>
          )}
        </div>

        <div className="flex items-center justify-between rounded border border-amber-500/25 bg-black/40 px-4 py-3">
          <div className="text-sm text-amber-100/80">Mark as favorite</div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="toggle toggle-warning"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button
            className="btn border border-amber-500/40 bg-amber-500/80 px-6 text-black hover:bg-amber-400 disabled:opacity-40"
            type="submit"
            disabled={submitting}
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
