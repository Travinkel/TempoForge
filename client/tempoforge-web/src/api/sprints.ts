import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
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
}

export type ProgressStats = {
  standing: string
  completedSprints: number
  percentToNext: number
  nextThreshold: number | null
  quest: QuestSnapshot
}

export async function getTodayStats(): Promise<TodayStats> {
  const { data } = await http.get<TodayStats>('/api/stats/today')
  return data
}

export async function getProgressStats(): Promise<ProgressStats> {
  const { data } = await http.get<ProgressStats>('/api/stats/progress')
  return data
}

export async function getRecentSprints(take = 5): Promise<RecentSprint[]> {
  const { data } = await http.get<RecentSprint[]>('/api/sprints/recent', { params: { take } })
  return data
}

export async function startSprintRequest(projectId: string, durationMinutes: number): Promise<SprintDto> {
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
  try {
    const { data } = await http.get<SprintDto>('/api/sprints/running')
    return data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}

