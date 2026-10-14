# ADR-007: Company source adapters with scheduled sync

* Status: proposed

## Decision

* Every external company API is a `SourceAdapter` subclass in
  `apps/backend/src/company-sync/adapters/`. It fetches raw pages and maps
  them to one `NormalizedCompany` shape (Adapter/Strategy).
* Adapters are registered under the `SOURCE_ADAPTERS` token (Registry).
  The sync service, scheduler and controller only iterate over it.
* `CompanySyncService.run()` is the one pipeline for every source: fetch,
  validate, dedupe by domain, upsert (Template Method).
* Upserts use `companies.domain` as the key and only fill missing values;
  existing values are never overwritten. `company_sources` records which
  source and external id a company came from.
* `companies.name` and `companies.domain` are `NOT NULL`. Every source
  gives a name, and a company without a domain cannot be deduplicated, so
  it is dropped by its adapter.
* The sync adds missing rows to the existing `skills`, `industries` and
  `locations` lookups. Skills and industries are matched by their existing
  unique `slug`, built the same way as the seeded slugs, so a company's
  `React` and a user's `React` are one row. Locations are matched on all
  of `country_code`, `state_name`, `city`, `postal_code` and only inserted
  when no row matches. Existing lookup tables keep their columns and
  constraints.
* Each adapter runs on its own cron expression from `.env` through
  `@nestjs/schedule`, inside the backend process.
* First sources: Wikidata (SPARQL) and CompanyEnrich (company search,
  50 companies for each of 12 target cities).

## Options Considered

* Factory with a `switch` over source names: every new source changes
  central code.
* Config-driven field mapping without code per source: cannot express
  pagination, auth or derived fields, and is hard to type-check.
* Last-write-wins or source-priority merging: data flips between sources
  depending on which sync ran last.
* Unique index on `locations` for `ON CONFLICT` upserts: changes an
  existing table owned by the user profile feature.
* Linking seeded lookups only: most companies would end up without
  industries, skills or cities.
* Nullable `companies.name` and `companies.domain` as first drafted in
  db-schema-v1: allows rows that the sync can neither show nor
  deduplicate.
* External scheduler (Render cron job, GitHub Actions): a second deploy
  target for the MVP.

## Rationale

Adding a source means one adapter folder, one line in
`company-sync.module.ts` and its `.env` entries. The pipeline, writer,
scheduler and controller stay unchanged. The adapter style matches the
existing `AiProvider` in the AI module.

## Consequences

* In-process cron jobs don't fire while the Render free-tier service sleeps.
* A CompanyEnrich run costs about 600 credits. The `/company-sync/*`
  endpoints are restricted to users with the `admin` role
  (`users.role`, see the README for how to promote a user).
* Lookups are no longer only seeded: they also grow with every sync, so
  the profile dropdowns show values that came from company sources.
* `doc/database/db-schema-v1.dbml` gains `company_sources` and
  `users.role`. The migration only creates new tables and the new column.

## Notes

* Spec: `doc/specs/2026-10-12-company-sync-design.md`