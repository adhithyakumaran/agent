# ScoutAI work log

Ongoing record of phases, code changes, and open-source usage. Update this file whenever behavior, dependencies, or boundaries change.

## Naming convention (repo hygiene)

- All tracked **folders and files** use **lowercase** names.
- Use **hyphens** for multi-word names (no underscores).
- Long-form guides live under `docs/`.

---

## P0.1 — repository foundation and guardrails

**Status:** complete  
**Node:** 24 LTS (see `.nvmrc`)

### Delivered

- Strict TypeScript project under `src/` with layers: `experience`, `control`, `capabilities`, `ports`, `adapters`, `model`, `domain`, `data`, `artifacts`.
- Mechanical boundaries via `dependency-cruiser` (`npm run check:boundaries`).
- Illegal-import proof: `src/capabilities/boundary-fixtures/illegal-imports-adapter.ts` + `tests/unit/boundary-violation.test.ts`.
- Smoke tests: `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`.

### Open source added

See `docs/oss-reuse.md` (TypeScript, Vitest, Playwright Test, Zod, dependency-cruiser).

### Not in scope

Crawler, sqlite driver, UI, LLM, coordinator, SSE, domain packs implementation.

---

## P0.1 follow-up — Node 24 LTS alignment

**Status:** complete

- `.nvmrc` → `24`
- `package.json` `engines.node` → `>=24.0.0`
- Verified: `build`, `check:boundaries`, `test:unit`, `test:boundaries`, `test:e2e` on Node 24.x.

---

## Repo cleanup and GitHub publish

**Status:** complete (this entry)

- Renamed docs to lowercase paths (`docs/architecture.md`, `docs/project-kb.md`, etc.).
- Renamed boundary fixture folder to `boundary-fixtures` (no underscores).
- Removed duplicate `uploads/` copy of the build guide.
- Remote target: `https://github.com/adhithyakumaran/agent.git` branch `main`.
