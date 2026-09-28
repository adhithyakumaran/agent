import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { scoutaiEnv } from "./tests/e2e/helpers/scoutai-env.js";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const standinServer = path.join(repoRoot, "tests/e2e/standin/server.mjs");
const standinPort = new URL(scoutaiEnv.baseURL).port || "4173";

const headed =
  process.env.SCOUTAI_HEADED === "1" ||
  process.argv.includes("--headed");
const ci = process.env.CI === "true" || process.env.CI === "1";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    baseURL: scoutaiEnv.baseURL,
    headless: ci ? true : !headed,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `node ${standinServer}`,
    url: scoutaiEnv.baseURL,
    reuseExistingServer: !ci,
    env: {
      SCOUTAI_STANDIN_PORT: standinPort,
      SCOUTAI_USER: scoutaiEnv.user,
      SCOUTAI_PASSWORD: scoutaiEnv.password,
    },
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "smoke",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-authenticated",
      dependencies: ["setup"],
      testMatch: /runtime-proof\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: scoutaiEnv.storageStatePath,
        trace: "on",
        video: "on",
        screenshot: "on",
      },
    },
  ],
});
