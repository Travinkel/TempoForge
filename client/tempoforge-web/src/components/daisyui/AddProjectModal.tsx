import React from "react";

type AddProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: { name: string; isFavorite: boolean }) => Promise<void>;
};

export default function AddProjectModal({
  open,
  onClose,
  onAdd,
}: AddProjectModalProps) {
  const [name, setName] = React.useState("");
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    setName("");
    setIsFavorite(false);
    setSubmitting(false);
    setError(null);
  }, [open]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    if (submitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onAdd({ name: trimmedName, isFavorite });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to add project.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box space-y-4 bg-base-200 text-base-content">
        <h2 className="text-lg font-semibold">Add Project</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="form-control w-full">
            <span className="label-text">Project name</span>
            <input
              type="text"
              className="input input-bordered"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              autoFocus
              disabled={submitting}
            />
          </label>

          <label className="label cursor-pointer justify-start gap-3">
            <span className="label-text">Mark as favorite</span>
            <input
              type="checkbox"
              className="checkbox checkbox-warning"
              checked={isFavorite}
              onChange={(event) => setIsFavorite(event.target.checked)}
              disabled={submitting}
            />
          </label>

          {error ? <div className="text-sm text-error">{error}</div> : null}

          <div className="modal-action justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Project"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={handleClose} />
    </div>
  );
}
