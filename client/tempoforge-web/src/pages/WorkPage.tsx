import React from "react";

import QuickStartCard from "../components/daisyui/QuickStartCard";
import StatsCard from "../components/daisyui/StatsCard";
import ProgressCard from "../components/daisyui/ProgressCard";
import TimerCard from "../components/daisyui/TimerCard";
import { useSprintContext } from "../context/SprintContext";

import type { Project, ProjectCreateRequest } from "../api/projects";
import { addProject, getFavoriteProjects, getProjects, updateProject } from "../api/projects";
import type { ProgressStats, RecentSprint, TodayStats } from "../api/sprints";

const STORAGE_KEY = "tempoforge:tasks";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type TaskStatus = "backlog" | "in-progress" | "done";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
};

type Column = {
  status: TaskStatus;
  title: string;
  helper: string;
};

const COLUMNS: Column[] = [
  { status: "backlog", title: "Backlog", helper: "Ideas and quests waiting to enter the forge." },
  { status: "in-progress", title: "In Progress", helper: "Active focus work you are forging right now." },
  { status: "done", title: "Done", helper: "Completed victories ready for celebration." },
];

const loadStoredTasks = (): Task[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Task[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((task) => typeof task.id === "string" && typeof task.title === "string");
  } catch (error) {
    console.warn("Failed to parse stored tasks", error);
    return [];
  }
};

const persistTasks = (tasks: Task[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn("Failed to persist tasks", error);
  }
};

const formatRecent = (recent: RecentSprint[]): { project: string; duration: string; when: string }[] =>
  recent.map((item) => {
    const start = new Date(item.startedAtUtc);
    const when = Number.isNaN(start.getTime())
      ? "Unknown time"
      : start.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

    return {
      project: item.projectName,
      duration: `${item.durationMinutes}m`,
      when,
    };
  });

type WorkBoardProps = {
  tasks: Task[];
  onCreate: (title: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
};

function WorkBoard({ tasks, onCreate, onStatusChange, onDelete }: WorkBoardProps) {
  const modalRef = React.useRef<HTMLDialogElement | null>(null);
  const [title, setTitle] = React.useState("");

  const openModal = () => modalRef.current?.showModal();
  const closeModal = () => modalRef.current?.close();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onCreate(trimmed);
    setTitle("");
    closeModal();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-base-content">Work Board</h2>
          <p className="text-sm text-base-content/70">
            Keep track of upcoming quests, active focus, and finished victories.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openModal}>
          New Task
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);
          return (
            <div key={column.status} className="space-y-4 rounded-2xl border border-base-content/10 bg-base-200/70 p-4 shadow">
              <header className="space-y-1">
                <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-base-content/70">
                  {column.title}
                </h3>
                <p className="text-xs text-base-content/60">{column.helper}</p>
              </header>

              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-base-content/15 bg-base-100/60 px-3 py-8 text-center text-sm text-base-content/60">
                    No tasks here yet.
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <article key={task.id} className="rounded-xl border border-base-content/10 bg-base-100/90 p-4 shadow-sm transition hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-base-content">{task.title}</h4>
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost text-error"
                          onClick={() => onDelete(task.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-base-content/60">Added {new Date(task.createdAt).toLocaleString()}</div>
                      <div className="mt-3">
                        <label className="label mb-1 justify-start gap-2 p-0 text-xs font-semibold uppercase tracking-[0.28em] text-base-content/60">
                          <span>Status</span>
                        </label>
                        <select
                          className="select select-bordered select-sm w-full"
                          value={task.status}
                          onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
                        >
                          <option value="backlog">Backlog</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <form method="dialog" className="modal-box space-y-4" onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold text-base-content">Add Task</h3>
          <p className="text-sm text-base-content/70">
            Give the task a short, action-oriented title to keep it focused.
          </p>
          <input
            className="input input-bordered w-full"
            placeholder="Write a draft, polish the UI, review pull request..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Task
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}

export default function WorkPage(): JSX.Element {
  const {
    timerLabel,
    active,
    isCritical,
    canStart,
    startSprint,
    cancelSprint,
    completeSprint,
    progressStats,
    todayStats,
    recentSprints,
    metricsLoading,
    refreshMetrics,
  } = useSprintContext();

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [favorites, setFavorites] = React.useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState<boolean>(false);
  const [favoritesLoading, setFavoritesLoading] = React.useState<boolean>(false);
  const [projectsError, setProjectsError] = React.useState<string | null>(null);
  const [favoritesError, setFavoritesError] = React.useState<string | null>(null);
  const [quickStartError, setQuickStartError] = React.useState<string | null>(null);
  const [plannedProjectId, setPlannedProjectId] = React.useState<string | null>(null);
  const [plannedDurationMinutes, setPlannedDurationMinutes] = React.useState<number>(25);
  const [quickStartActionPending, setQuickStartActionPending] = React.useState<boolean>(false);

  const [tasks, setTasks] = React.useState<Task[]>(() => loadStoredTasks());

  const loadProjects = React.useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);

    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects", error);
      setProjectsError("Failed to load projects.");
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const loadFavorites = React.useCallback(async () => {
    setFavoritesLoading(true);
    setFavoritesError(null);

    try {
      const data = await getFavoriteProjects();
      setFavorites(data);
    } catch (error) {
      console.error("Failed to load favorite projects", error);
      setFavoritesError("Failed to load favorite projects.");
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadProjects();
    void loadFavorites();
  }, [loadFavorites, loadProjects]);

  React.useEffect(() => {
    persistTasks(tasks);
  }, [tasks]);

  React.useEffect(() => {
    if (!plannedProjectId && favorites.length > 0) {
      setPlannedProjectId(favorites[0].id);
    }
  }, [favorites, plannedProjectId]);

  const handleCreate = React.useCallback((title: string) => {
    setTasks((current) => [
      ...current,
      {
        id: createId(),
        title,
        status: "backlog",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleStatusChange = React.useCallback((id: string, status: TaskStatus) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
  }, []);

  const handleDelete = React.useCallback((id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  const handlePlanSprint = React.useCallback((projectId: string | null, durationMinutes: number) => {
    setPlannedProjectId(projectId);
    setPlannedDurationMinutes(durationMinutes);
  }, []);

  const handleStartSprint = React.useCallback(
    async ({ projectId, durationMinutes }: { projectId: string; durationMinutes: number }) => {
      if (!projectId) {
        setQuickStartError("Select a project.");
        return;
      }

      setQuickStartActionPending(true);
      setQuickStartError(null);

      try {
        await startSprint({ projectId, durationMinutes });
        await refreshMetrics(true);
        setPlannedProjectId(projectId);
        setPlannedDurationMinutes(durationMinutes);
      } catch (error) {
        console.error("Failed to start sprint", error);
        setQuickStartError("Failed to start sprint. Please try again.");
        throw error;
      } finally {
        setQuickStartActionPending(false);
      }
    },
    [refreshMetrics, startSprint],
  );

  const handleQuickAddProject = React.useCallback(
    async ({ name, isFavorite = false }: ProjectCreateRequest) => {
      await addProject({ name, isFavorite });
      await Promise.all([loadProjects(), loadFavorites()]);
    },
    [loadFavorites, loadProjects],
  );

  const handleToggleFavorite = React.useCallback(
    async (projectId: string, nextValue: boolean) => {
      try {
        await updateProject(projectId, { isFavorite: nextValue });
        await Promise.all([loadProjects(), loadFavorites()]);
      } catch (error) {
        console.error("Failed to update project favorite", error);
      }
    },
    [loadFavorites, loadProjects],
  );

  const stats: TodayStats | null = todayStats ?? null;
  const progress: ProgressStats | null = progressStats ?? null;
  const recent = React.useMemo(() => formatRecent(recentSprints), [recentSprints]);
  const quickStartLoading = projectsLoading || favoritesLoading;
  const quickStartErrorMessage = quickStartError ?? projectsError ?? favoritesError;

  return (
    <div className="space-y-10">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <StatsCard
          className="h-full"
          minutes={stats?.minutesFocused ?? null}
          sprints={stats?.sprintCount ?? null}
          streakDays={stats?.streakDays ?? null}
          loading={metricsLoading}
        />
        <TimerCard
          label={timerLabel}
          subtitle={active ? "Sprint in progress" : "Ready when you are"}
          active={active}
          isCritical={isCritical}
          canStart={canStart}
          onStart={startSprint}
          onCancel={cancelSprint}
          onComplete={completeSprint}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ProgressCard progress={progress} loading={metricsLoading} />
        <QuickStartCard
          projects={projects}
          favorites={favorites}
          loading={quickStartLoading}
          error={quickStartErrorMessage}
          onErrorMessage={setQuickStartError}
          plannedProjectId={plannedProjectId}
          plannedDurationMinutes={plannedDurationMinutes}
          sprintStarting={quickStartActionPending}
          onPlanSprint={handlePlanSprint}
          onStartSprint={handleStartSprint}
          onAddProject={handleQuickAddProject}
          onToggleFavorite={handleToggleFavorite}
          recent={recent}
        />
      </section>

      <WorkBoard
        tasks={tasks}
        onCreate={handleCreate}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
