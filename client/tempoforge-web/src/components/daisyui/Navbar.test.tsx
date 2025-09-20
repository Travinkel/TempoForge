import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Navbar from "./Navbar";
import { useUserSettings } from "../../context/UserSettingsContext";

vi.mock("./ThemeToggle", () => ({
  __esModule: true,
  default: () => <div data-testid="theme-toggle" />,
}));

vi.mock("../../context/UserSettingsContext");

const mockedUseUserSettings = vi.mocked(useUserSettings);

describe("Navbar layout toggle", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders immersive toggle and invokes layout switch", async () => {
    const user = userEvent.setup();
    const toggleLayout = vi.fn();

    mockedUseUserSettings.mockReturnValue({
      layout: "daisyui",
      setLayout: vi.fn(),
      toggleLayout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const button = screen.getByRole("button", { name: /Immersive Mode/i });
    await user.click(button);

    expect(toggleLayout).toHaveBeenCalledTimes(1);
  });

  it("shows exit label when HUD layout is active", () => {
    mockedUseUserSettings.mockReturnValue({
      layout: "hud",
      setLayout: vi.fn(),
      toggleLayout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /Exit Immersive/i })).toBeInTheDocument();
  });
});
