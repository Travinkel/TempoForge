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
        {errors["Name"] && <span className="text-error text-sm mt-1">{errors["Name"][0]}</span>}
      </div>

      <div className="form-control">
        <label className="cursor-pointer label justify-start gap-3">
          <input
            type="checkbox"
            className="toggle"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
          />
          <span className="label-text">Favorite</span>
        </label>
      </div>

      <div className="mt-2 flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={submitting}>Save</button>
      </div>
    </form>
  );
}
