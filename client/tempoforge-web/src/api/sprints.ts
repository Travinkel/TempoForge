import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export type TodayStats = { minutes: number; sprints: number; streakDays: number }
export type RecentSprint = { id: string; project: string; durationMinutes: number; startedAtUtc: string }

export async function getTodayStats(): Promise<TodayStats> {
  const { data } = await axios.get(`${API_BASE}/api/sprints/today`)
  return data
}

export async function getRecentSprints(): Promise<RecentSprint[]> {
  const { data } = await axios.get(`${API_BASE}/api/sprints/recent`)
  return data
}
