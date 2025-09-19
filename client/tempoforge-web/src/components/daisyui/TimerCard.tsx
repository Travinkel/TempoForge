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
  className?: string;
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
  className = '',
}: TimerCardProps) {
  const timerClass = isCritical
    ? "text-6xl font-mono text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]"
    : "text-6xl font-mono text-amber-50 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]";

  const cardClassName = ['card', 'glow-box', 'text-amber-100', 'min-h-[220px]', 'h-full', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClassName}>
      <div className="card-body items-center justify-center gap-5 text-center">
        <h2 className="heading-gilded gold-text text-xl">Focus Timer</h2>
        <div className={timerClass}>{label}</div>
        <div className="text-sm text-amber-200/80">{subtitle}</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {active ? (
            <>
              <button
                type="button"
                className="btn border border-red-500/40 bg-red-900/40 px-6 text-red-200 hover:border-red-400"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn border border-amber-500/40 bg-amber-600/60 px-6 text-black hover:bg-amber-500"
                onClick={onComplete}
              >
                Complete
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn border border-amber-500/40 bg-amber-500/80 px-8 text-black hover:bg-amber-400 disabled:opacity-40"
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
