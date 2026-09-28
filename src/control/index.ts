import { capabilityPlanRunLabel } from "../capabilities/index.js";
import type { RunKind } from "../model/run.js";

/**
 * Control layer owns run orchestration (coordinator arrives in a later phase).
 * Only control may change run state in the full system.
 */
export function controlPlanRunLabel(kind: RunKind): string {
  return capabilityPlanRunLabel(kind);
}
