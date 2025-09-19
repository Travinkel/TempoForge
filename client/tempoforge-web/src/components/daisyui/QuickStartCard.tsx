import React from "react";
import { Droplet } from "lucide-react";
import { Link } from "react-router-dom";

import AddProjectModal from "./AddProjectModal";
import CustomDurationModal from "./CustomDurationModal";
import type { Project, ProjectCreateRequest } from "../../api/projects";

export type QuickStartRecentItem = {
  project: string;
  duration: string;
  when: string;
};

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
  onStartSprint: (input: { projectId: string; durationMinutes: number }) => Promise<void>;
  onAddProject: (input: ProjectCreateRequest) => Promise<void>;
  onToggleFavorite: (projectId: string, nextValue: boolean) => Promise<void>;
  recent?: QuickStartRecentItem[];
  className?: string;
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
  recent = [],
  className = "",
}: QuickStartCardProps) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(plannedProjectId);
  const [duration, setDuration] = React.useState<DurationOption>(plannedDurationMinutes);
  const [pending, setPending] = React.useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = React.useState(false);
  const [customDurationModalOpen, setCustomDurationModalOpen] = React.useState(false);

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
      const minutes = typeof duration === "number" ? duration : plannedDurationMinutes;
      announcePlan(projectId, minutes);
      onErrorMessage?.(null);
    },
    [announcePlan, duration, onErrorMessage, plannedDurationMinutes],
  );

  const handleDurationChange = React.useCallback(
    (option: DurationOption) => {
      if (option === "custom") {
        setCustomDurationModalOpen(true);
        return;
      }
      setDuration(option);
      announcePlan(selectedProjectId, option);
      onErrorMessage?.(null);
    },
    [announcePlan, onErrorMessage, selectedProjectId],
  );

  const handleCustomDurationConfirm = React.useCallback(
    (minutes: number) => {
      setDuration(minutes);
      announcePlan(selectedProjectId, minutes);
      onErrorMessage?.(null);
    },
    [announcePlan, onErrorMessage, selectedProjectId],
  );

  const handleAddProject = React.useCallback(() => {
    setIsAddProjectModalOpen(true);
    onErrorMessage?.(null);
  }, [onErrorMessage]);

  const handleAddProjectClose = React.useCallback(() => {
    setIsAddProjectModalOpen(false);
  }, []);

  const handleCustomDurationClose = React.useCallback(() => {
    setCustomDurationModalOpen(false);
  }, []);

  const handleAddProjectSubmit = React.useCallback(
    async (input: ProjectCreateRequest) => {
      await onAddProject(input);
      onErrorMessage?.(null);
      setIsAddProjectModalOpen(false);
    },
    [onAddProject, onErrorMessage],
  );

  const handleToggleFavorite = React.useCallback(
    async (project: Project) => {
      await onToggleFavorite(project.id, !project.isFavorite);
    },
    [onToggleFavorite],
  );

  const handleStart = React.useCallback(async () => {
    if (!selectedProjectId) {
      onErrorMessage?.("Select a project.");
      return;
    }

    const minutes = typeof duration === "number" ? duration : plannedDurationMinutes;
    const normalizedDuration =
      Number.isFinite(minutes) ? Math.max(1, Math.round(Number(minutes))) : plannedDurationMinutes;

    if (!Number.isFinite(normalizedDuration) || normalizedDuration <= 0) {
      onErrorMessage?.("Select a valid sprint duration before starting.");
      return;
    }

    const payload = { projectId: selectedProjectId, durationMinutes: normalizedDuration } as const;

    setPending(true);
    onErrorMessage?.(null);

    try {
      await onStartSprint(payload);
      onErrorMessage?.(null);
      setDuration(payload.durationMinutes);
      announcePlan(payload.projectId, payload.durationMinutes);
    } catch (error) {
      console.error("Failed to start sprint", error);
      onErrorMessage?.("Failed to start sprint. Please try again.");
    } finally {
      setPending(false);
    }
  }, [announcePlan, duration, onErrorMessage, onStartSprint, plannedDurationMinutes, selectedProjectId]);

  const allProjectsEmpty = !loading && projects.length === 0;
  const effectiveDuration = typeof duration === "number" ? duration : plannedDurationMinutes;

  const cardClassName = [
    "card",
    "glow-box",
    "text-amber-100",
    "min-h-[260px]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={cardClassName}>
        <div className="card-body gap-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="heading-gilded gold-text text-xl">Quick Start</h2>
            <span className="rounded border border-amber-500/35 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-amber-200/80">
              {effectiveDuration}m
            </span>
          </div>

          {error && (
            <div className="rounded border border-red-500/40 bg-red-900/20 px-3 py-2 text-sm text-red-200">
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((skeleton) => (
                <div key={skeleton} className="h-10 animate-pulse rounded bg-base-100/10" />
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
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                          isSelected
                            ? "border-amber-400 bg-amber-500/80 text-black shadow-[0_0_10px_rgba(249,115,22,0.45)]"
                            : "border-amber-500/35 bg-black/50 text-amber-100/80 hover:border-amber-400/60"
                        }`}
                      >
                        {project.name}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="rounded-full border border-amber-500/35 bg-black/60 px-4 py-1.5 text-sm text-amber-100/80 hover:border-amber-400/60"
                  >
                    + Add
                  </button>
                </div>
                {favorites.length === 0 && (
                  <div className="text-xs uppercase tracking-[0.18em] text-amber-200/70">
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
                      className={`rounded border px-4 py-1.5 text-xs uppercase tracking-[0.24em] transition ${
                        isSelected
                          ? "border-amber-400 bg-amber-500/80 text-black shadow-[0_0_10px_rgba(249,115,22,0.45)]"
                          : "border-amber-500/30 bg-black/40 text-amber-200/80 hover:border-amber-400/60"
                      }`}
                    >
                      {value === "custom" ? "Custom" : `${value}m`}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="btn border border-amber-500/40 bg-amber-500/80 px-8 text-black hover:bg-amber-400 disabled:opacity-40"
                  onClick={handleStart}
                  disabled={pending || sprintStarting || !selectedProjectId}
                >
                  {pending || sprintStarting ? "Starting..." : "Start Sprint"}
                </button>
                <span className="text-xs uppercase tracking-[0.24em] text-amber-200/70">
                  {selectedProjectId ? "Ready when you are." : "Select a project to stage your next sprint."}
                </span>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-amber-200/70">
                  <span>All Projects</span>
                  <Link to="/projects" className="text-amber-300 hover:text-amber-200">View all</Link>
                </div>
                {allProjectsEmpty ? (
                  <div className="rounded border border-amber-500/20 bg-black/35 px-3 py-2 text-sm text-amber-100/75">
                    Create your first project to get started.
                  </div>
                ) : (
                  <ul className="divide-y divide-amber-500/15">
                    {projects.map((project) => {
                      const lastUsed = project.lastUsedAt
                        ? new Date(project.lastUsedAt).toLocaleString()
                        : "Not used yet";
                      return (
                        <li key={project.id} className="flex items-center justify-between py-3">
                          <button
                            type="button"
                            className={`text-left transition ${selectedProjectId === project.id ? "font-semibold text-amber-50" : "text-amber-100/80 hover:text-amber-50"}`}
                            onClick={() => handleSelectProject(project.id)}
                          >
                            <div>{project.name}</div>
                            <div className="text-xs uppercase tracking-[0.2em] text-amber-200/60">Last used {lastUsed}</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFavorite(project)}
                            aria-label="Toggle favorite"
                          >
                            <Droplet
                              className={
                                project.isFavorite
                                  ? "text-amber-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.45)]"
                                  : "text-amber-200/50 hover:text-amber-100/80"
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

          {recent.length > 0 && (
            <div className="rounded border border-amber-500/20 bg-black/35 px-3 py-2 text-sm text-amber-100/80">
              <div className="mb-2 text-xs uppercase tracking-[0.24em] text-amber-200/70">Recent Focus</div>
              <ul className="space-y-1">
                {recent.slice(0, 3).map((item, index) => (
                  <li key={`${item.project}-${index}`} className="flex items-center justify-between gap-2">
                    <span className="truncate">{item.project}</span>
                    <span className="text-xs text-amber-200/70">{item.duration} · {item.when}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={handleAddProjectClose}
        onSubmit={handleAddProjectSubmit}
      />
      <CustomDurationModal
        open={customDurationModalOpen}
        initialMinutes={typeof duration === "number" ? duration : plannedDurationMinutes}
        onClose={handleCustomDurationClose}
        onConfirm={handleCustomDurationConfirm}
      />
    </>
  );
}
