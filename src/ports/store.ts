import type { RunKind, RunLifecycle } from "../model/run.js";

/** Store port — persistence contract (implemented by SQLite adapter in a later phase). */
export interface StorePort {
  readonly kind: "store";
  describeRun(kind: RunKind, lifecycle: RunLifecycle): string;
}
