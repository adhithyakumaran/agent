import fs from "node:fs";
import { test as base, type Page } from "@playwright/test";
import { scoutaiEnv } from "../helpers/scoutai-env.js";

/**
 * Authenticated tests: storageState is loaded by the Playwright project config.
 * This fixture only documents reuse — it does not log in again.
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    if (!fs.existsSync(scoutaiEnv.storageStatePath)) {
      throw new Error(
        `Missing storageState at ${scoutaiEnv.storageStatePath}. Run the setup project first.`,
      );
    }

    console.log(
      `[scoutai:fixture] reusing saved storageState from ${scoutaiEnv.storageStatePath} (skipping login)`,
    );
    await use(page);
  },
});

export { expect } from "@playwright/test";
