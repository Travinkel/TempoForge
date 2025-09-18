import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

export interface Project {
  id: string;
  name: string;
  isFavorite: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export async function getProjects(favorites?: boolean): Promise<Project[]> {
  const query = favorites ? "?favorites=true" : "";
  const { data } = await api.get<Project[]>(`/api/projects${query}`);
  return data;
}

export async function getFavoriteProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>(`/api/projects/favorites`);
  return data;
}

export async function addProject(name: string, isFavorite = false) {
  await api.post("/api/projects", { name, isFavorite });
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, "name" | "isFavorite">>,
) {
  await api.put(`/api/projects/${id}`, patch);
}

export async function deleteProject(id: string) {
  await api.delete(`/api/projects/${id}`);
}
