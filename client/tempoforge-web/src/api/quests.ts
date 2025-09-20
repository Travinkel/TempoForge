import http from './http'

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
