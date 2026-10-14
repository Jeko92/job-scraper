import { Injectable } from '@nestjs/common';
import { DataSource, type EntityManager } from 'typeorm';

import {
  type NormalizedCompany,
  type NormalizedLocation,
  toSlug,
} from './normalized-company.js';

interface IdRow {
  id: string;
}

interface Lookup {
  upsert: string;
  link: string;
}

const UPSERT_COMPANY = `
  INSERT INTO "companies" ("name", "legal_name", "domain", "website_url", "company_type", "description", "number_of_employees", "employee_range", "founding_year")
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  ON CONFLICT ("domain") DO UPDATE SET
    "name" = COALESCE("companies"."name", EXCLUDED."name"),
    "legal_name" = COALESCE("companies"."legal_name", EXCLUDED."legal_name"),
    "website_url" = COALESCE("companies"."website_url", EXCLUDED."website_url"),
    "company_type" = COALESCE("companies"."company_type", EXCLUDED."company_type"),
    "description" = COALESCE("companies"."description", EXCLUDED."description"),
    "number_of_employees" = COALESCE("companies"."number_of_employees", EXCLUDED."number_of_employees"),
    "employee_range" = COALESCE("companies"."employee_range", EXCLUDED."employee_range"),
    "founding_year" = COALESCE("companies"."founding_year", EXCLUDED."founding_year"),
    "updated_at" = now()
  RETURNING "id"`;

const UPSERT_LOCATION = `
  WITH "existing" AS (
    SELECT "id" FROM "locations"
    WHERE "country_code" IS NOT DISTINCT FROM $1::varchar
      AND "state_name" IS NOT DISTINCT FROM $3::varchar
      AND "city" IS NOT DISTINCT FROM $4::varchar
      AND "postal_code" IS NOT DISTINCT FROM $5::varchar
    ORDER BY "id"
    LIMIT 1
  ), "inserted" AS (
    INSERT INTO "locations" ("country_code", "country_name", "state_name", "city", "postal_code")
    SELECT $1::varchar, $2::varchar, $3::varchar, $4::varchar, $5::varchar
    WHERE NOT EXISTS (SELECT 1 FROM "existing")
    RETURNING "id"
  )
  SELECT "id" FROM "existing"
  UNION ALL
  SELECT "id" FROM "inserted"`;

const LINK_LOCATION = `
  INSERT INTO "company_locations" ("company_id", "location_id")
  VALUES ($1, $2)
  ON CONFLICT DO NOTHING`;

const INDUSTRIES: Lookup = {
  upsert: `
    INSERT INTO "industries" ("name", "slug") VALUES ($1, $2)
    ON CONFLICT ("slug") DO UPDATE SET "slug" = EXCLUDED."slug"
    RETURNING "id"`,
  link: `
    INSERT INTO "company_industries" ("company_id", "industry_id")
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING`,
};

const SKILLS: Lookup = {
  upsert: `
    INSERT INTO "skills" ("name", "slug") VALUES ($1, $2)
    ON CONFLICT ("slug") DO UPDATE SET "slug" = EXCLUDED."slug"
    RETURNING "id"`,
  link: `
    INSERT INTO "company_skills" ("company_id", "skill_id")
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING`,
};

const UPSERT_SOURCE = `
  INSERT INTO "company_sources" ("company_id", "source", "external_id", "fetched_at")
  VALUES ($1, $2, $3, now())
  ON CONFLICT ("source", "external_id") DO UPDATE SET
    "company_id" = EXCLUDED."company_id",
    "fetched_at" = EXCLUDED."fetched_at"`;

@Injectable()
export class CompanyWriter {
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly dataSource: DataSource) {}

  upsert(companies: NormalizedCompany[]): Promise<void> {
    const write = this.queue.then(() => this.write(companies));
    this.queue = write.catch(() => undefined);
    return write;
  }

  private write(companies: NormalizedCompany[]): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      for (const company of companies) {
        await upsertCompany(manager, company);
      }
    });
  }
}

async function upsertCompany(
  manager: EntityManager,
  company: NormalizedCompany,
): Promise<void> {
  const companyId = await insertReturningId(manager, UPSERT_COMPANY, [
    company.name,
    company.legalName,
    company.domain,
    company.websiteUrl,
    company.companyType,
    company.description,
    company.numberOfEmployees,
    company.employeeRange,
    company.foundingYear,
  ]);

  for (const location of company.locations) {
    await linkLocation(manager, companyId, location);
  }
  await linkLookup(manager, companyId, INDUSTRIES, company.industries);
  await linkLookup(manager, companyId, SKILLS, company.skills);
  await manager.query(UPSERT_SOURCE, [
    companyId,
    company.source,
    company.externalId,
  ]);
}

async function linkLocation(
  manager: EntityManager,
  companyId: string,
  location: NormalizedLocation,
): Promise<void> {
  const locationId = await insertReturningId(manager, UPSERT_LOCATION, [
    location.countryCode,
    location.countryName,
    location.stateName,
    location.city,
    location.postalCode,
  ]);
  await manager.query(LINK_LOCATION, [companyId, locationId]);
}

async function linkLookup(
  manager: EntityManager,
  companyId: string,
  lookup: Lookup,
  names: string[],
): Promise<void> {
  for (const name of names) {
    const slug = toSlug(name);
    if (!slug) {
      continue;
    }
    const id = await insertReturningId(manager, lookup.upsert, [name, slug]);
    await manager.query(lookup.link, [companyId, id]);
  }
}

async function insertReturningId(
  manager: EntityManager,
  sql: string,
  parameters: unknown[],
): Promise<string> {
  const [row] = await manager.query<IdRow[]>(sql, parameters);
  if (!row) {
    throw new Error('Upsert returned no id');
  }
  return row.id;
}
