import React from "react";
import type {
  ProgressStats,
  RecentSprint,
  TodayStats,
  SprintDto,
} from "../api/sprints";
import { useSprintMetrics } from "../hooks/useSprintMetrics";
import { useSprintSounds } from "../hooks/useSprintSounds";
import {
  usePortalCinematics,
  type PortalCinematicState,
} from "../hooks/usePortalCinematics";
import {
  startSprintRequest,
  completeSprintRequest,
  abortSprintRequest,
  getRunningSprint,
} from "../api/sprints";

const DEFAULT_DURATION_MINUTES = 25;
const HEARTBEAT_THRESHOLD_SECONDS = 5 * 60;

const clamp01 = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
};

const formatSeconds = (value: number): string => {
  const safe = Math.max(0, Math.floor(value));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

type QuestItem = {
  label: string;
  completed: boolean;
};

type SprintStatsSummary = {
  streakDays: number;
  todayMinutes: number;
  totalSprints: number;
};

type SprintContextValue = {
  active: boolean;
  activeSprint: SprintDto | null;
  totalSeconds: number;
  secondsRemaining: number;
  timerLabel: string;
  remainingRatio: number;
  completedRatio: number;
  percentToNext: number;
  isCritical: boolean;
  canStart: boolean;
  portalState: PortalCinematicState;
  plannedProjectId: string | null;
  plannedDurationMinutes: number;
  setPlannedSprint: (projectId: string | null, durationMinutes: number) => void;
  actionPending: boolean;
  actionError: string | null;
  clearActionError: () => void;
  progressStats: ProgressStats | null;
  todayStats: TodayStats | null;
  recentSprints: RecentSprint[];
  questDaily: QuestItem[];
  questWeekly: QuestItem[];
  statsSummary: SprintStatsSummary;
  metricsLoading: boolean;
  metricsError: string | null;
  refreshMetrics: (withSpinner?: boolean) => Promise<void>;
  startSprint: (options?: {
    projectId?: string;
    durationMinutes?: number;
  }) => Promise<void>;
  cancelSprint: () => Promise<void>;
  completeSprint: () => Promise<void>;
};

const SprintContext = React.createContext<SprintContextValue | undefined>(
  undefined,
);

export function SprintProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [plannedProjectId, setPlannedProjectId] = React.useState<string | null>(
    null,
  );
  const [plannedDurationMinutes, setPlannedDurationMinutes] =
    React.useState<number>(DEFAULT_DURATION_MINUTES);
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(
    DEFAULT_DURATION_MINUTES * 60,
  );
  const [totalSeconds, setTotalSeconds] = React.useState<number>(
    DEFAULT_DURATION_MINUTES * 60,
  );
  const [active, setActive] = React.useState<boolean>(false);
  const [activeSprint, setActiveSprint] = React.useState<SprintDto | null>(
    null,
  );
  const [actionPending, setActionPending] = React.useState<boolean>(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const sounds = useSprintSounds();
  const soundsRef = React.useRef(sounds);
  React.useEffect(() => {
    soundsRef.current = sounds;
  }, [sounds]);

  const {
    state: portalState,
    enterPortal,
    exitPortal,
    reset: resetPortal,
  } = usePortalCinematics();
  const {
    todayStats,
    progressStats,
    recentSprints,
    loading: metricsLoading,
    error: metricsError,
    refresh: refreshMetrics,
  } = useSprintMetrics();

  React.useEffect(
    () => () => {
      resetPortal();
      soundsRef.current.stopHeartbeat();
    },
    [resetPortal],
  );

  React.useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const running = await getRunningSprint();
        if (!running || cancelled) {
          return;
        }
        setActive(true);
        setActiveSprint(running);
        setPlannedProjectId(running.projectId);
        setPlannedDurationMinutes(running.durationMinutes);
        const total = running.durationMinutes * 60;
        const startedAt = new Date(running.startedAtUtc).getTime();
        const elapsed = Math.max(
          0,
          Math.floor((Date.now() - startedAt) / 1000),
        );
        const remaining = Math.max(total - elapsed, 0);
        setTotalSeconds(total);
        setSecondsRemaining(remaining);
        enterPortal();
        if (remaining <= HEARTBEAT_THRESHOLD_SECONDS && remaining > 0) {
          soundsRef.current.playHeartbeatStart();
        }
        if (remaining === 0) {
          setActive(false);
          setActiveSprint(null);
          exitPortal();
          await refreshMetrics(true);
        }
      } catch (error) {
        console.error("Failed to hydrate running sprint", error);
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [enterPortal, exitPortal, refreshMetrics]);

  const setPlannedSprint = React.useCallback(
    (projectId: string | null, durationMinutes: number) => {
      setActionError(null);
      setPlannedProjectId(projectId);
      setPlannedDurationMinutes(durationMinutes);
      if (!active) {
        const seconds = Math.max(0, Math.floor(durationMinutes * 60));
        setTotalSeconds(seconds);
        setSecondsRemaining(seconds);
      }
    },
    [active],
  );

  React.useEffect(() => {
    if (!active) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [active]);

  React.useEffect(() => {
    if (!active) {
      return;
    }
    if (secondsRemaining === 0) {
      soundsRef.current.stopHeartbeat();
      soundsRef.current.playComplete();
      setActive(false);
      setActiveSprint(null);
      exitPortal();
      void refreshMetrics(true);
      return;
    }
    if (secondsRemaining === HEARTBEAT_THRESHOLD_SECONDS) {
      soundsRef.current.playHeartbeatStart();
    }
  }, [secondsRemaining, active, exitPortal, refreshMetrics]);

  const clearActionError = React.useCallback(() => {
    setActionError(null);
  }, []);

  const performStart = React.useCallback(
    async (projectId: string, durationMinutes: number) => {
      setActionPending(true);
      setActionError(null);
      try {
        const sprint = await startSprintRequest(projectId, durationMinutes);
        setActive(true);
        setActiveSprint(sprint);
        setTotalSeconds(durationMinutes * 60);
        setSecondsRemaining(durationMinutes * 60);
        soundsRef.current.playStart();
        enterPortal();
        await refreshMetrics(false);
      } catch (error) {
        console.error("Failed to start sprint", error);
        setActionError("Failed to start sprint. Please try again.");
        throw error;
      } finally {
        setActionPending(false);
      }
    },
    [enterPortal, refreshMetrics],
  );

  const startSprint = React.useCallback(
    async (options?: { projectId?: string; durationMinutes?: number }) => {
      if (active || actionPending) {
        return;
      }
      const projectId = options?.projectId ?? plannedProjectId;
      const durationMinutes =
        options?.durationMinutes ?? plannedDurationMinutes;
      if (!projectId) {
        setActionError("Select a project before starting a sprint.");
        return;
      }
      if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        setActionError("Sprint duration must be greater than zero.");
        return;
      }
      await performStart(projectId, durationMinutes);
    },
    [
      active,
      actionPending,
      plannedProjectId,
      plannedDurationMinutes,
      performStart,
    ],
  );

  const cancelSprint = React.useCallback(async () => {
    if (!active || !activeSprint || actionPending) {
      return;
    }
    setActionPending(true);
    setActionError(null);
    try {
      await abortSprintRequest(activeSprint.id);
      soundsRef.current.stopHeartbeat();
      soundsRef.current.playCancel();
      exitPortal();
      setActive(false);
      setActiveSprint(null);
      setSecondsRemaining(plannedDurationMinutes * 60);
      await refreshMetrics(true);
    } catch (error) {
      console.error("Failed to cancel sprint", error);
      setActionError("Failed to cancel sprint.");
    } finally {
      setActionPending(false);
    }
  }, [
    active,
    activeSprint,
    actionPending,
    exitPortal,
    plannedDurationMinutes,
    refreshMetrics,
  ]);

  const completeSprint = React.useCallback(async () => {
    if (!active || !activeSprint || actionPending) {
      return;
    }
    setActionPending(true);
    setActionError(null);
    try {
      await completeSprintRequest(activeSprint.id);
      soundsRef.current.stopHeartbeat();
      soundsRef.current.playComplete();
      exitPortal();
      setActive(false);
      setActiveSprint(null);
      setSecondsRemaining(plannedDurationMinutes * 60);
      await refreshMetrics(true);
    } catch (error) {
      console.error("Failed to complete sprint", error);
      setActionError("Failed to complete sprint.");
    } finally {
      setActionPending(false);
    }
  }, [
    active,
    activeSprint,
    actionPending,
    exitPortal,
    plannedDurationMinutes,
    refreshMetrics,
  ]);

  const timerLabel = formatSeconds(secondsRemaining);
  const remainingRatio = clamp01(secondsRemaining / Math.max(totalSeconds, 1));
  const completedRatio = 1 - remainingRatio;
  const percentToNext = progressStats
    ? clamp01(progressStats.percentToNext)
    : 0;
  const isCritical =
    active &&
    secondsRemaining > 0 &&
    secondsRemaining <= HEARTBEAT_THRESHOLD_SECONDS;
  const canStart = !active && !actionPending && !!plannedProjectId;

  const questDaily = React.useMemo<QuestItem[]>(() => {
    if (metricsLoading && !progressStats) {
      return [
        { label: "Loading daily goals...", completed: false },
        { label: "Loading streak...", completed: false },
      ];
    }
    if (!progressStats) {
      return [
        { label: "Complete 3 sprints today", completed: false },
        { label: "Maintain your streak", completed: false },
      ];
    }
    const { quest } = progressStats;
    const dailyGoal = quest.dailyGoal || 0;
    const completedDaily = quest.dailyCompleted;
    const bounded =
      dailyGoal > 0 ? Math.min(completedDaily, dailyGoal) : completedDaily;
    const streakDays = todayStats?.streakDays ?? 0;
    return [
      {
        label: `Complete ${dailyGoal} sprint${dailyGoal === 1 ? "" : "s"} today (${bounded}/${dailyGoal})`,
        completed: dailyGoal > 0 && completedDaily >= dailyGoal,
      },
      {
        label: `Maintain streak (${streakDays} day${streakDays === 1 ? "" : "s"})`,
        completed: dailyGoal > 0 ? streakDays >= dailyGoal : streakDays > 0,
      },
    ];
  }, [metricsLoading, progressStats, todayStats]);

  const questWeekly = React.useMemo<QuestItem[]>(() => {
    if (metricsLoading && !progressStats) {
      return [
        { label: "Loading weekly goals...", completed: false },
        { label: "Loading rank progress...", completed: false },
      ];
    }
    if (!progressStats) {
      return [
        { label: "Complete 15 sprints this week", completed: false },
        { label: "Reach the next rank", completed: false },
      ];
    }
    const { quest } = progressStats;
    const weeklyGoal = quest.weeklyGoal || 0;
    const weeklyCompleted = quest.weeklyCompleted;
    const bounded =
      weeklyGoal > 0 ? Math.min(weeklyCompleted, weeklyGoal) : weeklyCompleted;
    const remainingToNext =
      progressStats.nextThreshold === null
        ? 0
        : Math.max(
            progressStats.nextThreshold - progressStats.completedSprints,
            0,
          );
    const nextLabel =
      progressStats.nextThreshold === null
        ? "At max rank"
        : `${remainingToNext} sprint${remainingToNext === 1 ? "" : "s"} to next rank`;
    return [
      {
        label: `Complete ${weeklyGoal} sprint${weeklyGoal === 1 ? "" : "s"} this week (${bounded}/${weeklyGoal})`,
        completed: weeklyGoal > 0 && weeklyCompleted >= weeklyGoal,
      },
      {
        label: nextLabel,
        completed: progressStats.nextThreshold === null,
      },
    ];
  }, [metricsLoading, progressStats]);

  const statsSummary = React.useMemo<SprintStatsSummary>(
    () => ({
      streakDays: todayStats?.streakDays ?? 0,
      todayMinutes: todayStats?.minutesFocused ?? 0,
      totalSprints: progressStats?.completedSprints ?? 0,
    }),
    [todayStats, progressStats],
  );

  const value = React.useMemo<SprintContextValue>(
    () => ({
      active,
      activeSprint,
      totalSeconds,
      secondsRemaining,
      timerLabel,
      remainingRatio,
      completedRatio,
      percentToNext,
      isCritical,
      canStart,
      portalState,
      plannedProjectId,
      plannedDurationMinutes,
      setPlannedSprint,
      actionPending,
      actionError,
      clearActionError,
      progressStats,
      todayStats,
      recentSprints,
      questDaily,
      questWeekly,
      statsSummary,
      metricsLoading,
      metricsError,
      refreshMetrics,
      startSprint,
      cancelSprint,
      completeSprint,
    }),
    [
      active,
      activeSprint,
      totalSeconds,
      secondsRemaining,
      timerLabel,
      remainingRatio,
      completedRatio,
      percentToNext,
      isCritical,
      canStart,
      portalState,
      plannedProjectId,
      plannedDurationMinutes,
      setPlannedSprint,
      actionPending,
      actionError,
      clearActionError,
      progressStats,
      todayStats,
      recentSprints,
      questDaily,
      questWeekly,
      statsSummary,
      metricsLoading,
      metricsError,
      refreshMetrics,
      startSprint,
      cancelSprint,
      completeSprint,
    ],
  );

  return (
    <SprintContext.Provider value={value}>{children}</SprintContext.Provider>
  );
}

export function useSprintContext(): SprintContextValue {
  const value = React.useContext(SprintContext);
  if (!value) {
    throw new Error("useSprintContext must be used within a SprintProvider");
  }
  return value;
}
