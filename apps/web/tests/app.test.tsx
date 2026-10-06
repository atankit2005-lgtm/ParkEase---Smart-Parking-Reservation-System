import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../src/App";

describe("App", () => {
  it("renders the ParkEase heading", () => {
    render(<App />);

    const heading = screen.getByRole("heading", { name: "ParkEase" });
    expect(heading.textContent).toBe("ParkEase");
  });

  it("renders the shell status from the contracts type", () => {
    render(<App />);

    const status = screen.getByTestId("boot-health");
    expect(status.textContent).toContain("ok");
  });
});
