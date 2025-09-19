import Navbar from "../components/daisyui/Navbar"
import ThemeToggle from "../components/daisyui/ThemeToggle"

export default function Settings() {
  return (
    <div className="min-h-screen bg-transparent text-base-content">
      <Navbar />
      <main className="container mx-auto max-w-3xl space-y-6 px-4 py-6">
        <h1 className="text-3xl font-semibold text-base-content">Settings</h1>
        <div className="card bg-base-200/80 text-base-content border border-base-content/10 shadow-lg backdrop-blur">
          <div className="card-body space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-base-content">Theme</h2>
              <p className="text-sm text-base-content/70">Choose your preferred realm styling. Changes apply instantly.</p>
              <div className="mt-3 max-w-xs">
                <ThemeToggle />
              </div>
            </div>

            <p className="text-sm text-base-content/70">
              Layout selection now lives in the navigation bar. Use the HUD toggle at the top-right to switch between Dashboard and HUD modes.
            </p>
            <p className="text-sm text-base-content/70">More customization options are coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
