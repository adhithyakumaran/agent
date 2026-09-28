import path from "node:path";
import { config as loadDotenv } from "dotenv";

loadDotenv();

const defaultBaseUrl = "http://127.0.0.1:4173";
const defaultStorageStatePath = path.join(
  "artifacts",
  "runtime",
  "storage-state.json",
);

/** Shared env contract for Playwright config, setup, and proof tests. */
export const scoutaiEnv = {
  baseURL: process.env.SCOUTAI_BASE_URL ?? defaultBaseUrl,
  storageStatePath:
    process.env.SCOUTAI_STORAGE_STATE_PATH ?? defaultStorageStatePath,
  user: process.env.SCOUTAI_USER ?? "",
  password: process.env.SCOUTAI_PASSWORD ?? "",
};

export function assertAuthCredentialsConfigured(): void {
  if (!scoutaiEnv.user || !scoutaiEnv.password) {
    throw new Error(
      "SCOUTAI_USER and SCOUTAI_PASSWORD must be set (see .env.example).",
    );
  }
}
