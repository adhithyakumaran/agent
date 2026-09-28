/**
 * DELIBERATE illegal dependency for architecture proof only.
 * Capability code must not import adapters. This file is excluded from
 * `npm run check:boundaries` but scanned by tests/unit/boundary-violation.test.ts.
 */
import { createSqliteStoreAdapter } from "../../adapters/sqlite/sqlite-store-adapter.js";

export const boundaryViolationProbe = createSqliteStoreAdapter;
