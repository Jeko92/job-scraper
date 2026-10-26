import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Jobs a user has saved to their personal list. */
export class CreateUserSavedJobs1793021819741 implements MigrationInterface {
  name = 'CreateUserSavedJobs1793021819741';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_saved_jobs" ("user_id" uuid NOT NULL, "job_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5612469b386e41c44e61bb86a16" PRIMARY KEY ("user_id", "job_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9ee9141dbb84ea6bf62b808567" ON "user_saved_jobs"  ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_saved_jobs" ADD CONSTRAINT "FK_9c1e219319b5b20f33910d1fc8a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_saved_jobs" ADD CONSTRAINT "FK_55a1d72ea1dc53164c19a732e02" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_saved_jobs" DROP CONSTRAINT "FK_55a1d72ea1dc53164c19a732e02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_saved_jobs" DROP CONSTRAINT "FK_9c1e219319b5b20f33910d1fc8a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9ee9141dbb84ea6bf62b808567"`,
    );
    await queryRunner.query(`DROP TABLE "user_saved_jobs"`);
  }
}
