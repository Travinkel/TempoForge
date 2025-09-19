import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const http = axios.create({ baseURL: API_BASE_URL })

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
