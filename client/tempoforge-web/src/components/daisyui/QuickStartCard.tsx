import React from "react";
import { Droplet } from "lucide-react";
import type {
  Project,
  ProjectCreateRequest,
} from "../../api/projects";

type DurationOption = number | "custom";

type QuickStartCardProps = {
  projects: Project[];
  favorites: Project[];
  loading?: boolean;
  error?: string | null;
  onErrorMessage?: (message: string | null) => void;
  plannedProjectId: string | null;
  plannedDurationMinutes: number;
  sprintStarting?: boolean;
  onPlanSprint: (projectId: string | null, durationMinutes: number) => void;
  onStartSprint: (projectId: string, durationMinutes: number) => Promise<void>;
  onAddProject: (input: ProjectCreateRequest) => Promise<void>;
  onToggleFavorite: (projectId: string, nextValue: boolean) => Promise<void>;
};

const DURATION_OPTIONS: DurationOption[] = [15, 25, 45, "custom"];

export default function QuickStartCard({
  projects,
  favorites,
  loading = false,
  error,
  onErrorMessage,
  plannedProjectId,
  plannedDurationMinutes,
  sprintStarting = false,
  onPlanSprint,
  onStartSprint,
  onAddProject,
  onToggleFavorite,
}: QuickStartCardProps) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<
    string | null
  >(plannedProjectId);
  const [duration, setDuration] = React.useState<DurationOption>(
    plannedDurationMinutes,
  );
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setSelectedProjectId(plannedProjectId);
  }, [plannedProjectId]);

  React.useEffect(() => {
    setDuration(plannedDurationMinutes);
  }, [plannedDurationMinutes]);

  const announcePlan = React.useCallback(
    (projectId: string | null, minutes: number) => {
      onPlanSprint(projectId, minutes);
    },
    [onPlanSprint],
  );

  const handleSelectProject = React.useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);
      const minutes =
        typeof duration === "number" ? duration : plannedDurationMinutes;
      announcePlan(projectId, minutes);
      onErrorMessage?.(null);
    },
    [announcePlan, duration, onErrorMessage, plannedDurationMinutes],
  );

  const handleDurationChange = React.useCallback(
    (option: DurationOption) => {
      if (option === "custom") {
        const input = window.prompt(
          "Custom duration (minutes)",
          String(plannedDurationMinutes),
        );
        if (!input) {
          return;
        }
        const parsed = Number.parseInt(input, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          window.alert("Enter a positive number of minutes.");
          return;
        }
        const minutes = Math.min(Math.max(parsed, 1), 180);
        setDuration(minutes);
        announcePlan(selectedProjectId, minutes);
        return;
      }
      setDuration(option);
      announcePlan(selectedProjectId, option);
      onErrorMessage?.(null);
    },
    [announcePlan, onErrorMessage, plannedDurationMinutes, selectedProjectId],
  );

  const handleAddProject = React.useCallback(async () => {
    const name = window.prompt("Project name")?.trim();
    if (!name) {
      return;
    }
    const favorite = window.confirm("Mark as favorite?");
    await onAddProject({ name, isFavorite: favorite });
  }, [onAddProject]);

  const handleToggleFavorite = React.useCallback(
    async (project: Project) => {
      await onToggleFavorite(project.id, !project.isFavorite);
    },
    [onToggleFavorite],
  );

  const handleStart = React.useCallback(async () => {
    if (!selectedProjectId) {
      onErrorMessage?.("Select a project before starting a sprint.");
      return;
    }
    const minutes = typeof duration === "number" ? duration : plannedDurationMinutes;
    setPending(true);
    onErrorMessage?.(null);
    try {
      await onStartSprint(selectedProjectId, minutes);
      onErrorMessage?.(null);
    } catch (error) {
      console.error("Failed to start sprint", error);
      onErrorMessage?.("Failed to start sprint. Please try again.");
    } finally {
      setPending(false);
    }
  }, [duration, onErrorMessage, onStartSprint, plannedDurationMinutes, selectedProjectId]);

  const allProjectsEmpty = !loading && projects.length === 0;
  const effectiveDuration =
    typeof duration === "number" ? duration : plannedDurationMinutes;

  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <h2 className="card-title font-cinzel text-primary">Quick Start</h2>
          <span className="text-xs uppercase tracking-[0.3em] opacity-60">
            {effectiveDuration}m
          </span>
        </div>

        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((skeleton) => (
              <div
                key={skeleton}
                className="h-10 animate-pulse rounded bg-base-100/10"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {favorites.map((project) => {
                  const isSelected = selectedProjectId === project.id;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleSelectProject(project.id)}
                      className={`rounded-full border px-3 py-1 transition-colors ${
                        isSelected
                          ? "border-yellow-700 bg-yellow-500 text-black"
                          : "border-gray-600 bg-gray-800 text-gray-200"
                      }`}
                    >
                      {project.name}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="rounded-full bg-gray-600 px-3 py-1 text-white"
                >
                  + Add
                </button>
              </div>
              {favorites.length === 0 && (
                <div className="mt-3 text-sm opacity-70">
                  Mark a project as favorite to quick-launch it.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((value) => {
                const isSelected =
                  typeof value === "number"
                    ? duration === value
                    : duration === "custom";
                return (
                  <button
                    key={value.toString()}
                    type="button"
                    onClick={() => handleDurationChange(value)}
                    className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-ghost"}`}
                  >
                    {value === "custom" ? "Custom" : `${value}m`}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="btn btn-lg bg-red-700 text-white hover:bg-red-600"
                onClick={handleStart}
                disabled={pending || sprintStarting || !selectedProjectId}
              >
                {pending || sprintStarting ? "Starting�" : "Start Sprint"}
              </button>
              <span className="text-xs opacity-70">
                {selectedProjectId
                  ? "Ready when you are."
                  : "Select a project to stage your next sprint."}
              </span>
            </div>

            <div>
              <div className="mb-1 text-sm opacity-70">All Projects</div>
              {allProjectsEmpty ? (
                <div className="rounded bg-base-100/10 px-3 py-2 text-sm opacity-70">
                  Create your first project to get started.
                </div>
              ) : (
                <ul className="divide-y divide-base-100/25">
                  {projects.map((project) => {
                    const lastUsed = project.lastUsedAt
                      ? new Date(project.lastUsedAt).toLocaleString()
                      : "Not used yet";
                    return (
                      <li
                        key={project.id}
                        className="flex items-center justify-between py-2"
                      >
                        <button
                          type="button"
                          className={`text-left ${selectedProjectId === project.id ? "font-semibold text-yellow-200" : ""}`}
                          onClick={() => handleSelectProject(project.id)}
                        >
                          <div>{project.name}</div>
                          <div className="text-xs opacity-60">Last used {lastUsed}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(project)}
                          aria-label="Toggle favorite"
                        >
                          <Droplet
                            className={
                              project.isFavorite
                                ? "text-red-600"
                                : "text-gray-500 hover:text-red-500"
                            }
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}









