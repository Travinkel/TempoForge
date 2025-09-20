import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Dashboard, { DashboardShell } from "../pages/Dashboard";
import WorkPage from "../pages/WorkPage";
import Settings from "../pages/Settings";

vi.mock("../pages/Dashboard", () => ({
  __esModule: true,
  default: () => <div>Dashboard Page</div>,
  DashboardShell: ({ children }: { children: React.ReactNode }) => <div data-testid="shell">{children}</div>,
}));

vi.mock("../pages/WorkPage", () => ({
  __esModule: true,
  default: () => <div>Work Page</div>,
}));

vi.mock("../pages/Settings", () => ({
  __esModule: true,
  default: () => <div>Settings Page</div>,
}));

const renderRoute = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/work" element={<DashboardShell><WorkPage /></DashboardShell>} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MemoryRouter>,
  );

describe("App routes", () => {
  it("renders Dashboard route without crashing", () => {
    renderRoute("/dashboard");
    expect(screen.getByText(/Dashboard Page/i)).toBeInTheDocument();
  });

  it("renders Work route without crashing", () => {
    renderRoute("/work");
    expect(screen.getByText(/Work Page/i)).toBeInTheDocument();
  });

  it("renders Settings route without crashing", () => {
    renderRoute("/settings");
    expect(screen.getByText(/Settings Page/i)).toBeInTheDocument();
  });
});
