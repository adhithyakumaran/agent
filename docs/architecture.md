# ScoutAI architecture

Architecture is **locked** per `docs/final-work-build-guide.md`. This document summarizes layer boundaries enforced from P0.1 onward.

## Layers

```text
experience/   API, UI, CLI triggers (no business logic)
    ↓
control/      Run coordinator — sole owner of run-state transitions
    ↓
capabilities/ Focused deterministic modules (discovery, execution, …)
    ↓
ports/        Small abstraction contracts (browser, store, llm, …)

adapters/     Implement ports (playwright, sqlite, filesystem, …)
model/        Pure schemas and types — no IO
domain/       Domain packs (apex, endless aisle) — not imported by core
data/         Durable structured storage paths (sqlite data files)
artifacts/    Large filesystem artifacts (evidence, traces, reports)
```

## Dependency rules

1. Experience contains no domain/business logic and does not skip control.
2. Only control changes run state (coordinator implementation is a later phase).
3. Capabilities never import experience or concrete adapters.
4. Adapters implement ports and do not depend upward on control or capabilities.
5. Only `adapters/sqlite` may use sqlite drivers or be imported for persistence IO.
6. `model/` stays pure: no filesystem, network, or adapter imports.
7. Core layers do not import `domain/`.

## Mechanical enforcement

Import boundaries: **dependency-cruiser** (`npm run check:boundaries`). Config: `.dependency-cruiser.cjs`.

Deliberate illegal import (proof only):

`src/capabilities/boundary-fixtures/illegal-imports-adapter.ts`

Excluded from the main scan; must fail when included — see `tests/unit/boundary-violation.test.ts`.

## ADRs

Significant contract changes: `docs/adr/` (see `docs/adr/readme.md`).
