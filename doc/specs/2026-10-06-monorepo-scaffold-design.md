# Monorepo scaffold — design

* Date: 2026-10-06
* Status: draft (awaiting team review)

## Goal

pnpm + Turborepo monorepo for the JobScraper MVP (see [`../mvp.md`](../mvp.md)):
a strict, shared tooling base, a NestJS backend and a Next.js frontend that
start together from the root. Docs start thin and grow incrementally.

## Layout

```text
.claude/{agents,skills}/.gitkeep
.githooks/pre-commit          # pnpm exec lint-staged
.github/                      # templates, workflows, rulesets
apps/backend                  # @job-scraper/backend   NestJS 12 (ESM), :3030
apps/frontend                 # @job-scraper/frontend  Next.js 16 App Router, :3000
packages/eslint-config        # @job-scraper/eslint-config  (., ./nestjs, ./nextjs)
packages/prettier-config      # @job-scraper/prettier-config
packages/tsconfig             # @job-scraper/tsconfig  (base.json only)
packages/shared               # @job-scraper/shared    types + utils for both apps
doc/                          # existing docs, ADRs, specs
```

Root: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `eslint.config.mjs`,
`.editorconfig`, `.gitignore`, `.nvmrc`, `.prettierrc`,
`.prettierignore`, `.conventionalcommit.json`, `.conventionalcommit.coauthors`,
`README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`),
`LICENSE` (MIT, JobScraper contributors).

## Tooling

* Node 24, pnpm 11.25, TypeScript 6, Turborepo.
* `tsconfig/base.json`: full strict set (incl. `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`). Each
  package's own `tsconfig.json` extends it; no strict flag is relaxed.
* ESLint 9 (Next's plugins don't support 10 yet): typescript-eslint `strictTypeChecked` + `stylisticTypeChecked`,
  `simple-import-sort`, `eslint-config-prettier`. No `eslint-plugin-prettier`.
* Whole repo is ESM. `shared`: built with tsdown to ESM + types.
* Vitest in every package that has tests.
* `pnpm dev` = `turbo run dev`; `pnpm dev:apps` = concurrently.
* Pre-commit: lint-staged (prettier + eslint --fix). No commit-msg hook.

## Apps

* Backend: `GET /` → `{ "message": "hello from backend" }` (`HelloResponse`
  from `shared`). Env validated with `@nestjs/config` + zod. Vitest unit + e2e.
  No CORS (only the Next.js server calls it).
* Frontend: Tailwind v4 + shadcn/ui. Home page shows "hello from frontend" and
  the backend message, fetched server-side from `BACKEND_URL`. Next.js stays a
  thin BFF; business logic lives in NestJS ([ADR-002](../adr/002-nextjs-frontend.md)).
  Vitest + Testing Library.

## Git flow & GitHub

* `feature/*`, `fix/*` → `develop` (squash, branches kept);
  `develop` → `main` (merge commit) after merging `main` into `develop`.
* Rulesets: `main` — PR, 3 approvals, merge only, required checks `check` +
  `lint-pr-title`; `develop` — PR, 3 approvals, squash + merge, required check
  `lint-pr-title`.
* CI: PR-title lint on PRs to `develop` and `main`; full check
  (lint, typecheck, format, test, build, source must be `develop`) on PRs to `main`.
* Templates: default PR (→ `develop`), `release.md` PR (→ `main`), one issue template.
* Repo linked to GitHub Project #7; nothing else configured on the board.

## Out of scope

Database, auth, scraping, Docker, deployment.
