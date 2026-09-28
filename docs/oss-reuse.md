# Open source reuse

ScoutAI follows **open source first** (see `docs/final-work-build-guide.md` §3.3).  
Living change log for tooling: `docs/worklog.md`.

## Toolchain (what we use and why)

| Package | Version (lockfile) | Role in ScoutAI |
|---------|-------------------|-----------------|
| [TypeScript](https://www.typescriptlang.org/) | see `package-lock.json` | Strict typing across all layers |
| [Node.js](https://nodejs.org/) | 24 LTS (`.nvmrc`) | Runtime |
| [Vitest](https://vitest.dev/) | see lockfile | Fast unit tests |
| [@playwright/test](https://playwright.dev/) | see lockfile | Browser automation, auth `storageState`, evidence (screenshot/video/trace), HTML report |
| [dotenv](https://github.com/motdotla/dotenv) | see lockfile | Load `.env` for Playwright config and tests (not committed) |
| [Zod](https://zod.dev/) | see lockfile | Pure model schemas in `src/model/` |
| [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) | see lockfile | Mechanical layer import boundaries |

Licenses: verify in `node_modules/<pkg>/package.json` before release; record material adoptions below.

## Playwright (P0.2) — native features in use

| Feature | ScoutAI usage |
|---------|----------------|
| **Test fixtures / `test.extend()`** | `tests/e2e/fixtures/scoutai-test.ts` |
| **Setup project + dependencies** | `auth.setup.ts` → `chromium-authenticated` project |
| **`storageState`** | Saved under `SCOUTAI_STORAGE_STATE_PATH` (gitignored) |
| **Screenshots** | Config + explicit `page.screenshot()` in proof test |
| **Video** | `video: 'on'` on authenticated project |
| **Trace** | `trace: 'on'` on authenticated project; `show-trace` CLI |
| **HTML reporter** | `playwright-report/` via config |
| **`webServer`** | Starts stand-in auth app for local proof |

We do **not** implement custom browser managers, tracers, or reporters.

## Adoption checklist

1. Repository and exact version/commit.
2. License compatibility.
3. What was copied vs adapted.
4. Required notices in `docs/` when applicable.
5. Entry in `docs/worklog.md` for each phase that adds dependencies.

## Phase adoptions

| Phase | Adoption | Notes |
|-------|----------|-------|
| P0.1 | Playwright Test, Vitest, Zod, dependency-cruiser | Foundation only |
| P0.2 | Playwright fixtures, storageState, evidence, HTML report; dotenv | E2e harness only; no `src/adapters/playwright` yet |

Future references (Stagehand, Playwright Test Agents, MCP) stay **documentation-only** until their phase.
