import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeniorityAndPreferencesLocations1792160924539 implements MigrationInterface {
  name = 'AddSeniorityAndPreferencesLocations1792160924539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_preferences_locations" ("user_profile_id" uuid NOT NULL, "location_id" uuid NOT NULL, CONSTRAINT "PK_cd991f7800d5a7e2df546dee259" PRIMARY KEY ("user_profile_id", "location_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "seniority" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences_locations" ADD CONSTRAINT "FK_c95aab74366a174c645c96d1908" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences_locations" ADD CONSTRAINT "FK_076546d2267ee263c87ed572826" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_preferences_locations" DROP CONSTRAINT "FK_076546d2267ee263c87ed572826"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences_locations" DROP CONSTRAINT "FK_c95aab74366a174c645c96d1908"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP COLUMN "seniority"`,
    );
    await queryRunner.query(`DROP TABLE "user_preferences_locations"`);
  }
}
