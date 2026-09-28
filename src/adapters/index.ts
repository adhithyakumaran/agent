/**
 * Adapter entry barrel (P0.1).
 * Wire concrete adapters at the composition root in later phases — do not re-export
 * sqlite here; dependency-cruiser only allows imports under `adapters/sqlite/`.
 */
export {};
