import React from "react";
import Navbar from "../components/daisyui/Navbar";
import DashboardPage from "./DashboardPage";
import HudPage from "./HudPage";
import { useUserSettings } from "../context/UserSettingsContext";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-base-content">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 pt-6 pb-24">{children}</main>
    </div>
  );
}

export default function Dashboard(): JSX.Element {
  const { layout } = useUserSettings();

  if (layout === "hud") {
    return (
      <>
        <Navbar />
        <HudPage />
      </>
    );
  }

  return (
    <DashboardShell>
      <DashboardPage />
    </DashboardShell>
  );
}


