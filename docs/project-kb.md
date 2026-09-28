# ScoutAI project knowledge base (summary)

Full build contract: **`docs/final-work-build-guide.md`**.

Operational log: **`docs/worklog.md`**.

## Product (one line)

ScoutAI continuously observes a real application, proposes QA flows/scenarios for SME review, automates approved coverage with Playwright, executes tests with evidence, and re-discovers changes.

## Locked architecture

- **Experience** → **Control** → **Capabilities** → **Ports**; **Adapters** implement ports.
- LLM reasons/proposes; deterministic code crawls/executes/persists; SME approves business meaning.
- Domain packs (`src/domain/`) sit beside the reusable core and are **not** imported by core layers.

## Enforcement

`npm run check:boundaries` — see `docs/architecture.md`.

## Method

One proven piece at a time per `docs/final-work-build-guide.md`. Do not skip ahead unproven phases.
