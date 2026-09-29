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

**Status:** complete

- Renamed docs to lowercase paths (`docs/architecture.md`, `docs/project-kb.md`, etc.).
- Renamed boundary fixture folder to `boundary-fixtures` (no underscores).
- Removed duplicate `uploads/` copy of the build guide.
- Remote target: `https://github.com/adhithyakumaran/agent.git` branch `main`.

---

## P0.2 — Playwright runtime foundation

**Status:** complete

### Delivered

- Playwright **setup project** (`tests/e2e/auth.setup.ts`) logs in once and writes `storageState` to a gitignored path.
- Deterministic **stand-in auth target** (`tests/e2e/standin/`) started via `webServer` in `playwright.config.ts`.
- Reusable **`test.extend()`** fixture (`tests/e2e/fixtures/scoutai-test.ts`) for authenticated tests without re-login.
- **Runtime proof** (`tests/e2e/runtime-proof.spec.ts`): reuse session → screenshot; trace/video/report via Playwright config.
- Env contract: `.env.example` (`SCOUTAI_BASE_URL`, credentials, `SCOUTAI_STORAGE_STATE_PATH`).
- `npm run test:e2e:proof` runs headed authenticated proof.

### Playwright features used directly (not reimplemented)

Fixtures, project dependencies, `storageState`, screenshots, video, trace, HTML reporter, `webServer`, Chromium launch/teardown.

### ScoutAI-specific glue only

- `tests/e2e/helpers/scoutai-env.ts` — env loading
- `tests/e2e/standin/server.mjs` — minimal login/app for proof (replaced by real app URL later)
- Fixture + setup + proof spec wiring

### Not in scope

`src/ports/browser.ts`, `src/adapters/playwright/*`, crawler, coordinator, sqlite, LLM, custom reporters/tracers.

### Proof command

```bash
cp .env.example .env   # first time
npm run test:e2e:proof
npx playwright show-report playwright-report
```

### P0.2 cleanup — cross-platform `test:e2e:proof` script

**Status:** complete

- `package.json` `test:e2e:proof` now uses Playwright’s `--headed` flag only (no Unix `SCOUTAI_HEADED=1` prefix), so the same command works on Windows, macOS, and Linux.
- No new dependencies; Playwright runtime behavior unchanged.
