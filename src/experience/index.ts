import { controlPlanRunLabel } from "../control/index.js";
import type { RunKind } from "../model/run.js";

/** Experience layer — request handling only; no business logic. */
export function experienceRequestRunLabel(kind: RunKind): string {
  return controlPlanRunLabel(kind);
}
