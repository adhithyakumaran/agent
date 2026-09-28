# Open source reuse

ScoutAI follows **open source first** (see `docs/final-work-build-guide.md` §3.3).  
Living change log for tooling: `docs/worklog.md`.

## Toolchain (what we use and why)

| Package | Version (lockfile) | Role in ScoutAI |
|---------|-------------------|-----------------|
| [TypeScript](https://www.typescriptlang.org/) | see `package-lock.json` | Strict typing across all layers |
| [Node.js](https://nodejs.org/) | 24 LTS (`.nvmrc`) | Runtime |
| [Vitest](https://vitest.dev/) | see lockfile | Fast unit tests |
| [@playwright/test](https://playwright.dev/) | see lockfile | Browser automation and e2e smoke (full runtime in P0.2+) |
| [Zod](https://zod.dev/) | see lockfile | Pure model schemas in `src/model/` |
| [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) | see lockfile | Mechanical layer import boundaries |

Licenses: verify in `node_modules/<pkg>/package.json` before release; record material adoptions below.

## Adoption checklist

1. Repository and exact version/commit.
2. License compatibility.
3. What was copied vs adapted.
4. Required notices in `docs/` when applicable.
5. Entry in `docs/worklog.md` for each phase that adds dependencies.

## Phase adoptions

| Phase | Adoption | Notes |
|-------|----------|-------|
| P0.1 | Playwright Test, Vitest, Zod, dependency-cruiser | Foundation only; no crawler/LLM yet |

Future references (Stagehand, etc.) stay **documentation-only** until their phase and an row is added here.
