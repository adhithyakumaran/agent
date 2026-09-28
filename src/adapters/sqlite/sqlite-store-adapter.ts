import type { StorePort } from "../../ports/store.js";
import type { RunKind, RunLifecycle } from "../../model/run.js";

/**
 * SQLite store adapter placeholder (no SQLite driver in P0.1).
 * Only this folder may import better-sqlite3 when implemented.
 */
export function createSqliteStoreAdapter(): StorePort {
  return {
    kind: "store",
    describeRun(kind: RunKind, lifecycle: RunLifecycle): string {
      return `sqlite:${kind}:${lifecycle}`;
    },
  };
}
