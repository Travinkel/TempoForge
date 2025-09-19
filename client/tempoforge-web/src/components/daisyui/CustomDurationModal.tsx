import React from "react";

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

  React.useEffect(() => {
    if (open) {
      setValue(String(initialMinutes));
      setError(null);
    }
  }, [initialMinutes, open]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

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

  return (
    <div className="modal modal-open">
      <div className="modal-box space-y-4 bg-base-200 text-base-content">
        <h2 className="text-lg font-semibold">Custom Duration</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="form-control w-full">
            <span className="label-text">Duration (minutes)</span>
            <input
              type="number"
              min={minMinutes}
              max={maxMinutes}
              className="input input-bordered"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoFocus
            />
          </label>
          {error ? <div className="text-sm text-error">{error}</div> : null}
          <div className="modal-action justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={handleClose} />
    </div>
  );
}
