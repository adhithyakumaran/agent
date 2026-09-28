/**
 * Deliberate illegal dependency for architecture proof only.
 * Capabilities must not import adapters (see docs/architecture.md).
 * Excluded from `npm run check:boundaries`; validated by tests/unit/boundary-violation.test.ts.
 */
import { createSqliteStoreAdapter } from "../../adapters/sqlite/sqlite-store-adapter.js";

/** Probe export so dependency-cruiser sees the illegal import edge. */
export const boundaryViolationProbe = createSqliteStoreAdapter;
