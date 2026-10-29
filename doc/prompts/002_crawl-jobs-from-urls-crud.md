# JobScraper MVP — Crawl jobs from company websites

# Objective

The database contains information about companies. The goal is to crawl company pages and retrieve currently open job listings in Germany.

## Prompting

### Iteration 001

```prompt
Please search https://soundcloud.com, find their career page and retrieve information about open positions in Germany. Return stuctured data which will enable me to populate following DB tables "Table jobs {
  id uuid [pk]

  // Relationships
  // company_id should equal crawl_runs -> crawl_targets.company_id; the
  // backend enforces this, the database does not.
  company_id uuid [not null, ref: > companies.id]
  location_id uuid [ref: >? locations.id] // primary location only (MVP)
  crawl_run_id uuid [ref: >? crawl_runs.id] // latest run that saw the job, updated with last_seen_at; null for seeded/manual jobs

  // Job information
  title varchar(255) [not null]
  description text
  employment_type varchar(50)
  workplace_type varchar(50)

  // Source identification
  source_url varchar(2048) [not null]
  external_id varchar(255) // id from the source site, if any

  // Salary
  salary_min decimal(12,2)
  salary_max decimal(12,2)
  salary_currency char(3)

  // Dates
  published_at timestamptz
  first_seen_at timestamptz [not null]
  last_seen_at timestamptz [not null]

  // Lifecycle
  is_active boolean [not null, default: true] // false once no longer seen

  created_at timestamptz [not null]
  updated_at timestamptz [not null]

  indexes {
    (company_id, source_url) [unique]
    // NULL external_ids never conflict, so source_url is the fallback key
    (company_id, external_id) [unique]
    (location_id)
    (is_active, last_seen_at)
    (published_at)
  }
}", "Table job_skills {
  job_id uuid [not null, ref: > jobs.id]
  skill_id uuid [not null, ref: > skills.id]

  required boolean [not null, default: true] // false = nice-to-have

  indexes {
    (job_id, skill_id) [pk]
    (skill_id, job_id) // find jobs by skill
  }
}",  "Table skills {
  id uuid [pk]
  name varchar [unique, not null]
  slug varchar [unique, not null]
}"
```

**Outcome**: Model opted in fo web search and completely ignored company website. 

### Iteration 002

```prompt
Please visit the URL -> https://soundcloud.com, try to find their career page or related page(s) only using their website as a source of truth, avoid searching job boards and fetch the open jobs in Germany. Return structured data which will enable me to populate following DB tables `...same tables as in Iteration 001` Please fill-in only available data from the website
```

**Outcome**: Crawled actual company website and continued with job board to fetch details about each job listing. Results can be seen at [JSON](./soundcloud_germany_jobs.json).

### Iteration 003

```prompt
Please visit the URL -> https://general-overnight.com, try to find their career page or related page(s) only using their website as a source of truth, avoid searching job boards and fetch the open jobs in Germany. Return structured data which will enable me to populate following DB tables `...same tables as in Iteration 001` Please fill-in only available data from the website
```

**Outcome**: Crawled actual company website and continued with career page to fetch details about each job listing. Results can be seen at [JSON](./go_express_jobs_de.json).

