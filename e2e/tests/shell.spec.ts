import { expect, test } from "@playwright/test";

test("web shell renders the ParkEase heading", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "ParkEase" })).toBeVisible();
});
