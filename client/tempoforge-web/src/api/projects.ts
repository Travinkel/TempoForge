import axios from 'axios'
import { API_BASE } from '../config'

const api = axios.create({
  baseURL: API_BASE,
})

export interface Project {
  id: string
  name: string
  isFavorite: boolean
  createdAt: string
  lastUsedAt: string | null
}

export interface ProjectCreateRequest {
  name: string
  isFavorite?: boolean
}

export interface ProjectUpdateRequest {
  name?: string
  isFavorite?: boolean
}

export async function getProjects(favorites?: boolean): Promise<Project[]> {
  const query = favorites ? '?favorites=true' : ''
  const { data } = await api.get<Project[]>(`/api/projects${query}`)
  return data
}

export async function getFavoriteProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>(`/api/projects/favorites`)
  return data
}

export async function addProject({
  name,
  isFavorite = false,
}: ProjectCreateRequest) {
  const payload: ProjectCreateRequest = {
    name,
    isFavorite,
  }

  await api.post('/api/projects', payload)
}

export async function updateProject(id: string, patch: ProjectUpdateRequest) {
  const payload: ProjectUpdateRequest = {}

  if (typeof patch.name === 'string') {
    payload.name = patch.name
  }

  if (typeof patch.isFavorite === 'boolean') {
    payload.isFavorite = patch.isFavorite
  }

  await api.put(`/api/projects/${id}`, payload)
}

export async function deleteProject(id: string) {
  await api.delete(`/api/projects/${id}`)
}
