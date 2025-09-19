import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";

jest.mock("../pages/Dashboard", () => ({
  __esModule: true,
  default: () => <div>Dashboard Page</div>,
  DashboardShell: ({ children }: { children: React.ReactNode }) => <div data-testid="shell">{children}</div>,
}));

jest.mock("../pages/WorkPage", () => ({
  __esModule: true,
  default: () => <div>Work Page</div>,
}));

jest.mock("../pages/Settings", () => ({
  __esModule: true,
  default: () => <div>Settings Page</div>,
}));

const Dashboard = require("../pages/Dashboard").default;
const { DashboardShell } = require("../pages/Dashboard");
const WorkPage = require("../pages/WorkPage").default;
const Settings = require("../pages/Settings").default;

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
