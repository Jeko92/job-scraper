# JobScraper MVP — kanban backlog plan

> Untracked working file — not versioned in git.

## Context

The monorepo scaffold is done: pnpm + Turborepo, NestJS 12 backend (`:3030`),
Next.js 16 frontend (`:3000`, Tailwind 4 + shadcn), `@job-scraper/shared`,
strict TS / ESLint / Vitest, git flow (`feature/*` → `develop` → `main`), CI,
CODEOWNERS with 1 required approval. GitHub Project #7 is linked but empty.
Database, auth, scraping and deployment were explicitly out of scope so far.

`doc/mvp.md` (non-negotiable scope): landing page · register · login + protected
routes + profile edit · onboarding after first login · ≥1 successful crawl of
company websites with persisted company meta-info and inferred job info ·
list of only-suitable jobs with a clickable detail view.

Goal of this plan: a flat backlog of small cards that 4 full-stack developers
can pull from a shared backlog and work on asynchronously during 2 weeks of
coding, each card naming its blockers. Details of each card are refined later
on the board.

## Decisions (from the interview)

| Topic | Decision |
|---|---|
| Timeline | 2 weeks of coding, full `mvp.md` scope |
| Work split | Shared backlog, no owners; everyone full-stack |
| Hosting | Backend → Render web service + Render Postgres; frontend → Vercel |
| Local DB | Shared external Render Postgres URL, provided via env vars |
| ORM | TypeORM (`@nestjs/typeorm`) with migrations |
| Auth | NestJS hashes passwords + issues JWT → Next.js keeps it in an httpOnly cookie and forwards it as Bearer |
| Crawling | Crawlee + LLM extraction |
| LLM | OpenAI inside the app; Anthropic/Claude only as coding assistant |
| Board | Columns Backlog → Ready → In progress → In review → Done; flat issues, milestones + labels, sub-issues only if strictly needed |
| Card content | Title, goal, blockers — everything else is added in refinement |
| Deferred to refinement | Onboarding fields, definition of "suitable job", where crawl targets come from, how a crawl is triggered |

**My assumptions — please correct if wrong:**
- Each developer gets their own Postgres **schema** inside the shared Render DB
  (`DB_SCHEMA` env), so four people's migrations never collide.
- **Contract-first:** request/response zod schemas live in `@job-scraper/shared`.
  Once a contract card is merged, frontend and backend cards for it run in parallel.
- Deploys come from `main`, so do a release PR (`develop` → `main`) at least at the
  end of week 1 and before the demo.

## How to read the cards

- **Blocked by** = cards that must be merged into `develop` before you start.
- **(e2e: X)** = you can start and build against the shared contract with mocked
  data; only the final end-to-end check waits for X.
- IDs (F1, A3, …) are placeholders. Replace them with issue numbers when you create the
  issues, and use GitHub's "Blocked by" issue relationship where possible.

## Backlog

### M0 — Foundations

| ID | Title | Goal | Blocked by |
|---|---|---|---|
| F1 | Backend database layer (TypeORM) | Add TypeORM + `pg` to the backend, connect via validated env (`DATABASE_URL`, `DB_SCHEMA`), `synchronize` off, ESM-compatible migration generate/run/revert scripts, documented in README | F2 |
| F2 | Shared dev database on Render | Provision the Render Postgres, set up one schema per developer, share credentials securely (not in git), `.env.example` + README "local setup" | — |
| F3 | Shared API contract pattern | zod in `@job-scraper/shared` for request/response schemas + inferred types; backend validates requests with them; one consistent error response shape; convert the hello endpoint as the reference example | — |
| F4 | Frontend app shell + UI base | Route groups for public vs. logged-in pages, header/nav, base shadcn components (button, input, form, card) and one form pattern everyone reuses | — |
| F5 | Frontend server-side backend client | One typed helper for Server Components/actions that calls `BACKEND_URL`, attaches the auth token when present, parses responses with shared schemas and maps errors | F3 |
| F6 | ADRs for MVP stack decisions | Record ADRs for TypeORM + per-dev schemas, JWT-in-cookie auth, Crawlee + OpenAI extraction, Render/Vercel hosting | — |

### M1 — Accounts (auth, profile, onboarding)

| ID | Title | Goal | Blocked by |
|---|---|---|---|
| A1 | User entity + migration | Persist users with unique email and unique username, password hash, timestamps | F1 |
| A2 | Auth & profile contracts | Shared schemas for register, login, current user and profile update | F3 |
| A3 | Register endpoint | Users can sign up with username, email and password; password is hashed; duplicates are rejected clearly | A1, A2 |
| A4 | Login endpoint issuing JWT | Users log in with username/email + password and receive a signed, expiring JWT | A1, A2 |
| A5 | Auth guard + current user endpoint | Protected backend routes reject missing/invalid tokens; `GET /me` returns the logged-in user | A4 |
| A6 | Register page | Sign-up form with validation and backend error display, redirects on success | A2, F4, F5 (e2e: A3) |
| A7 | Login + logout with session cookie | Login form; JWT stored in an httpOnly secure cookie via server action; logout clears it | A2, F4, F5 (e2e: A4) |
| A8 | Protect logged-in routes in Next.js | Unauthenticated users are redirected to login (Next 16 `proxy.ts`); expired/invalid token → cookie cleared → login | A7 (e2e: A5) |
| A9 | Edit profile endpoint | Logged-in users can update their profile data | A5 |
| A10 | Profile page (view + edit) | Users see and edit their profile | A2, A8 (e2e: A9) |
| O1 | Onboarding data model | Store the onboarding answers per user, plus any option lists they pick from (seeded). *Refine: which fields* | A1 |
| O2 | Onboarding contracts | Shared schemas for onboarding answers, onboarding status and option lists | F3 (+ O1 field refinement) |
| O3 | Save onboarding endpoint | Backend saves the answers, marks onboarding complete and exposes the status (e.g. on `/me`) | O1, O2, A5 |
| O4 | Onboarding flow after first login | Users who haven't finished onboarding are sent to it before they can use the platform | O2, A8 (e2e: O3) |
| O5 | Edit onboarding answers in profile | Users can update their onboarding answers later ("profile grows") | O3, A10 |

### M2 — Crawling & extraction

| ID | Title | Goal | Blocked by |
|---|---|---|---|
| C1 | Company + job entities + migration | Persist companies (meta-info) and jobs (raw + inferred fields, source URL, first/last-seen timestamps, dedupe by URL) | F1 |
| C2 | Crawlee setup: collect job pages | Crawlee (Cheerio first) fetches a careers page and returns job-posting URLs + page text; polite limits; no DB, test with fixtures | — |
| C3 | OpenAI module | Nest module wrapping the OpenAI SDK: key/model from validated env, structured output validated by zod, a fake for tests | — |
| C4 | LLM job extraction | Job page text → structured job with inferred info, validated; fixture-based tests | C3 |
| C5 | LLM company extraction | Company pages → structured company meta-info, validated; fixture-based tests | C3 |
| C6 | Crawl pipeline | For one company: crawl → extract → upsert company + jobs, update timestamps, skip duplicates | C1, C2, C4 (C5 plugs in when merged) |
| C7 | Crawl trigger + target companies | A way to run the pipeline for the chosen companies. *Refine: where companies come from, how a crawl is triggered* | C6 |
| C8 | First successful crawl in production | Run the crawl against the deployed backend + production DB and confirm companies/jobs persisted (MVP proof) | C7, D2 |

### M3 — Jobs (matching + display)

| ID | Title | Goal | Blocked by |
|---|---|---|---|
| J1 | Jobs contracts | Shared schemas for job list items and job detail (with company) | F3 |
| J2 | Dev seed data | Script that loads realistic fixture companies/jobs so matching and UI don't wait for the crawler | C1 |
| J3 | Suitability rules | Implement + unit-test the user ↔ job suitability check, including tests proving unsuitable jobs are excluded. *Refine: definition of "suitable"* | O1, C1 |
| J4 | Suitable jobs list endpoint | Logged-in user gets only suitable jobs; e2e test proves an unsuitable job is never returned | J1, J3, A5 |
| J5 | Job detail endpoint | Returns position + company details for one job | J1, C1, A5 |
| J6 | Jobs list page | Shows the user's suitable jobs with empty/loading/error states; each item links to detail | J1, F5, A8 (e2e: J4) |
| J7 | Job detail page | Shows position and company details and a link to the original posting | J1, F5 (e2e: J5) |

### M4 — Launch (landing, deploy, demo)

| ID | Title | Goal | Blocked by |
|---|---|---|---|
| D1 | Backend on Render | Render web service builds shared + backend from the monorepo, listens on Render's `PORT`, env vars set, health check | — |
| D2 | Production DB + migrations on deploy | Production database configured on Render; migrations run automatically on deploy | F1, D1 |
| D3 | Frontend on Vercel | Vercel project for `apps/frontend` in the monorepo, `BACKEND_URL` → Render, PR previews | — (point at D1 once live) |
| L1 | Landing page | Static marketing page promoting the platform with CTAs to register/login | F4 |
| Q1 | MVP end-to-end check + demo script | On the deployed URLs: landing → register → login → onboarding → suitable jobs → detail → edit profile; fix list + demo checklist | A6, A10, O4, O5, J6, J7, C8, L1, D3 |

## Suggested pull order (waves)

Within a wave, pick any card in any order. Cards become Ready once their blockers are merged.

| Wave | Pullable cards | Why |
|---|---|---|
| 1 (day 1) | F2, F3, F4, F6, C2, C3, D1, D3, L1 | No blockers: 9 cards for 4 people. Do **F2 and F3 first**, because almost every other chain starts at F2 → F1 or F3 |
| 2 | F1, F5, A2, O2, J1, C4, C5 | Unblocked by F2/F3/C3 |
| 3 | A1, C1, D2, A6, A7, J7 | Unblocked by F1/contracts |
| 4 | A3, A4, O1, J2, C6, A8 | Entities exist |
| 5 | A5, J3, C7, J6, O4, A10 | Auth/matching core |
| 6 | A9, O3, J4, J5, C8 | Wire everything together |
| 7 | O5, Q1 | Finish + verify on production |

Critical path: F2 → F1 → A1 → A4 → A5 → O3 → O5 → Q1 (and F1 → O1/C1 → J3 → J4).
Keep these cards moving first and review them first.

## Board setup + working agreements

- **Columns:** Backlog → Ready → In progress → In review → Done. A card moves to
  Ready only after refinement and once all its blockers are Done.
- **Milestones:** M0 Foundations, M1 Accounts, M2 Crawling, M3 Jobs, M4 Launch.
  Milestones are feature groups, not phases; several run in parallel.
- **Labels (suggested):** `backend`, `frontend`, `shared`, `infra`, `docs`.
- **Pull rule:** take the top Ready card, self-assign, at most 1 card in progress
  per person. Review open PRs before pulling a new card.
- **Migrations:** one migration per PR, generated against your own schema after
  rebasing on `develop`. Never enable `synchronize`.
- **Contracts change via their own small PR** so the other side isn't broken mid-card.

## Risks to watch

- Render free tier: the web service sleeps when idle (slow first request), and the free DB has a
  limited lifetime. Check the current limits and warm the service up before the demo.
- TypeORM under strict TS + ESM: decorated entity fields need definite assignment (`!`), and the
  migration CLI must run in ESM. F1 should prove this works before entity cards start.
- Crawl targets may block bots or change markup. Have a backup company ready (C7/C8).
- OpenAI cost: set a usage cap on the key, and use fixtures in tests.

## Verification

- **MVP coverage:** every `mvp.md` section maps to cards:
  Landing → L1 · Profiles → A1, A3, A6 · Login/Auth + edit → A4, A5, A7, A8, A9, A10 ·
  Gathering data → O1–O5 · Crawl → C1–C8 · Display jobs (+ "only suitable") → J1–J7 (J3/J4 tests).
- **Dependencies:** no cycles. Every blocker ID exists. Wave 1 has ≥4 cards without blockers.
- **Done = Q1 passes** on the Render + Vercel URLs from a `main` release.

## Improvement suggestions (from reviewing the plan above)

Not applied to the backlog yet. Most important first.

1. **Settle the deferred decisions that depend on each other on day 1.** Onboarding fields
   (O1), the job fields the LLM extracts (C1, C4) and what counts as a suitable job (J3)
   are tied together: matching can only compare fields that exist on both the user's
   answers and the job. Refining them card by card risks a J3 with nothing to compare.
   → Add **R0 "Decide onboarding fields, extracted job fields and the suitability rule"**
   (no blockers, wave 1) and make O1, C1, C4 and J3 wait for it. Where crawl targets come
   from and how a crawl starts (C7) can still be refined later.
2. **Add a production check at the end of week 1.** As planned, Q1 is the first time
   everything runs together on Render + Vercel, which is too late to find cookie,
   env-var or cold-start problems.
   → Release `develop` → `main` at the end of week 1 with register, login and one
   protected page working on the live URLs (needs D1–D3 and A1–A8).
3. **Decide in F1 where tests that need a database run.** J4's end-to-end test needs a
   database. CI runs the full check on release PRs and has no database, and pointing CI
   at the shared Render database is a bad idea.
   → F1 picks one: a throwaway Postgres container inside the CI job, or database tests
   that only run locally.
4. **Cut the card count a little.** 41 cards is about everything 4 people can do in
   10 days once reviews and meetings are counted.
   → Drop **F6** and write each ADR inside the card that makes the decision
   (F1 TypeORM, A4 auth, C6 crawling, D1 hosting).
   → Merge **J2** (seed data) into **C1**.
5. **Note Render's free-tier limits on two cards.**
   → **C7:** a free web service sleeps and may cut off long requests, which affects how
   a crawl gets triggered.
   → **D2:** the free database plan may only allow one instance, so production might
   have to share the dev instance under its own schema. Check the current limits.
