import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

export interface Project {
  id: string;
  name: string;
  track: number;
  pinned: boolean;
  isFavorite: boolean;
  createdAt: string;
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

export async function addProject(
  name: string,
  track: number,
  isFavorite = false,
  pinned = false,
) {
  await api.post("/api/projects", { name, track, pinned, isFavorite });
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, "name" | "track" | "pinned" | "isFavorite">>,
) {
  await api.put(`/api/projects/${id}`, patch);
}

export async function deleteProject(id: string) {
  await api.delete(`/api/projects/${id}`);
}
