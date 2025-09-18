import React from "react";

const THEMES = ["tempoforge", "light", "dark", "dracula"] as const;
type ThemeName = (typeof THEMES)[number];

const STORAGE_KEY = "tempoforge:theme";

const applyTheme = (theme: ThemeName) => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.setAttribute("data-theme", theme);
};

const readStoredTheme = (): ThemeName => {
  if (typeof window === "undefined") {
    return "tempoforge";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return THEMES.includes(stored as ThemeName) ? (stored as ThemeName) : "tempoforge";
};

export default function ThemeToggle(): JSX.Element {
  const [theme, setTheme] = React.useState<ThemeName>(() => readStoredTheme());

  React.useEffect(() => {
    applyTheme(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  return (
    <label className="form-control w-40">
      <div className="label py-0">
        <span className="label-text text-xs uppercase tracking-[0.2em] text-base-content/70">
          Theme
        </span>
      </div>
      <select
        className="select select-bordered select-sm"
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemeName)}
      >
        {THEMES.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
