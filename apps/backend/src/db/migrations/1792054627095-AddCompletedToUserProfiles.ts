import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Marks whether the user has submitted the onboarding flow. */
export class AddCompletedToUserProfiles1792054627095 implements MigrationInterface {
  name = 'AddCompletedToUserProfiles1792054627095';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "onboarding_completed" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP COLUMN "onboarding_completed"`,
    );
  }
}
