# ADR-006: Git workflow with an open develop branch

* Status: accepted
* Supersedes: [ADR-005](005-git-workflow-and-reviews.md)

## Decision

* Everyone can commit and push directly to `develop`. PRs into `develop` are
  optional; all other members are requested as reviewers, and one approval
  plus a passing `lint-pr-title` is enough to merge. The write and admin
  roles bypass both rules on direct pushes.
* Work branches start from `develop` as `feature/*`, `fix/*` or `doc/*`
  (documentation only) and are squash merged.
* Everything else from ADR-005 still applies: CODEOWNERS review requests,
  Conventional Commits, CI and release PRs into `main`.

## Options Considered

* Keep ADR-005: every change, even a one-line fix, waits for an approval.
* Require `lint-pr-title` without a bypass: it only runs on PRs, so it would
  also block every direct push.
* No `develop` ruleset: a failing PR title would not block the merge.

## Rationale

Small changes land without waiting for a reviewer, which keeps the team moving
during the short coding phase. The release PR into `main` stays the quality
gate.

## Consequences

* Direct commits skip review and the title lint, so run `pnpm check` before
  every push and still follow Conventional Commits.
* Nothing stops a force push or deletion of `develop`: never force push it.
