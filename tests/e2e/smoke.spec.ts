import { test, expect } from "@playwright/test";

test("playwright toolchain smoke", async ({ page }) => {
  await page.setContent("<h1>ScoutAI</h1>");
  await expect(page.getByRole("heading", { name: "ScoutAI" })).toBeVisible();
});
