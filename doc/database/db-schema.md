# Database schema diagram

ER diagram of the JobScraper database, written in
[Mermaid](https://mermaid.js.org/syntax/entityRelationshipDiagram.html).
GitHub renders it directly; elsewhere, paste the block into
https://mermaid.live.

The source of truth is [`db-schema-v1.dbml`](db-schema-v1.dbml), which also
explains the tables, the crawling flow and the on-delete behaviour. Keep this
diagram in sync with it.

Relation markers: `||--||` is one-to-one, `||--o{` is one-to-many,
`|o--o{` is an optional (nullable) one-to-many.

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK "optional"
        varchar username UK
        varchar password_hash
        timestamptz created_at
        timestamptz updated_at
    }

    user_profiles {
        uuid id PK
        uuid user_id FK, UK
        varchar first_name
        varchar last_name
        varchar headline
        decimal years_experience "decimal(4,1)"
        varchar seniority "INTERN | JUNIOR | MID | SENIOR | LEAD"
        boolean onboarding_completed "default false"
        uuid location_id FK "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    user_preferences {
        uuid id PK
        uuid user_profile_id FK, UK
        varchar remote_preference
        varchar employment_type
        decimal min_salary "decimal(12,2)"
        char salary_currency "ISO 4217, e.g. EUR"
        boolean willing_to_relocate "default false"
        timestamptz created_at
        timestamptz updated_at
    }

    skills {
        uuid id PK
        varchar name UK
        varchar slug UK
    }

    industries {
        uuid id PK
        varchar name UK
        varchar slug UK
    }

    locations {
        uuid id PK
        varchar country_code "ISO 3166-1 alpha-2, e.g. DE"
        varchar country_name
        varchar state_name
        varchar city
        varchar postal_code
    }

    user_skills {
        uuid user_profile_id PK, FK
        uuid skill_id PK, FK
        varchar level
        decimal years_experience "decimal(4,1)"
    }

    user_relocation_locations {
        uuid user_profile_id PK, FK
        uuid location_id PK, FK
    }

    user_industries {
        uuid user_profile_id PK, FK
        uuid industry_id PK, FK
        int priority
    }

    companies {
        uuid id PK
        varchar name
        varchar legal_name
        varchar domain UK
        varchar website_url
        varchar company_type
        text description
        int number_of_employees "exact count, if given"
        varchar employee_range "e.g. 51-200"
        int founding_year
        timestamptz created_at
        timestamptz updated_at
    }

    company_locations {
        uuid company_id PK, FK
        uuid location_id PK, FK
    }

    company_skills {
        uuid company_id PK, FK
        uuid skill_id PK, FK
    }

    company_industries {
        uuid company_id PK, FK
        uuid industry_id PK, FK
    }

    jobs {
        uuid id PK
        uuid company_id FK
        uuid location_id FK "nullable, primary location only"
        uuid crawl_run_id FK "nullable, latest run that saw the job"
        varchar title
        text description
        varchar employment_type
        varchar workplace_type
        varchar source_url "unique per company"
        varchar external_id "unique per company, if any"
        decimal salary_min "decimal(12,2)"
        decimal salary_max "decimal(12,2)"
        char salary_currency
        timestamptz published_at
        timestamptz first_seen_at
        timestamptz last_seen_at
        boolean is_active "default true"
        timestamptz created_at
        timestamptz updated_at
    }

    job_skills {
        uuid job_id PK, FK
        uuid skill_id PK, FK
        boolean required "default true, false = nice-to-have"
    }

    crawl_targets {
        uuid id PK
        uuid company_id FK
        varchar url "unique per company"
        boolean is_active "default true"
        timestamptz last_crawled_at
        timestamptz next_crawl_at
        timestamptz created_at
        timestamptz updated_at
    }

    crawl_runs {
        uuid id PK
        uuid crawl_target_id FK
        timestamptz started_at
        timestamptz finished_at "null while running"
        varchar status "running | succeeded | partial | failed"
        int pages_crawled "default 0"
        int jobs_found "default 0"
        text error_message
        timestamptz created_at
    }

    users ||--|| user_profiles : "has profile"
    user_profiles ||--|| user_preferences : "has preferences"
    locations |o--o{ user_profiles : "lives in"

    user_profiles ||--o{ user_skills : ""
    skills ||--o{ user_skills : ""
    user_profiles ||--o{ user_industries : ""
    industries ||--o{ user_industries : ""
    user_profiles ||--o{ user_relocation_locations : ""
    locations ||--o{ user_relocation_locations : ""

    companies ||--o{ company_locations : ""
    locations ||--o{ company_locations : ""
    companies ||--o{ company_skills : ""
    skills ||--o{ company_skills : ""
    companies ||--o{ company_industries : ""
    industries ||--o{ company_industries : ""

    companies ||--o{ jobs : "posts"
    locations |o--o{ jobs : "located in"
    crawl_runs |o--o{ jobs : "last seen by"
    jobs ||--o{ job_skills : ""
    skills ||--o{ job_skills : ""

    companies ||--o{ crawl_targets : "career pages"
    crawl_targets ||--o{ crawl_runs : "crawled in"
```
