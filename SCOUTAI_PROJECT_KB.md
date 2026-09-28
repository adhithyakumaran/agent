# ScoutAI Project Knowledge Base (summary)

Full build contract: **`SCOUTAI_FINAL_WORK_BUILD_GUIDE.md`** (also under `uploads/`).

## Product (one line)

ScoutAI continuously observes a real application, proposes QA flows/scenarios for SME review, automates approved coverage with Playwright, executes tests with evidence, and re-discovers changes.

## Locked architecture (P0.1 foundation)

- **Experience** → **Control** → **Capabilities** → **Ports**; **Adapters** implement ports.
- LLM reasons/proposes; deterministic code crawls/executes/persists; SME approves business meaning.
- Domain packs (`domain/`) sit beside the reusable core and are **not** imported by core layers.
- SQLite for structured state; filesystem for large artifacts (later phases).

## Repository layout (P0.1)

`src/experience`, `src/control`, `src/capabilities`, `src/ports`, `src/adapters`, `src/model`, `src/domain`, `src/data`, `src/artifacts`.

## Enforcement

`npm run check:boundaries` (dependency-cruiser). See `docs/ARCHITECTURE.md`.

## Implementation method

One proven piece at a time per the build guide phase list. **P0.1 is repository foundation only.**
