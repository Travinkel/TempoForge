import type { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import QuickStartCard from "./QuickStartCard";
import type { Project } from "../../api/projects";

jest.mock("../../config", () => ({ API_BASE: "http://localhost:5000" }));

type QuickStartProps = ComponentProps<typeof QuickStartCard>;

const buildProject = (overrides?: Partial<Project>): Project => ({
  id: "project-1",
  name: "Forge HUD",
  isFavorite: true,
  createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
  lastUsedAt: new Date("2024-01-02T00:00:00Z").toISOString(),
  ...overrides,
});

const defaultRenderProps = (): QuickStartProps => {
  const project = buildProject();
  return {
    projects: [project],
    favorites: [project],
    loading: false,
    error: null,
    onErrorMessage: jest.fn(),
    plannedProjectId: project.id,
    plannedDurationMinutes: 25,
    sprintStarting: false,
    onPlanSprint: jest.fn(),
    onStartSprint: jest.fn().mockResolvedValue(undefined),
    onAddProject: jest.fn().mockResolvedValue(undefined),
    onToggleFavorite: jest.fn().mockResolvedValue(undefined),
    recent: [{ project: project.name, duration: "25m", when: "Today" }],
  };
};

const renderQuickStartCard = (overrideProps?: Partial<QuickStartProps>) => {
  const props: QuickStartProps = { ...defaultRenderProps(), ...overrideProps };

  return render(
    <MemoryRouter>
      <QuickStartCard {...props} />
    </MemoryRouter>,
  );
};

describe("QuickStartCard", () => {
  it("allows entering a custom duration via modal", async () => {
    const onPlanSprint = jest.fn();
    renderQuickStartCard({ onPlanSprint });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /custom/i }));

    const dialog = await screen.findByRole("dialog", { name: /custom duration/i });
    const input = within(dialog).getByRole("spinbutton", { name: /duration/i });
    await user.clear(input);
    await user.type(input, "40");
    await user.click(screen.getByRole("button", { name: /^ok$/i }));

    await waitFor(() => {
      expect(onPlanSprint).toHaveBeenLastCalledWith("project-1", 40);
    });
  });

  it("opens the add project modal and submits details", async () => {
    const onAddProject = jest.fn().mockResolvedValue(undefined);
    renderQuickStartCard({ onAddProject });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /\+ add/i }));

    const modal = await screen.findByRole("dialog", { name: /add project/i });
    const nameField = within(modal).getByLabelText(/project name/i);
    await user.type(nameField, "New Initiative");

    const submit = within(modal).getByRole("button", { name: /add project/i });
    await user.click(submit);

    await waitFor(() => {
      expect(onAddProject).toHaveBeenCalledWith({ name: "New Initiative", isFavorite: false });
    });
  });
});
