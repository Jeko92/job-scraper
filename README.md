# JobScraper

AI-assisted job sourcing for Job Seekers, built by a neuefische bootcamp team.
See the [roadmap](doc/roadmap.md) and the [MVP scope](doc/mvp.md).

## Quickstart

Requires Node 24 (`nvm use`), pnpm 11 (version pinned in `package.json`) and
Docker.

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env    # set JWT_SECRET: openssl rand -base64 32
cp apps/frontend/.env.example apps/frontend/.env
docker compose -f apps/backend/compose.yaml up -d # Postgres on localhost:5433
pnpm --filter @job-scraper/backend migration:run
pnpm dev        # frontend http://localhost:3000, backend http://localhost:3030
```

Create an account at http://localhost:3000/register or use `POST /auth/register`
(NOTE: when inserting users with plain SQL, `passwordHash` must hold a bcrypt hash).

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

Database (from `apps/backend`): `pnpm migration:generate src/db/migrations/<Name>` ·
`pnpm migration:run` · `pnpm migration:revert`

Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
