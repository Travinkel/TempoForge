import React from "react";
import ModalShell from "./ModalShell";

type CustomDurationModalProps = {
  open: boolean;
  initialMinutes: number;
  onClose: () => void;
  onConfirm: (minutes: number) => void;
  minMinutes?: number;
  maxMinutes?: number;
};

const DEFAULT_MINUTES = {
  min: 1,
  max: 180,
};

export default function CustomDurationModal({
  open,
  initialMinutes,
  onClose,
  onConfirm,
  minMinutes = DEFAULT_MINUTES.min,
  maxMinutes = DEFAULT_MINUTES.max,
}: CustomDurationModalProps) {
  const [value, setValue] = React.useState(String(initialMinutes));
  const [error, setError] = React.useState<string | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const errorId = React.useId();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  React.useEffect(() => {
    if (open) {
      setValue(String(initialMinutes));
      setError(null);
    }
  }, [initialMinutes, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number.parseInt(value.trim(), 10);
    if (!Number.isFinite(parsed)) {
      setError("Enter a valid number of minutes.");
      return;
    }
    if (parsed < minMinutes || parsed > maxMinutes) {
      setError(`Duration must be between ${minMinutes} and ${maxMinutes} minutes.`);
      return;
    }
    setError(null);
    onConfirm(parsed);
    onClose();
  };

  const describedBy = error ? errorId : descriptionId;

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      labelledBy={titleId}
      describedBy={describedBy}
    >
      <div className="modal-box space-y-4 bg-base-200 text-base-content">
        <h2 id={titleId} className="text-lg font-semibold">
          Custom Duration
        </h2>
        <p id={descriptionId} className="text-sm text-base-content/70">
          Choose how many minutes the next sprint should run.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="form-control w-full">
            <span className="label-text">Duration (minutes)</span>
            <input
              type="number"
              min={minMinutes}
              max={maxMinutes}
              step={1}
              inputMode="numeric"
              className="input input-bordered"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoFocus
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
            />
          </label>
          {error ? (
            <div id={errorId} className="text-sm text-error" role="alert">
              {error}
            </div>
          ) : null}
          <div className="modal-action justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              OK
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
