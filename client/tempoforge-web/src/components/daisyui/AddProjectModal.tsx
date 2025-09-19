import React from "react";
import { createPortal } from "react-dom";
import type { ProjectCreateRequest } from "../../api/projects";

type AddProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ProjectCreateRequest) => Promise<void>;
};

export default function AddProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: AddProjectModalProps) {
  const [name, setName] = React.useState("");
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const errorId = React.useId();

  const handleClose = React.useCallback(() => {
    if (submitting) {
      return;
    }
    onClose();
  }, [onClose, submitting]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    setName("");
    setIsFavorite(false);
    setSubmitting(false);
    setError(null);
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.classList.add("modal-open");
    body.style.overflow = "hidden";

    return () => {
      body.classList.remove("modal-open");
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, isOpen]);

  if (!isOpen) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

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
      await onSubmit({ name: trimmedName, isFavorite });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to add project.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={error ? errorId : descriptionId}
    >
      <div className="modal-box space-y-4 bg-base-200 text-base-content">
        <h2 id={titleId} className="text-lg font-semibold">
          Add Project
        </h2>
        <p id={descriptionId} className="text-sm text-base-content/70">
          Give your project a name and optionally mark it as a favorite for faster access.
        </p>
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
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : descriptionId}
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

          {error ? (
            <div id={errorId} className="text-sm text-error" role="alert">
              {error}
            </div>
          ) : null}

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
      <div className="modal-backdrop bg-black/40" onClick={handleClose} role="presentation" />
    </div>
  );

  return createPortal(modalContent, document.body);
}
