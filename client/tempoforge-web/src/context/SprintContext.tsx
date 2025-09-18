import React from 'react';
import type { ProgressStats, RecentSprint, TodayStats } from '../api/sprints';
import { useSprintMetrics } from '../hooks/useSprintMetrics';
import { useSprintSounds } from '../hooks/useSprintSounds';
import { usePortalCinematics, type PortalCinematicState } from '../hooks/usePortalCinematics';

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
  totalSeconds: number;
  secondsRemaining: number;
  timerLabel: string;
  remainingRatio: number;
  completedRatio: number;
  percentToNext: number;
  isCritical: boolean;
  portalState: PortalCinematicState;
  progressStats: ProgressStats | null;
  todayStats: TodayStats | null;
  recentSprints: RecentSprint[];
  questDaily: QuestItem[];
  questWeekly: QuestItem[];
  statsSummary: SprintStatsSummary;
  metricsLoading: boolean;
  metricsError: string | null;
  refreshMetrics: (withSpinner?: boolean) => Promise<void>;
  startSprint: () => void;
  cancelSprint: () => void;
  completeSprint: () => void;
};

const SprintContext = React.createContext<SprintContextValue | undefined>(undefined);

const TOTAL_SECONDS = 25 * 60;
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
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function SprintProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(TOTAL_SECONDS);
  const [active, setActive] = React.useState<boolean>(false);
  const sounds = useSprintSounds();
  const soundsRef = React.useRef(sounds);
  React.useEffect(() => {
    soundsRef.current = sounds;
  }, [sounds]);

  const { state: portalState, enterPortal, exitPortal, reset: resetPortal } = usePortalCinematics();
  const { todayStats, progressStats, recentSprints, loading: metricsLoading, error: metricsError, refresh: refreshMetrics } =
    useSprintMetrics();

  React.useEffect(
    () => () => {
      resetPortal();
      soundsRef.current.stopHeartbeat();
    },
    [resetPortal],
  );

  React.useEffect(() => {
    if (!active) {
      return undefined;
    }

    const id = window.setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
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
      exitPortal();
      return;
    }

    if (secondsRemaining === HEARTBEAT_THRESHOLD_SECONDS) {
      soundsRef.current.playHeartbeatStart();
    }
  }, [secondsRemaining, active, exitPortal]);

  const startSprint = React.useCallback(() => {
    if (active) {
      return;
    }

    setSecondsRemaining(TOTAL_SECONDS);
    setActive(true);
    soundsRef.current.playStart();
    enterPortal();
  }, [active, enterPortal]);

  const cancelSprint = React.useCallback(() => {
    if (!active) {
      return;
    }

    setActive(false);
    soundsRef.current.stopHeartbeat();
    soundsRef.current.playCancel();
    exitPortal();
  }, [active, exitPortal]);

  const completeSprint = React.useCallback(() => {
    if (!active) {
      return;
    }

    setSecondsRemaining(0);
  }, [active]);

  const remainingRatio = clamp01(secondsRemaining / TOTAL_SECONDS);
  const completedRatio = 1 - remainingRatio;
  const timerLabel = formatSeconds(secondsRemaining);
  const isCritical = active && secondsRemaining > 0 && secondsRemaining <= HEARTBEAT_THRESHOLD_SECONDS;
  const percentToNext = progressStats ? clamp01(progressStats.percentToNext ?? 0) : 0;

  const questDaily = React.useMemo<QuestItem[]>(() => {
    if (metricsLoading && !progressStats) {
      return [
        { label: 'Loading daily goals...', completed: false },
        { label: 'Loading streak...', completed: false },
      ];
    }
    if (!progressStats) {
      return [
        { label: 'Complete 3 sprints today', completed: false },
        { label: 'Maintain your streak', completed: false },
      ];
    }

    const { quest } = progressStats;
    const dailyGoal = quest.dailyGoal || 0;
    const completedDaily = quest.dailyCompleted;
    const bounded = dailyGoal > 0 ? Math.min(completedDaily, dailyGoal) : completedDaily;
    const streakDays = todayStats?.streakDays ?? 0;

    return [
      {
        label: `Complete ${dailyGoal} sprint${dailyGoal === 1 ? '' : 's'} today (${bounded}/${dailyGoal})`,
        completed: dailyGoal > 0 && completedDaily >= dailyGoal,
      },
      {
        label: `Maintain streak (${streakDays} day${streakDays === 1 ? '' : 's'})`,
        completed: dailyGoal > 0 ? streakDays >= dailyGoal : streakDays > 0,
      },
    ];
  }, [metricsLoading, progressStats, todayStats]);

  const questWeekly = React.useMemo<QuestItem[]>(() => {
    if (metricsLoading && !progressStats) {
      return [
        { label: 'Loading weekly goals...', completed: false },
        { label: 'Loading rank progress...', completed: false },
      ];
    }
    if (!progressStats) {
      return [
        { label: 'Complete 15 sprints this week', completed: false },
        { label: 'Reach the next rank', completed: false },
      ];
    }

    const { quest } = progressStats;
    const weeklyGoal = quest.weeklyGoal || 0;
    const weeklyCompleted = quest.weeklyCompleted;
    const bounded = weeklyGoal > 0 ? Math.min(weeklyCompleted, weeklyGoal) : weeklyCompleted;
    const remainingToNext =
      progressStats.nextThreshold === null ? 0 : Math.max(progressStats.nextThreshold - progressStats.completedSprints, 0);
    const nextLabel =
      progressStats.nextThreshold === null
        ? 'At max rank'
        : `${remainingToNext} sprint${remainingToNext === 1 ? '' : 's'} to next rank`;

    return [
      {
        label: `Complete ${weeklyGoal} sprint${weeklyGoal === 1 ? '' : 's'} this week (${bounded}/${weeklyGoal})`,
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
      totalSeconds: TOTAL_SECONDS,
      secondsRemaining,
      timerLabel,
      remainingRatio,
      completedRatio,
      percentToNext,
      isCritical,
      portalState,
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
      completedRatio,
      timerLabel,
      remainingRatio,
      secondsRemaining,
      percentToNext,
      portalState,
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

  return <SprintContext.Provider value={value}>{children}</SprintContext.Provider>;
}

export function useSprintContext(): SprintContextValue {
  const value = React.useContext(SprintContext);
  if (!value) {
    throw new Error('useSprintContext must be used within a SprintProvider');
  }
  return value;
}
