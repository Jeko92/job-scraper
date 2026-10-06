# ADR-003: pnpm + Turborepo monorepo

* Status: accepted

## Decision

Backend, frontend and shared code live in one repository. pnpm workspaces
link the packages; Turborepo runs tasks across them.

* `apps/*`: runnable apps (`backend`, `frontend`).
* `packages/*`: libraries used by the apps (`shared`, `tsconfig`,
  `eslint-config`, `prettier-config`).
* Every package is named `@job-scraper/<name>` and depends on others via
  `workspace:*`.
* Node and pnpm versions are pinned (`.nvmrc`, `packageManager`).

## Options Considered

* Separate repositories for frontend and backend: a change to the shared API
  types would need coordinated PRs and version bumps across repos.
* npm or Yarn workspaces: looser `node_modules`, fewer supply-chain controls.
* Nx: more features than we need, steeper learning curve.
* pnpm without Turborepo: we would have to order builds and skip unchanged
  work by hand.

## Rationale

* One PR can change backend, frontend and the shared types together.
* pnpm installs are fast and strict: a package can only import what it
  declares. `allowBuilds` blocks dependency install scripts by default, and
  pnpm's minimum release age keeps freshly published versions out.
* Turborepo builds `packages/shared` before its dependents (`^build`) and
  caches lint, typecheck, test and build results.

## Consequences

* `packages/shared` must be built before the apps can run, lint or typecheck;
  `pnpm dev` and the pre-commit hook build it first.
* Run single-package tasks through Turborepo
  (`pnpm turbo run <task> --filter=@job-scraper/<name>`) so dependencies are
  built.
* New dependencies that need install scripts must be allowed explicitly in
  `pnpm-workspace.yaml`.
