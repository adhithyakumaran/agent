# ScoutAI

Intelligent QA discovery and automation platform.

## Prerequisites

- Node.js **24** LTS (see `.nvmrc`)

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # edit credentials if needed; never commit .env
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Strict TypeScript check |
| `npm run check:boundaries` | Layer import rules (dependency-cruiser) |
| `npm run check` | Typecheck + boundaries |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:boundaries` | Illegal-import proof test |
| `npm run test:e2e` | Playwright smoke + P0.2 proof (headless when `CI` is set) |
| `npm run test:e2e:proof` | **P0.2 headed proof** (visible Chromium, full artifacts) |
| `npm run test` | All of the above |

After e2e:

```bash
npx playwright show-report playwright-report
```

## Environment

See `.env.example` for `SCOUTAI_BASE_URL`, credentials, and `SCOUTAI_STORAGE_STATE_PATH`.

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/architecture.md` | Layers and dependency rules |
| `docs/oss-reuse.md` | Open-source toolchain and Playwright features |
| `docs/worklog.md` | Phase-by-phase change log |
| `docs/project-kb.md` | Short project KB |
| `docs/final-work-build-guide.md` | Locked architecture and phases |

## Status

- **P0.1:** TypeScript strict, Vitest, dependency-cruiser, layer boundaries.
- **P0.2:** Playwright authenticated session proof (stand-in login), `storageState`, screenshot/video/trace/HTML report.

No crawler, coordinator, sqlite, or LLM in repo yet.
