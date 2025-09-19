import React from "react";

export type StatsPanelProps = {
  streakDays?: number | null;
  todayMinutes?: number | null;
  todaySprints?: number | null;
  totalSprints?: number | null;
  loading?: boolean;
  className?: string;
};

const formatValue = (value?: number | null, suffix = "") => {
  if (value === null || value === undefined) {
    return "--";
  }
  return suffix ? `${value}${suffix}` : `${value}`;
};

export default function StatsPanel({
  streakDays,
  todayMinutes,
  todaySprints,
  totalSprints,
  loading = false,
  className = "",
}: StatsPanelProps) {
  const streakText = loading ? "--" : formatValue(streakDays, " days");
  const minutesText = loading ? "--" : formatValue(todayMinutes, " m focus");
  const sprintsTodayText = loading ? "--" : formatValue(todaySprints);
  const lifetimeText = loading ? "--" : formatValue(totalSprints);

  return (
    <div className={`relative w-[260px] text-yellow-50 ${className}`}>
      <img
        src="/assets/ui/button_2.png"
        alt="Stats panel"
        className="pointer-events-none h-auto w-full select-none drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)]"
      />
      <div className="absolute inset-0 flex flex-col justify-center gap-3 px-7 py-5 text-right">
        <div>
          <div className="font-cinzel text-xs uppercase tracking-[0.3em] text-base-content/70">
            Streak
          </div>
          <div className="text-2xl font-cinzel text-primary drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]">
            {streakText}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 text-[13px] text-base-content/80">
          <div className="flex flex-col text-right">
            <div className="flex justify-between">
              <span className="uppercase tracking-[0.25em] text-xs text-base-content/60">
                Today
              </span>
              <span className="font-semibold">{minutesText}</span>
            </div>
            <div className="flex justify-between">
              <span className="uppercase tracking-[0.25em] text-xs text-base-content/60">
                Sprints
              </span>
              <span className="font-semibold">{sprintsTodayText}</span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-base-content/50">
              Lifetime {lifetimeText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

