import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
const http = axios.create({ baseURL: API_BASE })

export type QuestType = 'Daily' | 'Weekly' | 'Epic'

export type QuestSummary = {
  title: string
  type: QuestType
  goal: number
  progress: number
  completed: boolean
}

export async function getActiveQuests(): Promise<QuestSummary[]> {
  const { data } = await http.get<QuestSummary[]>('/api/quests/active')
  return data
}
