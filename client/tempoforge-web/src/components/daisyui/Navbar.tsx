import { Link } from 'react-router-dom'

export type LayoutToggleVariant = 'daisyui' | 'hud'

type NavbarProps = {
  layout?: LayoutToggleVariant
  onToggleLayout?: () => void
}

export default function Navbar({ layout, onToggleLayout }: NavbarProps) {
  const toggleLabel = layout === 'hud' ? 'Switch to DaisyUI' : 'Switch to HUD'
  const showToggle = !import.meta.env.PROD && Boolean(layout && onToggleLayout)

  return (
    <header className="navbar bg-neutral text-neutral-content shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/logo-primary-no-arms-no-background-no-clock-background.png"
              alt="TempoForge Logo"
              className="h-10 w-auto transition-all duration-200 filter drop-shadow-[0_0_4px_rgba(255,215,0,0.35)] hover:scale-105 hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.55)]"
            />
          </Link>
          <nav className="flex items-center gap-2">
            {showToggle && (
              <button type="button" className="btn btn-primary btn-sm" onClick={onToggleLayout}>
                {toggleLabel}
              </button>
            )}
            <Link to="/settings" className="btn btn-ghost btn-sm">
              Settings
            </Link>
            <Link to="/about" className="btn btn-ghost btn-sm">
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
