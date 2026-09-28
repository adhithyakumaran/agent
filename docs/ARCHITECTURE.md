# ScoutAI Architecture

Architecture is **locked** per `SCOUTAI_FINAL_WORK_BUILD_GUIDE.md`. This document summarizes layer boundaries enforced in P0.1.

## Layers

```text
experience/   API, UI, CLI triggers (no business logic)
    ↓
control/      Run coordinator — sole owner of run-state transitions
    ↓
capabilities/ Focused deterministic modules (discovery, execution, …)
    ↓
ports/        Small abstraction contracts (Browser, Store, LLM, …)

adapters/     Implement ports (Playwright, SQLite, filesystem, …)
model/        Pure schemas and types — no IO
domain/       Domain packs (APEX, Endless Aisle) — not imported by core
data/         Durable structured storage paths (SQLite data files)
artifacts/    Large filesystem artifacts (evidence, traces, reports)
```

## Dependency rules

1. Experience contains no domain/business logic and does not skip control.
2. Only control changes run state (coordinator implementation is a later phase).
3. Capabilities never import experience or concrete adapters.
4. Adapters implement ports and do not depend upward on control or capabilities.
5. Only `adapters/sqlite` may use SQLite drivers or be imported for persistence IO.
6. `model/` stays pure: no filesystem, network, or adapter imports.
7. Core layers (`experience`, `control`, `capabilities`, `ports`, `adapters`, `model`) do not import `domain/`.

## Mechanical enforcement

Import boundaries are checked with **dependency-cruiser** (`npm run check:boundaries`).

A deliberate illegal import lives at:

`src/capabilities/__boundary-fixtures__/illegal-imports-adapter.ts`

It is excluded from the main boundary scan but must fail when included (see `tests/unit/boundary-violation.test.ts`).

## ADRs

Significant boundary or contract changes are recorded under `docs/adr/`.
