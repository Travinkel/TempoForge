import axios from 'axios'
import { API_BASE } from '../config'

const http = axios.create({ baseURL: API_BASE })

export type SprintDto = {
  id: string
  projectId: string
  projectName: string
  durationMinutes: number
  startedAtUtc: string
  completedAtUtc?: string | null
  abortedAtUtc?: string | null
  status: number
}

export type RecentSprint = {
  id: string
  projectName: string
  durationMinutes: number
  startedAtUtc: string
  status: number
}

export type TodayStats = {
  sprintCount: number
  minutesFocused: number
  streakDays: number
}

export type QuestSnapshot = {
  dailyGoal: number
  dailyCompleted: number
  weeklyGoal: number
  weeklyCompleted: number
  epicGoal: number
  epicCompleted: number
}

export type ProgressStats = {
  standing: string
  completedSprints: number
  percentToNext: number
  nextThreshold: number | null
  quest: QuestSnapshot
}

type TodayStatsResponse = {
  minutes: number
  sprints: number
  streakDays: number
}

type ProgressResponse = {
  standing: string
  percentToNext: number
  totalCompleted: number
  nextThreshold: number | null
  quest: {
    dailyGoal: number
    dailyCompleted: number
    weeklyGoal: number
    weeklyCompleted: number
    epicGoal: number
    epicCompleted: number
  }
}

const toTodayStats = (data: TodayStatsResponse): TodayStats => ({
  minutesFocused: data.minutes,
  sprintCount: data.sprints,
  streakDays: data.streakDays,
})

const toProgressStats = (data: ProgressResponse): ProgressStats => ({
  standing: data.standing,
  completedSprints: data.totalCompleted,
  percentToNext: Math.min(Math.max(data.percentToNext / 100, 0), 1),
  nextThreshold: data.nextThreshold,
  quest: {
    dailyGoal: data.quest.dailyGoal,
    dailyCompleted: data.quest.dailyCompleted,
    weeklyGoal: data.quest.weeklyGoal,
    weeklyCompleted: data.quest.weeklyCompleted,
    epicGoal: data.quest.epicGoal,
    epicCompleted: data.quest.epicCompleted,
  },
})

export async function getTodayStats(): Promise<TodayStats> {
  const { data } = await http.get<TodayStatsResponse>('/api/stats/today')
  return toTodayStats(data)
}

export async function getProgressStats(): Promise<ProgressStats> {
  const { data } = await http.get<ProgressResponse>('/api/stats/progress')
  return toProgressStats(data)
}

export async function getRecentSprints(take = 5): Promise<RecentSprint[]> {
  const { data } = await http.get<RecentSprint[]>('/api/sprints/recent', {
    params: { take },
  })
  return data
}

export async function startSprintRequest(
  projectId: string,
  durationMinutes: number,
): Promise<SprintDto> {
  const { data } = await http.post<SprintDto>('/api/sprints/start', {
    projectId,
    durationMinutes,
  })
  return data
}

export async function completeSprintRequest(id: string): Promise<SprintDto> {
  const { data } = await http.post<SprintDto>(`/api/sprints/${id}/complete`)
  return data
}

export async function abortSprintRequest(id: string): Promise<SprintDto> {
  const { data } = await http.post<SprintDto>(`/api/sprints/${id}/abort`)
  return data
}

export async function getRunningSprint(): Promise<SprintDto | null> {
  const { data } = await http.get<SprintDto | null>('/api/sprints/running')
  return data ?? null
}
