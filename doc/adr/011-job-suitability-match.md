# ADR-011: Jobs get a stored match percentage per user

* Status: proposed

## Decision

Each job gets a match percentage (0–100) per user, based on the user's
profile. Every job stays visible; the match only adds a ring to the job card
and a "Best match" sort.

A rule only counts when both the profile and the job have a value for it.
The match is the weighted share of the counted rules:

```text
match = round(100 × Σ(weight × rule score) / Σ(weight of the counted rules))
```

| Rule | Weight | Counts when | Rule score |
|---|---|---|---|
| Skills | 40 | the profile and the job have ≥ 1 skill | shared skills ÷ job skills. If the job marks skills as required, only those count. |
| Workplace | 20 | remote preference and job workplace type are set | 1 if allowed, else 0. REMOTE accepts REMOTE; HYBRID accepts HYBRID, REMOTE; ONSITE accepts ONSITE, HYBRID. |
| Employment | 20 | both employment types are set | 1 if equal, else 0 |
| Location | 20 | the profile has ≥ 1 location (preferred or home) and the job has a location | 1 if willing to relocate, the job is REMOTE or its location is one of the profile's, else 0 |

See the [appendix](#appendix-worked-examples) for worked examples.

* **Stored, not computed per request.** The table `user_job_match` holds one
  row per user and job: `match` and `calculated_at`. If no rule counts (e.g.
  the user has no preferences), no row is stored.
* **Filled by one API call.** `POST /job-matches/calculate` scores every user
  against all active jobs and replaces the whole table. The same call is used
  for the first and every later run. Nothing calls it automatically yet.
* **No cut-off.** All jobs are listed on every page, whatever their match.
* **Match ring.** `GET /jobs` and `GET /jobs/:id` return `match` per job
  (`null` without a row). The job card shows the ring when it is not `null`.
* **"Best match" sort.** `sort=bestMatch` orders jobs from 100 % down to 0 %.
  Jobs without a match come last, newest first. The home page job list uses
  this sort.

## Options Considered

* **Hide jobs below a 50 % cut-off:** the user would never see jobs that the
  rules judge wrongly, for example when crawled data is incomplete.
* **Score on every request:** always up to date, but sorting by match then
  means scoring all jobs in memory (or a second copy of the rules in SQL) on
  every list request.
* **Hard filters (yes/no per rule):** one mismatch hides a job, and there is
  no percentage to show.

## Rationale

* One percentage tells the user how well a job fits, and the sort puts the
  best fits first, without hiding anything.
* A stored match lets the database sort and page by it like any other
  column.
* Crawled jobs often miss fields (workplace type, location). Skipping missing
  values keeps those jobs from getting a low match.
* Skills weigh the most because they describe the work itself. The
  preferences fine-tune the match.
* Industry is not a rule. The company's industry says little about a single
  position, and the stats page already uses the user's industries.
* Salary is not a rule either. The profile's minimum salary does not affect
  the match.
* The rules are one pure TypeScript function, fully unit-tested.

## Consequences

* Matches go stale: after a profile change or a crawl they only update on the
  next `POST /job-matches/calculate`. New jobs have no ring until then.
  Calculating automatically (after a profile save, after a crawl, or on a
  schedule) is a follow-up.
* The table holds up to users × active jobs rows. A full refresh is fine for
  the MVP; with many users, calculate per user or per new job instead.
* There is no admin role yet, so any logged-in user can trigger the
  calculation.
* Locations match by id only. The same city stored as two location rows does
  not match, and there is no distance check.

## Notes

* Ticket: #31 (the closed #38 "Suitable jobs list endpoint" is replaced by
  the "Best match" sort)
* Code: `apps/backend/src/jobs/matching/`,
  `apps/backend/src/jobs/job-matches.service.ts`
* Database: `doc/database/db-schema.md`

## Appendix: worked examples

All examples use the same user:

* Skills: React, TypeScript, Node.js, PostgreSQL
* Work mode: Hybrid
* Contract: Full-time
* Location: Berlin, not willing to relocate

### 1. Three of five skills match, every rule counts

Job: React, TypeScript, Node.js, Docker, AWS (none marked required). Hybrid,
full-time, Munich.

| Rule | Counts? | Rule score | Points |
|---|---|---|---|
| Skills | yes | 3 shared ÷ 5 job skills = 0.6 | 0.6 × 40 = 24 |
| Workplace | yes | Hybrid is allowed for Hybrid → 1 | 1 × 20 = 20 |
| Employment | yes | Full-time = Full-time → 1 | 1 × 20 = 20 |
| Location | yes | Munich is not Berlin, no relocation → 0 | 0 × 20 = 0 |

Match = 100 × 64 ÷ 100 = **64 %**.

### 2. The same job as a contract role

Employment now scores 0: 24 + 20 + 0 + 0 = 44 of 100.

Match = **44 %**. The job is still listed. With "Best match" it comes after
the 64 % job from example 1.

### 3. Missing values

Job: the same three of five skills, full-time, but **no work mode and no
location** (common for crawled jobs).

| Rule | Counts? | Points |
|---|---|---|
| Skills | yes | 0.6 × 40 = 24 |
| Workplace | no, the job has no value | skipped |
| Employment | yes | 1 × 20 = 20 |
| Location | no, the job has no location | skipped |

Match = 100 × 44 ÷ (40 + 20) = **73 %**. Missing values are left out, not
counted as 0. Otherwise the job would get 44 %.

### 4. Required skills

Job: five skills, of which only **React and Kotlin are required**. The user
has React but not Kotlin.

Only required skills count: 1 ÷ 2 = 0.5, so the skills rule gives
0.5 × 40 = **20 points** (instead of 24 for three of five). Nice-to-have
skills do not lower the match.

### 5. Empty profile

The user has no skills and no preferences, so no rule counts. No row is
stored, the match is **`null`** and the card shows no ring, because 0 % or
100 % would be misleading. With "Best match", this user's jobs are sorted
newest first.
