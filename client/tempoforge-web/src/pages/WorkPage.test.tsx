import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";

import WorkPage from "./WorkPage";
import { getProjects, getFavoriteProjects } from "../api/projects";
import { useSprintContext } from "../context/SprintContext";

jest.mock("../config", () => ({ API_BASE: "http://localhost:5000" }));
jest.mock("../api/projects");
jest.mock("../context/SprintContext");

const mockedGetProjects = getProjects as jest.MockedFunction<typeof getProjects>;
const mockedGetFavoriteProjects = getFavoriteProjects as jest.MockedFunction<typeof getFavoriteProjects>;
const mockedUseSprintContext = useSprintContext as jest.MockedFunction<typeof useSprintContext>;

describe("WorkPage", () => {
  beforeEach(() => {
    mockedGetProjects.mockResolvedValue([
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
    ]);

    mockedGetFavoriteProjects.mockResolvedValue([
      {
        id: "project-1",
        name: "Forge HUD",
        isFavorite: true,
        createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        lastUsedAt: new Date("2024-01-02T00:00:00Z").toISOString(),
      },
    ]);

    mockedUseSprintContext.mockReturnValue({
      timerLabel: "25:00",
      active: false,
      isCritical: false,
      canStart: true,
      startSprint: jest.fn().mockResolvedValue(undefined),
      cancelSprint: jest.fn().mockResolvedValue(undefined),
      completeSprint: jest.fn().mockResolvedValue(undefined),
      progressStats: {
        standing: "Bronze",
        completedSprints: 10,
        percentToNext: 0.4,
        nextThreshold: 15,
        quest: {
          dailyGoal: 3,
          dailyCompleted: 2,
          weeklyGoal: 15,
          weeklyCompleted: 8,
          epicGoal: 100,
          epicCompleted: 25,
        },
      },
      todayStats: {
        sprintCount: 2,
        minutesFocused: 50,
        streakDays: 4,
      },
      recentSprints: [
        {
          id: "s1",
          projectName: "Forge HUD",
          durationMinutes: 25,
          startedAtUtc: new Date("2024-01-05T12:00:00Z").toISOString(),
          status: 1,
        },
      ],
      metricsLoading: false,
      refreshMetrics: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders projects, recent sprints, and metrics", async () => {
    render(
      <MemoryRouter>
        <WorkPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockedGetProjects).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Forge HUD/i).length).toBeGreaterThan(0);
    });
    expect(screen.getByText("API Hardening")).toBeInTheDocument();
    expect(screen.getByText(/Today's Stats/i)).toBeInTheDocument();
    expect(screen.getByText(/50m/)).toBeInTheDocument();
    expect(screen.getByText(/Rank Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Focus/i)).toBeInTheDocument();
    expect(screen.getByText(/Work Board/i)).toBeInTheDocument();
  });
});
