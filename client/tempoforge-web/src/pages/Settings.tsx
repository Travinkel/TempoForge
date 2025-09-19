import Navbar from '../components/daisyui/Navbar'

export default function Settings() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="gold-text text-3xl font-bold">Settings</h1>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body space-y-3">
            <p className="opacity-70">
              Layout selection now lives in the navigation bar. Use the HUD toggle at the top-right to switch between Dashboard and HUD modes.
            </p>
            <p className="opacity-70">More customization options are coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
