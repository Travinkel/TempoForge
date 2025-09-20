import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("applies the stored theme and persists new selections", async () => {
    window.localStorage.setItem("tempoforge:theme", "dark");

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const select = screen.getByRole<HTMLSelectElement>("combobox", { name: /Theme/i });
    expect(select.value).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    await user.selectOptions(select, "lord-of-terror");

    expect(select.value).toBe("lord-of-terror");
    expect(document.documentElement.getAttribute("data-theme")).toBe("lord-of-terror");
    expect(window.localStorage.getItem("tempoforge:theme")).toBe("lord-of-terror");
  });
});
