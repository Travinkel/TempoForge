import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import QuickStartCard from "./QuickStartCard";
import type { Project } from "../../api/projects";

const projects: Project[] = [
  {
    id: "project-1",
    name: "Forge HUD",
    isFavorite: true,
    createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
    lastUsedAt: new Date("2024-01-02T00:00:00Z").toISOString(),
  },
  {
    id: "project-2",
    name: "API Hardening",
    isFavorite: false,
    createdAt: new Date("2024-01-03T00:00:00Z").toISOString(),
    lastUsedAt: null,
  },
];

const favorites: Project[] = [projects[0]];

describe("QuickStartCard", () => {
  it("allows selecting a project, setting a custom duration, and starting a sprint", async () => {
    const user = userEvent.setup();
    const onPlanSprint = vi.fn();
    const onStartSprint = vi.fn().mockResolvedValue(undefined);
    const onAddProject = vi.fn().mockResolvedValue(undefined);
    const onToggleFavorite = vi.fn().mockResolvedValue(undefined);
    const onErrorMessage = vi.fn();

    render(
      <MemoryRouter>
        <QuickStartCard
          projects={projects}
          favorites={favorites}
          plannedProjectId={null}
          plannedDurationMinutes={25}
          onPlanSprint={onPlanSprint}
          onStartSprint={onStartSprint}
          onAddProject={onAddProject}
          onToggleFavorite={onToggleFavorite}
          onErrorMessage={onErrorMessage}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Forge HUD" }));
    expect(onPlanSprint).toHaveBeenLastCalledWith("project-1", 25);

    await user.click(screen.getByRole("button", { name: "Custom" }));

    const modal = await screen.findByRole("dialog", { name: /Custom Duration/i });
    const durationInput = within(modal).getByLabelText(/Duration \(minutes\)/i);
    await user.clear(durationInput);
    await user.type(durationInput, "42");
    await user.click(within(modal).getByRole("button", { name: "OK" }));

    expect(onPlanSprint).toHaveBeenLastCalledWith("project-1", 42);
    expect(screen.queryByRole("dialog", { name: /Custom Duration/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Start Sprint/i }));

    await waitFor(() => {
      expect(onStartSprint).toHaveBeenCalledWith({ projectId: "project-1", durationMinutes: 42 });
    });

    expect(onErrorMessage).toHaveBeenLastCalledWith(null);
    expect(onToggleFavorite).not.toHaveBeenCalled();
    expect(onAddProject).not.toHaveBeenCalled();
  });
});
