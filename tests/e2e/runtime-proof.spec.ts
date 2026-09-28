import fs from "node:fs/promises";
import path from "node:path";
import { test, expect } from "./fixtures/scoutai-test.js";

const proofScreenshotPath = path.join(
  "artifacts",
  "runtime",
  "proof-screenshot.png",
);

test("p0.2 runtime proof — authenticated session and artifacts", async ({
  authenticatedPage: page,
}) => {
  console.log("[scoutai:proof] navigating to /app without repeating login");

  await page.goto("/app");
  await expect(page.getByTestId("authenticated-banner")).toBeVisible();

  await fs.mkdir(path.dirname(proofScreenshotPath), { recursive: true });
  await page.screenshot({ path: proofScreenshotPath, fullPage: true });
  console.log(`[scoutai:proof] explicit screenshot saved to ${proofScreenshotPath}`);
});
