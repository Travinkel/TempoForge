import React from "react";

export type StatsPanelProps = {
  streakDays?: number | null;
  todayMinutes?: number | null;
  todaySprints?: number | null;
  loading?: boolean;
  className?: string;
};

const formatValue = (value?: number | null, suffix?: string) => {
  if (value === null || value === undefined) {
    return "--";
  }
  return suffix ? `${value}${suffix}` : `${value}`;
};

export default function StatsPanel({
  streakDays,
  todayMinutes,
  todaySprints,
  loading = false,
  className = "",
}: StatsPanelProps) {
  const streakText = loading ? "--" : formatValue(streakDays, " days");
  const minutesText = loading ? "--" : formatValue(todayMinutes, " m focus");
  const sprintsText = loading ? "--" : formatValue(todaySprints);

  return (
    <div className={`relative w-[260px] text-yellow-50 ${className}`}>
      <img
        src="/assets/ui/button_2.png"
        alt="Stats panel"
        className="pointer-events-none h-auto w-full select-none drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)]"
      />
      <div className="absolute inset-0 flex flex-col justify-center gap-3 px-7 py-5 text-right">
        <div>
          <div className="font-cinzel text-xs uppercase tracking-[0.3em] text-amber-200/80">
            Streak
          </div>
          <div className="text-2xl font-cinzel text-amber-100 drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]">
            {streakText}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1 text-[13px] text-yellow-100/85">
          <div className="flex justify-between">
            <span className="uppercase tracking-[0.25em] text-xs text-amber-200/70">
              Today
            </span>
            <span className="font-semibold">{minutesText}</span>
          </div>
          <div className="flex justify-between">
            <span className="uppercase tracking-[0.25em] text-xs text-amber-200/70">
              Sprints
            </span>
            <span className="font-semibold">{sprintsText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
