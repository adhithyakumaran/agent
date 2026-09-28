import fs from "node:fs/promises";
import path from "node:path";
import { test as setup, expect } from "@playwright/test";
import {
  assertAuthCredentialsConfigured,
  scoutaiEnv,
} from "./helpers/scoutai-env.js";

setup("authenticate and save storageState", async ({ page }) => {
  assertAuthCredentialsConfigured();

  console.log("[scoutai:setup] performing one-time login (setup project)");
  await page.goto("/login");
  await page.getByLabel("Username").fill(scoutaiEnv.user);
  await page.getByLabel("Password").fill(scoutaiEnv.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByTestId("authenticated-banner")).toBeVisible();

  await fs.mkdir(path.dirname(scoutaiEnv.storageStatePath), { recursive: true });
  await page.context().storageState({ path: scoutaiEnv.storageStatePath });
  console.log(
    `[scoutai:setup] saved storageState to ${scoutaiEnv.storageStatePath}`,
  );
});
