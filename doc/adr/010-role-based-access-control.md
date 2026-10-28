# ADR-010: Role-based access control with a role column and the JWT

* Status: accepted

## Decision

* Every user has one role: `user` (default) or `admin`, stored in a new
  `users.role` column.
* The role is signed into the JWT and read back into `req.user.role`.
* A `@Roles(...)` decorator marks routes, and a global `RolesGuard` (after
  `JwtAuthGuard`) returns `403` when the role does not match. Routes without
  `@Roles` stay open to every logged-in user.
* Admin only: creating, updating, deleting and crawling jobs, and creating,
  fetching and refreshing companies.
* Every logged-in user: viewing jobs and companies, and adding jobs or
  removing them from their own favorites (`users/me/save-jobs`).
* Sign-up always creates a `user`. Admins are promoted directly in the
  database.

## Options Considered

* A `roles` table with a many-to-many relation: more flexible, but more than
  two fixed roles need.
* Loading the role from the database on every request: role changes apply
  at once, but every request costs a query.
* Checking ownership per record: there is no owner on jobs or companies.

## Rationale

Two fixed roles fit one column. The role in the JWT avoids a query per
request, and a global guard with a decorator follows the existing
`@Public()` pattern.

## Consequences

* A role change applies only after the user logs in again; tokens issued
  before this change have no role and need a new login.
* The frontend can read the role (via `packages/shared`) to hide admin
  actions, but the backend stays the only check.

## Notes

* Code: `apps/backend/src/auth/`, `apps/backend/src/common/decorators/`
