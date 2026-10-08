# Contributing

## Branches

Decided in [ADR-006](doc/adr/006-git-workflow-open-develop.md).

- `main`: protected; changes only via release PRs from `develop`.
- `develop`: integration branch. Commit to it directly or merge a PR from a
  work branch; PR titles must pass the title lint. Never force push it.
- Work branches start from `develop`:
  - `feature/<topic>`: new functionality
  - `fix/<topic>`: bug fixes
  - `doc/<topic>`: documentation only
- Work branches are kept after merging (their commit history stays).

## Pull requests

- Reviews: [`.github/CODEOWNERS`](.github/CODEOWNERS) requests a review from
  the other three team members on every PR. **1 approval** is required to
  merge; the other reviews are optional.
- Into `develop`: default PR template, **squash merge**.
- Into `main` (release): `gh pr create --base main --head develop --template release.md`,
  title `chore(release): promote develop to main`, **merge commit**.
- Before a release, merge `main` into `develop`
  (`chore(repo): merge main into develop`, merge commit) so the release PR has
  no conflicts. This can be done directly on `develop`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`.
Types and scopes: [`.conventionalcommit.json`](.conventionalcommit.json).
PR titles are linted in CI. Pairing? See
[`.conventionalcommit.coauthors`](.conventionalcommit.coauthors).

## Checks

The pre-commit hook formats and lints staged files. CI runs the full
`check` + `build` on release PRs into `main`; run `pnpm check` before
every push to `develop` and before opening any PR.
