import type { MigrationInterface, QueryRunner } from 'typeorm';

/** How well each job fits each user's profile (ADR-010). */
export class CreateUserJobMatch1793181533359 implements MigrationInterface {
  name = 'CreateUserJobMatch1793181533359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_job_match" ("user_id" uuid NOT NULL, "job_id" uuid NOT NULL, "match" smallint NOT NULL, "calculated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e2b7c751e343a68b4a102ea4c22" PRIMARY KEY ("user_id", "job_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_358dca3cc9b4f4373dcad1dab5" ON "user_job_match"  ("user_id", "match") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_job_match" ADD CONSTRAINT "FK_9f7a3b3f0d5665e48f6134da24c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_job_match" ADD CONSTRAINT "FK_278a2ad1c548868cb30b2c7f5f0" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_job_match" DROP CONSTRAINT "FK_278a2ad1c548868cb30b2c7f5f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_job_match" DROP CONSTRAINT "FK_9f7a3b3f0d5665e48f6134da24c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_358dca3cc9b4f4373dcad1dab5"`,
    );
    await queryRunner.query(`DROP TABLE "user_job_match"`);
  }
}
