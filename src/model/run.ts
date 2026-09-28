import { z } from "zod";

/** Pure run-kind schema — no IO. */
export const RunKindSchema = z.enum(["DISCOVERY", "EXECUTION", "DAILY"]);
export type RunKind = z.infer<typeof RunKindSchema>;

export const RunLifecycleSchema = z.enum([
  "CREATED",
  "RUNNING",
  "DONE",
  "FAILED",
  "CANCELLED",
  "INTERRUPTED",
  "BLOCKED",
]);
export type RunLifecycle = z.infer<typeof RunLifecycleSchema>;
