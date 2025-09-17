import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

export interface Project {
  id: string;
  name: string;
  track: number;
  pinned: boolean;
  createdAt: string;
}

export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>("/api/projects");
  return data;
}

export async function addProject(name: string, track: number) {
  await api.post("/api/projects", { name, track, pinned: false });
}
