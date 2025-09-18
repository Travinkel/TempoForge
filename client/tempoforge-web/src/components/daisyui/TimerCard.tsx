import React from "react";

type TimerCardProps = {
  label: string;
  subtitle: string;
  active: boolean;
  isCritical: boolean;
  canStart?: boolean;
  onStart: () => void;
  onCancel: () => void;
  onComplete: () => void;
};

export default function TimerCard({
  label,
  subtitle,
  active,
  isCritical,
  canStart = true,
  onStart,
  onCancel,
  onComplete,
}: TimerCardProps) {
  const timerClass = isCritical
    ? "text-5xl font-mono text-red-400"
    : "text-5xl font-mono";

  return (
    <div className="card h-full bg-neutral text-neutral-content shadow-lg">
      <div className="card-body items-center justify-center gap-4 text-center">
        <h2 className="card-title font-cinzel uppercase tracking-widest">
          Focus Timer
        </h2>
        <div className={timerClass}>{label}</div>
        <div className="opacity-70">{subtitle}</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {active ? (
            <>
              <button
                type="button"
                className="btn btn-outline btn-error"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onComplete}
              >
                Complete
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onStart}
              disabled={!canStart}
            >
              Start Sprint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
