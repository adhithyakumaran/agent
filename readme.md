# ScoutAI

Intelligent QA discovery and automation platform — **P0.1 repository foundation**.

## Prerequisites

- Node.js **24** LTS (see `.nvmrc`)

## Setup

```bash
npm install
npx playwright install chromium
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Strict TypeScript check |
| `npm run check:boundaries` | Layer import rules (dependency-cruiser) |
| `npm run check` | Typecheck + boundaries |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:boundaries` | Illegal-import proof test |
| `npm run test:e2e` | Playwright smoke test |
| `npm run test` | All of the above |

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/architecture.md` | Layers and dependency rules |
| `docs/oss-reuse.md` | Open-source toolchain and adoption |
| `docs/worklog.md` | Phase-by-phase change log (update every piece) |
| `docs/project-kb.md` | Short project KB |
| `docs/final-work-build-guide.md` | Locked architecture and phases |

## Status

P0.1: TypeScript strict mode, Vitest, Playwright Test, Zod, dependency-cruiser boundaries. No crawler, database, UI, or LLM yet.
