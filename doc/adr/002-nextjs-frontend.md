# ADR-002: Next.js frontend as a thin layer over the NestJS backend

* Status: proposed

## Decision

`apps/frontend` uses Next.js (App Router). Its server side only calls the
NestJS backend and shapes data for pages. Business logic, persistence,
scraping and authentication live in `apps/backend`.

## Options Considered

* React + Vite single-page app: simpler, but routing, layouts and server
  rendering would need extra libraries.
* Next.js route handlers as the main backend: rejected, it would split the
  domain logic across two servers.

## Rationale

Next.js brings file-based routing and layouts out of the box. Server
Components call the backend server-to-server, so the backend URL stays
private and the backend needs no CORS setup for now. One backend keeps the
domain logic in one place.

## Consequences

* Two Node servers in development; `pnpm dev` starts both.
* Review rule: Next.js route handlers and server actions only forward to the
  backend.
* Browser-side calls to the backend will need either a Next.js proxy route or
  CORS on the backend (separate decision).
