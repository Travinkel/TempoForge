import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar bg-neutral text-neutral-content">
      <div className="container mx-auto px-4">
        <div className="flex w-full items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/logo-primary-no-arms-no-background-no-clock-background.png"
              alt="TempoForge Logo"
              className="h-10 w-auto filter drop-shadow-[0_0_4px_rgba(255,215,0,0.35)] hover:scale-105 hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.55)] transition-all duration-200"
            />
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/settings" className="btn btn-ghost btn-sm">Settings</Link>
            <Link to="/about" className="btn btn-ghost btn-sm">About</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
