# ADR-006: Git workflow, reviews and CI

* Status: accepted

## Decision

* `feature/*` and `fix/*` branch from `develop` and are **squash merged**
  back into it.
* `develop` is promoted to `main` through a release PR with a **merge
  commit**. Before that, `main` is merged into `develop`.
* Every PR needs 3 approvals (the whole team).
* Commits and PR titles follow Conventional Commits; CI lints PR titles.
* The full CI check (format, lint, typecheck, test, build) runs on release
  PRs into `main`. Developers run `pnpm check` locally before every PR.
* Branch rules live in `.github/rulesets/` so they are reviewed like code.

## Options Considered

* Trunk-based development / GitHub Flow (one `main`): simpler, but no
  integration branch between feature work and a stable `main`.
* Fewer approvals: faster merges, but parts of the code would be known by
  only one person.
* Full CI on every PR: slower feature PRs for a small team that already runs
  `pnpm check` locally.

## Rationale

* Everyone knows all code: in a four-person bootcamp team, every member
  reviews every change.
* Feature PRs stay fast; the release PR into `main` is the quality gate.
* Clean history: one squashed commit per feature on `develop`, one merge
  commit per release on `main`.

## Consequences

* A PR waits until all three members have reviewed it.
* A broken build can reach `develop` and is only caught by CI at release
  time; running `pnpm check` before opening a PR is mandatory.
* Feature branches are kept after merging so their full commit history stays
  available.
