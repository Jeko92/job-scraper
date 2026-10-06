# JobScraper

AI-assisted job sourcing for Job Seekers, built by a neuefische bootcamp team.
See the [roadmap](doc/roadmap.md) and the [MVP scope](doc/mvp.md).

## Quickstart

Requires Node 24 (`nvm use`) and pnpm 11 (version pinned in `package.json`).

```bash
pnpm install
pnpm dev        # frontend http://localhost:3000, backend http://localhost:3030
```

## Layout

```text
apps/backend    NestJS API - all business logic
apps/frontend   Next.js UI - thin layer over the backend
packages/       shared tsconfig, eslint, prettier config and shared code
doc/            roadmap, MVP, ADRs, specs
```

## Scripts

`pnpm check` (lint, typecheck, test, format) · `pnpm build` ·
`pnpm format:write` · `pnpm dev:apps` (dev servers via concurrently)

Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
