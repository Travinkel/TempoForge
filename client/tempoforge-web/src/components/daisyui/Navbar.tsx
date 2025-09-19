import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useUserSettings } from "../../context/UserSettingsContext";

type NavItem = {
  to: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/work", label: "Work" },
  { to: "/settings", label: "Settings" },
  { to: "/about", label: "About" },
];

const navButtonClasses = "btn btn-ghost btn-sm normal-case tracking-wide transition-colors";

export default function Navbar(): JSX.Element {
  const { layout, toggleLayout } = useUserSettings();

  const immersiveLabel = layout === "hud" ? "Exit Immersive" : "Immersive Mode";

  return (
    <header className="navbar sticky top-0 z-40 border-b border-base-content/10 bg-base-100/95 text-base-content backdrop-blur shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/logo-primary-no-arms-no-background-no-clock-background.png"
            alt="TempoForge logo"
            className="h-10 w-auto"
          />
          <span className="hidden text-lg font-semibold leading-none tracking-[0.35em] heading-gilded gold-text sm:block">
            TempoForge
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  navButtonClasses,
                  isActive ? "bg-primary/10 text-primary" : "text-base-content/70 hover:text-base-content",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}

          <button
            type="button"
            className="btn btn-outline btn-sm normal-case"
            onClick={toggleLayout}
          >
            {immersiveLabel}
          </button>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
