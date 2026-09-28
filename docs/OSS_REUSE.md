# Open Source Reuse

ScoutAI follows **open source first** (see build guide §3.3).

## P0.1 toolchain

| Need | Choice | License (verify at install time) |
|------|--------|----------------------------------|
| Browser automation (later phases) | Playwright Test | Apache-2.0 |
| Unit tests | Vitest | MIT |
| Schema validation | Zod | MIT |
| Import boundaries | dependency-cruiser | MIT |
| Language | TypeScript | Apache-2.0 |

## Adoption checklist

For every non-trivial adoption or copy:

1. Record repository and exact version/commit.
2. Record license and compatibility with this project.
3. Document what was copied vs adapted.
4. Preserve required notices in `docs/` when applicable.
5. Do not assume the repo root license applies to every dependency.

## Reference sources (future phases)

The build guide lists Playwright, Stagehand, and other references for discovery, realtime UX, and healing. **Do not import them until the relevant phase** and this file is updated with version and attribution.
