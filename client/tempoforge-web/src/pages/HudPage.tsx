import React from "react";
import AvatarSprite from "../components/hud/AvatarSprite";
import LifeOrb from "../components/hud/LifeOrb";
import ManaOrb from "../components/hud/ManaOrb";
import QuestPanel from "../components/hud/QuestPanel";
import StatsPanel from "../components/hud/StatsPanel";
import ActionBar from "../components/hud/ActionBar";
import { useSprintContext } from "../context/SprintContext";
import { useUserSettings } from "../context/UserSettingsContext";

export default function HudPage(): JSX.Element {
  const allowLayoutToggle = import.meta.env.DEV;
  const {
    portalState,
    active,
    remainingRatio,
    completedRatio,
    percentToNext,
    timerLabel,
    isCritical,
    canStart,
    actionPending,
    actionError,
    questDaily,
    questWeekly,
    statsSummary,
    todayStats,
    progressStats,
    metricsLoading,
    metricsError,
    refreshMetrics,
    startSprint,
    cancelSprint,
    completeSprint,
  } = useSprintContext();
  const { setLayout } = useUserSettings();
  const showLayoutToggle =
    allowLayoutToggle && typeof setLayout === "function";
  const handleReturnToDashboard = React.useCallback(() => {
    setLayout("daisyui");
  }, [setLayout]);
  const actionBarProgress = active ? completedRatio : percentToNext;
  const actionBarLabel = active
    ? timerLabel
    : progressStats
      ? `Standing: ${progressStats.standing} (${Math.round(percentToNext * 100)}%)`
      : undefined;

  return (
    <div className="relative min-h-screen bg-black text-yellow-100">
      <div className="town-porthole" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-black/40 to-black"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <div className="absolute bottom-[9%] left-1/2 -translate-x-1/2">
          <AvatarSprite state={portalState} />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1">
          {showLayoutToggle && (
            <div className="flex justify-end px-6 pt-6">
              <button
                type="button"
                className="pointer-events-auto rounded border border-yellow-600/60 bg-yellow-800/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-200 shadow-[0_0_14px_rgba(217,119,6,0.45)] transition hover:border-yellow-300/80 hover:bg-yellow-700/40"
                onClick={handleReturnToDashboard}
              >
                Return to DaisyUI
              </button>
            </div>
          )}
          {metricsError && (
            <div className="mx-auto mt-6 w-full max-w-xl rounded border border-red-800/50 bg-red-900/40 px-4 py-3 text-sm shadow-lg shadow-red-900/40">
              <div className="font-semibold uppercase tracking-[0.2em] text-red-200">
                Warning
              </div>
              <div className="text-red-100/90">{metricsError}</div>
              <button
                type="button"
                className="mt-2 rounded bg-red-800/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-red-100"
                onClick={() => refreshMetrics(true)}
              >
                Retry
              </button>
            </div>
          )}
          {actionError && (
            <div className="mx-auto mt-6 w-full max-w-xl rounded border border-yellow-800/50 bg-yellow-900/30 px-4 py-3 text-sm shadow-lg shadow-yellow-900/40">
              <div className="font-semibold uppercase tracking-[0.2em] text-yellow-200">
                Notice
              </div>
              <div className="text-yellow-100/90">{actionError}</div>
            </div>
          )}
        </main>
      </div>

      <div className="relative z-20 flex min-h-screen flex-col justify-end pb-10">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex items-end justify-between gap-6">
            <div className="pointer-events-auto flex flex-col gap-4">
              <QuestPanel daily={questDaily} weekly={questWeekly} />
              <LifeOrb
                progress={remainingRatio}
                label={timerLabel}
                pulsing={isCritical}
              />
            </div>
            <div className="pointer-events-auto flex flex-col items-center gap-6">
              <ActionBar
                progress={actionBarProgress}
                timerLabel={actionBarLabel}
                canStart={!active && canStart && !actionPending}
                canCancel={active && !actionPending}
                canComplete={active && !actionPending}
                canViewStats
                onStart={() => {
                  void startSprint();
                }}
                onCancel={() => {
                  void cancelSprint();
                }}
                onComplete={() => {
                  void completeSprint();
                }}
                onViewStats={() => {
                  void refreshMetrics(true);
                }}
              />
            </div>
            <div className="pointer-events-auto flex flex-col items-end gap-4">
              <StatsPanel
                streakDays={statsSummary.streakDays}
                todayMinutes={statsSummary.todayMinutes}
                todaySprints={statsSummary.todaySprints}
                totalSprints={statsSummary.totalSprints}
                loading={metricsLoading}
              />
              <ManaOrb progress={remainingRatio} />
            </div>
          </div>
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-yellow-100">
            <AvatarSprite state={portalState} />
            <div className="font-cinzel text-sm uppercase tracking-[0.35em]">
              Focus Mode Engaged
            </div>
            <div className="max-w-sm text-xs text-yellow-100/80 md:text-sm">
              Stay with the sprint. Use the action bar below if you need to
              cancel early.
            </div>
            <ActionBar
              progress={completedRatio}
              timerLabel={timerLabel}
              canStart={false}
              canCancel={!actionPending}
              canComplete={!actionPending}
              onCancel={() => {
                void cancelSprint();
              }}
              onComplete={() => {
                void completeSprint();
              }}
              onViewStats={() => {
                void refreshMetrics(true);
              }}
              className="mx-auto"
            />
            <div className="text-sm opacity-80">
              Press Cancel to forfeit this sprint
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





