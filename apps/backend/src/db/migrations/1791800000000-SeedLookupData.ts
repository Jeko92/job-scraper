import type { MigrationInterface, QueryRunner } from 'typeorm';

import industries from './seed-data/industries.seed.json' with { type: 'json' };
import locations from './seed-data/locations.seed.json' with { type: 'json' };
import skills from './seed-data/skills.seed.json' with { type: 'json' };

/**
 * Seeds the skills, industries and locations lookup tables. The JSON files are
 * a frozen snapshot of this migration; later data changes need a new migration.
 * Re-running is safe, and reverting only removes seeded rows no user references.
 */
export class SeedLookupData1791800000000 implements MigrationInterface {
  name = 'SeedLookupData1791800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "skills" ("name", "slug") SELECT * FROM unnest($1::varchar[], $2::varchar[]) ON CONFLICT DO NOTHING`,
      [skills.map((s) => s.name), skills.map((s) => s.slug)],
    );
    await queryRunner.query(
      `INSERT INTO "industries" ("name", "slug") SELECT * FROM unnest($1::varchar[], $2::varchar[]) ON CONFLICT DO NOTHING`,
      [industries.map((i) => i.name), industries.map((i) => i.slug)],
    );
    // locations has no unique key, so skip rows that already exist.
    await queryRunner.query(
      `INSERT INTO "locations" ("country_code", "country_name", "state_name", "city", "postal_code")
       SELECT s.* FROM (${SEEDED_LOCATIONS}) s
       WHERE NOT EXISTS (SELECT 1 FROM "locations" l WHERE ${SAME_LOCATION})`,
      locationColumns(),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "skills" s WHERE s."slug" = ANY($1::varchar[])
       AND NOT EXISTS (SELECT 1 FROM "user_skills" us WHERE us."skill_id" = s."id")`,
      [skills.map((s) => s.slug)],
    );
    await queryRunner.query(
      `DELETE FROM "industries" i WHERE i."slug" = ANY($1::varchar[])
       AND NOT EXISTS (SELECT 1 FROM "user_industries" ui WHERE ui."industry_id" = i."id")`,
      [industries.map((i) => i.slug)],
    );
    await queryRunner.query(
      `DELETE FROM "locations" l USING (${SEEDED_LOCATIONS}) s
       WHERE ${SAME_LOCATION}
       AND NOT EXISTS (SELECT 1 FROM "user_profiles" p WHERE p."location_id" = l."id")`,
      locationColumns(),
    );
  }
}

const SEEDED_LOCATIONS = `SELECT * FROM unnest($1::varchar[], $2::varchar[], $3::varchar[], $4::varchar[], $5::varchar[])
  AS t("country_code", "country_name", "state_name", "city", "postal_code")`;

const SAME_LOCATION = `l."country_code" IS NOT DISTINCT FROM s."country_code"
  AND l."country_name" IS NOT DISTINCT FROM s."country_name"
  AND l."state_name" IS NOT DISTINCT FROM s."state_name"
  AND l."city" IS NOT DISTINCT FROM s."city"
  AND l."postal_code" IS NOT DISTINCT FROM s."postal_code"`;

function locationColumns(): (string | null)[][] {
  return [
    locations.map((l) => l.countryCode),
    locations.map((l) => l.countryName),
    locations.map((l) => l.stateName),
    locations.map((l) => l.city),
    locations.map((l) => l.postalCode),
  ];
}
