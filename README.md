# ScoutAI

Intelligent QA discovery and automation platform — **P0.1 repository foundation**.

## Prerequisites

- Node.js **22** LTS (see `.nvmrc`)

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

- `docs/ARCHITECTURE.md` — layers and rules
- `docs/OSS_REUSE.md` — toolchain and reuse policy
- `SCOUTAI_FINAL_WORK_BUILD_GUIDE.md` — locked architecture and phases

## Status

P0.1 provides TypeScript strict mode, Vitest, Playwright Test, Zod, and mechanical import boundaries. No crawler, database, UI, or LLM code yet.
