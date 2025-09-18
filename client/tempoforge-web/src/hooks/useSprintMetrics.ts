import React from 'react';
import {
  getTodayStats,
  getProgressStats,
  getRecentSprints,
  type TodayStats,
  type ProgressStats,
  type RecentSprint,
} from '../api/sprints';
import { getActiveQuests, type QuestSummary } from '../api/quests';

type UseSprintMetricsOptions = {
  refreshIntervalMs?: number;
};

type SprintMetricsState = {
  todayStats: TodayStats | null;
  progressStats: ProgressStats | null;
  recentSprints: RecentSprint[];
  quests: QuestSummary[];
  loading: boolean;
  error: string | null;
  refresh: (withSpinner?: boolean) => Promise<void>;
};

export function useSprintMetrics(options: UseSprintMetricsOptions = {}): SprintMetricsState {
  const { refreshIntervalMs = 60_000 } = options;
  const [todayStats, setTodayStats] = React.useState<TodayStats | null>(null);
  const [progressStats, setProgressStats] = React.useState<ProgressStats | null>(null);
  const [recentSprints, setRecentSprints] = React.useState<RecentSprint[]>([]);
  const [quests, setQuests] = React.useState<QuestSummary[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const mountedRef = React.useRef(true);

  const fetchMetrics = React.useCallback(async (withSpinner = false) => {
    if (!mountedRef.current) {
      return;
    }

    if (withSpinner) {
      setLoading(true);
    }

    try {
      const [today, progress, recent, questSummaries] = await Promise.all([
        getTodayStats(),
        getProgressStats(),
        getRecentSprints(5),
        getActiveQuests(),
      ]);

      if (!mountedRef.current) {
        return;
      }

      setTodayStats(today);
      setProgressStats(progress);
      setRecentSprints(recent);
      setQuests(questSummaries);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) {
        return;
      }

      console.error('Failed to load sprint metrics', err);
      setError('Unable to load focus stats right now.');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    fetchMetrics(true);

    if (refreshIntervalMs <= 0) {
      return () => {
        mountedRef.current = false;
      };
    }

    const intervalId = window.setInterval(() => {
      fetchMetrics(false).catch(() => undefined);
    }, refreshIntervalMs);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [fetchMetrics, refreshIntervalMs]);

  const refresh = React.useCallback(
    async (withSpinner = true) => {
      await fetchMetrics(withSpinner);
    },
    [fetchMetrics]
  );

  return {
    todayStats,
    progressStats,
    recentSprints,
    quests,
    loading,
    error,
    refresh,
  };
}
