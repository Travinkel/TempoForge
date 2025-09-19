import Navbar from '../components/daisyui/Navbar'
import ThemeToggle from '../components/daisyui/ThemeToggle'

export default function Settings() {
  return (
    <div className="min-h-screen bg-transparent text-amber-100">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="heading-gilded gold-text text-3xl">Settings</h1>
        <div className="card glow-box text-amber-100">
          <div className="card-body space-y-4">
            <div>
              <h2 className="heading-gilded gold-text text-xl">Theme</h2>
              <p className="text-amber-100/70">Choose your preferred realm styling. Changes apply instantly.</p>
              <div className="mt-3 max-w-xs">
                <ThemeToggle />
              </div>
            </div>

            <p className="text-amber-100/75">
              Layout selection now lives in the navigation bar. Use the HUD toggle at the top-right to switch between Dashboard and HUD modes.
            </p>
            <p className="text-amber-100/75">More customization options are coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

