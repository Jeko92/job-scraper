# Company sync — design

* Date: 2026-10-12
* Status: draft (awaiting review)

## Goal

A backend module that pulls company data from several external APIs on a
schedule, normalizes the different responses into one shape, matches it to
the database schema (`doc/database/db-schema-v1.dbml`), drops duplicates and
writes the result to Postgres. New APIs must be addable with minimal changes.

First sources:

* **Wikidata** — live SPARQL query (`https://query.wikidata.org/`), German IT
  companies, query from [`../dataset/dataset.md`](../dataset/dataset.md).
* **CompanyEnrich** — `POST /companies/search`
  (`https://api.companyenrich.com`), up to 50 companies for each of the 12
  cities in `apps/backend/src/common/utils/target-cities.json`.

## Design patterns

| Pattern | Role |
|---|---|
| Adapter / Strategy | One `SourceAdapter` subclass per API: fetches raw pages, validates them with zod and maps them to `NormalizedCompany` |
| Registry | Adapters are registered under the multi-provider token `SOURCE_ADAPTERS`; the service, scheduler and controller iterate over it. No `switch` over source names |
| Template Method | `CompanySyncService.run()` is the one pipeline for every source: fetch → normalize → dedupe → upsert → summary |
| Repository | `CompanyWriter` writes normalized companies through TypeORM in one transaction per batch |

A plain Factory was rejected: it only chooses which object to create and
needs a central `switch` that changes for every new source. A factory
provider (`useFactory`) is only added if one adapter class is ever reused
with different configs.

MVC mapping: entities + zod schemas are the model, `CompanySyncController`
is the controller, JSON responses are the view.

Adding a new API = one folder under `adapters/` + one line in
`company-sync.module.ts` + its env entries.

The `Location`, `Industry` and `Skill` entities are reused from the existing
`locations/`, `industries/` and `skills/` modules.

## Layout

```text
apps/backend/src/companies/
  companies.module.ts            TypeOrmModule.forFeature for the entities below
  entities/
    company.entity.ts            companies (+ @ManyToMany to locations, industries, skills)
    company-source.entity.ts     company_sources
apps/backend/src/company-sync/
  company-sync.module.ts
  company-sync.controller.ts
  company-sync.service.ts
  company-sync.scheduler.ts
  company-writer.service.ts
  normalized-company.ts
  adapters/
    source-adapter.ts
    wikidata/wikidata.adapter.ts
    wikidata/wikidata-response.ts
    companyenrich/companyenrich.adapter.ts
    companyenrich/companyenrich-response.ts
apps/backend/src/db/migrations/<timestamp>-CreateCompanies.ts
apps/backend/bruno/company-sync/list-sources.bru
apps/backend/bruno/company-sync/run-source.bru
```

## Adapter contract

```ts
export const SOURCE_ADAPTERS = Symbol('SOURCE_ADAPTERS');

export abstract class SourceAdapter {
  abstract readonly name: string;
  abstract readonly cron: string;
  abstract fetchBatches(): AsyncIterable<unknown>;
  abstract normalize(raw: unknown): NormalizedCompany[];
}
```

`normalize` parses `raw` with the adapter's zod response schema and throws
on a malformed page. Records missing a domain are dropped there.

## NormalizedCompany

zod schema, the contract between adapters and the writer:

```ts
{
  source: string;
  externalId: string;
  name: string;
  legalName: string | null;
  domain: string;
  websiteUrl: string | null;
  companyType: string | null;
  description: string | null;
  numberOfEmployees: number | null;
  employeeRange: string | null;
  foundingYear: number | null;
  locations: {
    countryCode: string | null;
    countryName: string | null;
    stateName: string | null;
    city: string | null;
    postalCode: string | null;
  }[];
  industries: string[];
  skills: string[];
}
```

`domain` is lower-case, without protocol, `www.` and path.

## Field mapping

| NormalizedCompany | Wikidata | CompanyEnrich |
|---|---|---|
| externalId | Q-ID from `company` URI | `id` |
| name | `companyLabel` | `name` |
| legalName | – | `legalName` |
| domain | hostname of `officialWebsite` | `domain` |
| websiteUrl | `officialWebsite` | `website` |
| companyType | – | `type` |
| description | – | `description` |
| numberOfEmployees | `employeeCount` (rounded) | – |
| employeeRange | – | `employees` |
| foundingYear | year of `foundedDate` | `founded_year` |
| locations | `hqLabel` as city, country `DE` / `Germany` | `location.country.code/name`, `location.state.name`, `location.city.name`, `location.postal_code` |
| industries | `Information technology` | `industries` |
| skills | – | `technologies` |

The Wikidata query asks for labels in `"en,de"` so city names match
CompanyEnrich and `target-cities.json` (e.g. `Munich`, `Cologne`). Wikidata
rows are grouped by Q-ID, so a company with several headquarters becomes one
company with several locations.

## Pipeline

`CompanySyncService.run(name)`:

1. Look up the adapter in the registry; unknown name → `404`.
2. Take the per-source lock; already running → `409` (manual) or skipped
   tick (cron).
3. For each raw batch: `normalize`, dedupe by `domain` (first wins, others
   merged fill-missing), `CompanyWriter.upsert(batch)`.
4. Release the lock, log and return
   `{ source, fetched, upserted, skipped, durationMs }`.

A network or validation error on a batch aborts the run for that source,
releases the lock and is logged; the other source is unaffected. Records
written by earlier batches stay.

## Writing and duplicates

All in one transaction per batch:

* `companies`: `INSERT … ON CONFLICT (domain) DO UPDATE SET
  col = COALESCE(companies.col, EXCLUDED.col), updated_at = now()`.
  Existing values are never overwritten (fill-missing rule).
* `locations`: select the row where `country_code`, `state_name`, `city`
  and `postal_code` are `IS NOT DISTINCT FROM` the normalized values; insert
  only if none matches. Same pattern as `SeedLookupData`; no new index on
  the existing table. Writes are serialized, so no duplicates are created.
* `industries`, `skills`: upsert on the existing unique `slug`. The slug is
  built like the seeded slugs (`C#` → `csharp`, `ASP.NET Core` →
  `asp-dotnet-core`), so API values reuse seeded rows. A skill row is
  shared by `user_skills` and `company_skills`.
* `company_locations`, `company_industries`, `company_skills`:
  `ON CONFLICT DO NOTHING`.
* `company_sources`: upsert on unique `(source, external_id)`, updating
  `company_id` and `fetched_at`.

## Schema changes

Existing tables (`users`, `skills`, `industries`, `locations`, …) keep their
columns and constraints. One migration creates `companies`,
`company_locations`, `company_industries`, `company_skills` as in
db-schema-v1 (all timestamps `timestamptz`), plus:

```dbml
Table company_sources {
  id uuid [pk]
  company_id uuid [ref: > companies.id, not null]
  source varchar [not null]
  external_id varchar [not null]
  fetched_at timestamptz [not null]

  indexes {
    (source, external_id) [unique]
  }
}
```

A second migration adds `users.role` (`admin` | `user`, default `user`).
Both are documented in `doc/database/db-schema-v1.dbml`.

## CompanyEnrich query

For each entry in `target-cities.json`:

1. `POST /geo/cities` `{ query: city, countryCodes: ['DE'], page: 1 }`,
   take the first item's `id`. No match → logged and skipped.
2. `POST /companies/search`
   `{ countries: ['DE'], cities: [id], page: 1, pageSize }` with
   `pageSize = COMPANYENRICH_COMPANIES_PER_CITY`.

Each search response is one batch. `x-credit-cost` and `x-credit-remaining`
are logged. One run costs about 12 × 50 = 600 credits. `402` and `429` abort
the run.

## Wikidata query

One `GET` to `WIKIDATA_SPARQL_URL` with the query as `query` parameter,
`Accept: application/sparql-results+json` and `User-Agent` from
`WIKIDATA_USER_AGENT` (required by the Wikimedia User-Agent policy). The
whole result is one batch.

## Scheduling

`@nestjs/schedule` (`ScheduleModule.forRoot()`). `CompanySyncScheduler`
creates one `CronJob` per registered adapter in `onModuleInit` and adds it
to `SchedulerRegistry` under the adapter name. Each job calls
`CompanySyncService.run(name)` and catches errors.

## API

Both routes sit behind the global JWT guard and require the `admin` role.

| Method | Path | Response |
|---|---|---|
| GET | `/company-sync/sources` | `[{ name, cron, running }]` |
| POST | `/company-sync/sources/:name/run` | run summary; `404` unknown source, `409` already running |

Bruno requests in `apps/backend/bruno/company-sync/`.

## Configuration

New entries in `env.ts` and documented in `.env.example`:

| Variable | Example |
|---|---|
| `COMPANYENRICH_API_URL` | `https://api.companyenrich.com` |
| `COMPANYENRICH_API_KEY` | – (secret) |
| `COMPANYENRICH_COMPANIES_PER_CITY` | `50` |
| `COMPANYENRICH_SYNC_CRON` | `0 3 * * 1` (weekly, Monday 03:00) |
| `WIKIDATA_SPARQL_URL` | `https://query.wikidata.org/sparql` |
| `WIKIDATA_USER_AGENT` | `JobScraper/0.1 (contact e-mail)` |
| `WIKIDATA_SYNC_CRON` | `0 2 * * *` (daily 02:00) |

## Documentation

* ADR `doc/adr/007-company-source-adapters.md`: Adapter + Registry +
  Template Method instead of Factory, in-process cron, fill-missing merge.
* `doc/database/db-schema-v1.dbml`: `company_sources`, `users.role`.

## Testing

No new tests (AGENTS.md). Verification: `pnpm check`, `migration:run`
against the local Docker database, both Bruno requests, and row counts in
the new tables.

## Risks

* Render free tier sleeps when idle; in-process cron jobs do not fire while
  it sleeps.
* Every CompanyEnrich run spends about 600 credits; only admins can
  trigger one manually.
* Lookups grow with every sync, so profile dropdowns can show many
  source-specific industries and skills.
* City name lookups can return the wrong city when names are ambiguous; the
  first German match is taken and logged.
