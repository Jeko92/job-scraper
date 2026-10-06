# Contributing

## Branches

- `main`: protected; changes only via release PRs from `develop`.
- `develop`: integration branch; changes via PRs from `feature/<topic>` and
  `fix/<topic>`.
- Feature and fix branches are kept after merging (their commit history stays).

## Pull requests

- Into `develop`: default PR template, **squash merge**, 3 approvals.
- Into `main` (release): `gh pr create --base main --head develop --template release.md`,
  title `chore(release): promote develop to main`, **merge commit**, 3 approvals.
- Before a release, merge `main` into `develop` via a PR
  (`chore(repo): merge main into develop`, merge commit) so the release PR has
  no conflicts.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`.
Types and scopes: [`.conventionalcommit.json`](.conventionalcommit.json).
PR titles are linted in CI. Pairing? See
[`.conventionalcommit.coauthors`](.conventionalcommit.coauthors).

## Checks

The pre-commit hook formats and lints staged files. CI runs the full
`check` + `build` on release PRs into `main`; run `pnpm check` before
opening any PR.
