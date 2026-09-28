import type { RunKind } from "../model/run.js";

/** Capability-layer placeholder — no adapter imports. */
export function capabilityPlanRunLabel(kind: RunKind): string {
  return `capability:${kind}:CREATED`;
}
