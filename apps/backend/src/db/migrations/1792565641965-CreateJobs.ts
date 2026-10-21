import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobs1792565641965 implements MigrationInterface {
  name = 'CreateJobs1792565641965';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "job_skills" ("job_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "required" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_cc853451c17c3913492abc1e6e6" PRIMARY KEY ("job_id", "skill_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cc853451c17c3913492abc1e6e" ON "job_skills"  ("skill_id", "job_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "location_id" uuid, "title" character varying(255) NOT NULL, "description" text, "employment_type" character varying(50), "workplace_type" character varying(50), "source_url" character varying(2048) NOT NULL, "external_id" character varying(255), "salary_min" numeric(12,2), "salary_max" numeric(12,2), "salary_currency" character(3), "published_at" TIMESTAMP WITH TIME ZONE, "first_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c42d35384096cdbb73a776669c" ON "jobs"  ("published_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a1fbafa8cf356acecc235bb6e" ON "jobs"  ("is_active", "last_seen_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1a8e5385d0c88b833461095c97" ON "jobs"  ("location_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_11606e7ced0a3c142f0777c121" ON "jobs"  ("company_id", "external_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cac18c5528ab656e8c7ed6538a" ON "jobs"  ("company_id", "source_url") `,
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" ADD CONSTRAINT "FK_4f7427e13d249156f37669e7127" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" ADD CONSTRAINT "FK_7c0a3c52e77f9d9d839fdbb14b6" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_087a773c50525e348e26188e7cc" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_1a8e5385d0c88b833461095c979" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_1a8e5385d0c88b833461095c979"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_087a773c50525e348e26188e7cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" DROP CONSTRAINT "FK_7c0a3c52e77f9d9d839fdbb14b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" DROP CONSTRAINT "FK_4f7427e13d249156f37669e7127"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cac18c5528ab656e8c7ed6538a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_11606e7ced0a3c142f0777c121"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1a8e5385d0c88b833461095c97"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a1fbafa8cf356acecc235bb6e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c42d35384096cdbb73a776669c"`,
    );
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cc853451c17c3913492abc1e6e"`,
    );
    await queryRunner.query(`DROP TABLE "job_skills"`);
  }
}
