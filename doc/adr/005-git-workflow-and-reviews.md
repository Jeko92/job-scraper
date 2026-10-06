# ADR-005: Git workflow, reviews and CI

* Status: accepted

## Decision

* `feature/*` and `fix/*` branch from `develop` and are **squash merged**
  back into it.
* `develop` is promoted to `main` through a release PR with a **merge
  commit**. Before that, `main` is merged into `develop`.
* `.github/CODEOWNERS` lists all four members, so GitHub requests a review
  from the other three on every PR. One approval is required to merge; the
  other two reviews are optional.
* Commits and PR titles follow Conventional Commits; CI lints PR titles.
* The full CI check (format, lint, typecheck, test, build) runs on release
  PRs into `main`. Developers run `pnpm check` locally before every PR.
* Branch rules live in `.github/rulesets/` so they are reviewed like code.

## Options Considered

* Trunk-based development / GitHub Flow (one `main`): simpler, but no
  integration branch between feature work and a stable `main`.
* Approval from all three reviewers: everyone knows all code, but one absent
  member blocks every merge.
* One approval without auto-requested reviewers: fast, but the other members
  would not even see most PRs.
* Full CI on every PR: slower feature PRs for a small team that already runs
  `pnpm check` locally.

## Rationale

* Everyone sees all code: in a four-person bootcamp team, every PR is sent
  to all other members, while one approval keeps PRs from waiting on the
  slowest reviewer.
* Feature PRs stay fast; the release PR into `main` is the quality gate.
* Clean history: one squashed commit per feature on `develop`, one merge
  commit per release on `main`.

## Consequences

* A PR can merge after one approval, even if the other reviewers have not
  looked yet. A "request changes" review still blocks merging until it is
  resolved.
* New team members must be added to `.github/CODEOWNERS`.
* A broken build can reach `develop` and is only caught by CI at release
  time; running `pnpm check` before opening a PR is mandatory.
* Feature branches are kept after merging so their full commit history stays
  available.
