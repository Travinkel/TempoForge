import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard, { DashboardShell } from "./pages/Dashboard";
import Settings from "./pages/Settings";
import LoadingScreen from "./components/hud/LoadingScreen";
import type { Project } from "./api/projects";
import { getProjects, addProject } from "./api/projects";
import { SprintProvider } from "./context/SprintContext";
import { UserSettingsProvider } from "./context/UserSettingsContext";
import "./index.css";

console.log("API base:", import.meta.env.VITE_API_BASE_URL);

function Projects() {
  const [items, setItems] = React.useState<Project[]>([]);
  const [name, setName] = React.useState("");
  const [isFavorite, setIsFavorite] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    getProjects()
      .then(setItems)
      .catch((err) =>
        setError(err?.response?.data?.title ?? "Failed to load projects"),
      );
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!name) return;
      await addProject({ name, isFavorite });
      setItems(await getProjects());
      setName("");
      setIsFavorite(false);
    } catch (err: any) {
      setError(err?.response?.data?.title ?? "Failed to add project");
    }
  };

  return (
    <DashboardShell>
      <h1 className="gold-text mb-4 text-3xl font-bold">Projects</h1>
      <form className="mb-4 flex flex-wrap gap-2" onSubmit={submit}>
        <input
          className="input input-bordered flex-1 min-w-[180px]"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="label cursor-pointer gap-2">
          <span className="label-text">Favorite</span>
          <input
            type="checkbox"
            className="toggle"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
          />
        </label>
        <button className="btn btn-primary" type="submit">
          Add
        </button>
      </form>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="card bg-neutral text-neutral-content p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{p.name}</span>
              {p.isFavorite && <span className="badge badge-primary">Favorite</span>}
            </div>
            <div className="text-xs opacity-70">
              Created {new Date(p.createdAt).toLocaleString()}
            </div>
            <div className="text-xs opacity-70">
              Last used {p.lastUsedAt ? new Date(p.lastUsedAt).toLocaleString() : "Not used yet"}
            </div>
          </li>
        ))}
      </ul>
    </DashboardShell>
  );
}

const Focus = () => (
  <DashboardShell>
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">Focus timer TBD</div>
    </div>
  </DashboardShell>
);

const History = () => (
  <DashboardShell>
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">History TBD</div>
    </div>
  </DashboardShell>
);

const About = () => (
  <DashboardShell>
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body space-y-3">
        <h1 className="card-title gold-text text-3xl font-bold">About TempoForge</h1>
        <p>
          TempoForge blends productivity dashboards with game-inspired HUDs.
          Toggle your layout in the navbar or settings and we will remember the
          choice for next time.
        </p>
      </div>
    </div>
  </DashboardShell>
);

const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/projects", element: <Projects /> },
  { path: "/focus", element: <Focus /> },
  { path: "/history", element: <History /> },
  { path: "/settings", element: <Settings /> },
  { path: "/about", element: <About /> },
]);

function AppRoot() {
  type Phase = "loading" | "slowing" | "fading" | "ready";
  const [phase, setPhase] = React.useState<Phase>("loading");

  React.useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("slowing"), 800));
    timers.push(window.setTimeout(() => setPhase("fading"), 1100));
    timers.push(window.setTimeout(() => setPhase("ready"), 1400));
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase !== "ready") {
    return (
      <LoadingScreen
        slowing={phase !== "loading"}
        fading={phase === "fading"}
      />
    );
  }

  return (
    <UserSettingsProvider>
      <SprintProvider>
        <RouterProvider router={router} />
      </SprintProvider>
    </UserSettingsProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>,
);
