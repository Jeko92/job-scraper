# ADR-005: Strict TypeScript, ESM and shared tooling baseline

* Status: accepted

## Decision

All packages share one code quality baseline:

* TypeScript with every strict flag in `packages/tsconfig/base.json`
  (including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`).
  Packages extend it and never relax a flag.
* ESM everywhere (`"type": "module"`). Backend relative imports end in `.js`.
* ESLint with typescript-eslint `strictTypeChecked` and
  `stylisticTypeChecked` from `packages/eslint-config` (base, `nestjs` and
  `nextjs` presets).
* Prettier formats, ESLint lints: `eslint-config-prettier`, no
  `eslint-plugin-prettier`.
* Vitest is the test runner in every package, including the NestJS backend.

## Options Considered

* Default framework settings (NestJS CLI, create-next-app): each app would
  end up with different, looser rules.
* CommonJS for the backend (NestJS default): two module systems in one repo.
* Jest (NestJS default): a second test runner with its own config and
  ESM/TypeScript setup.

## Rationale

Strict types catch bugs at compile time, especially around missing values
and API responses. One module system, one lint setup and one test runner
mean a developer can move between packages without relearning the tooling.
Keeping Prettier out of ESLint keeps linting fast and avoids rule conflicts.

## Consequences

* More type errors and lint findings up front, especially for newcomers to
  strict TypeScript.
* Some tools lag behind: ESLint stays on v9 until the Next.js plugins support
  v10.
* Rule changes happen in the shared packages, never per app.
