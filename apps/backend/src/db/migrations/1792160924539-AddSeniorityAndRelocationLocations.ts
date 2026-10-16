import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeniorityAndRelocationLocations1792160924539 implements MigrationInterface {
  name = 'AddSeniorityAndRelocationLocations1792160924539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_relocation_locations" ("user_profile_id" uuid NOT NULL, "location_id" uuid NOT NULL, CONSTRAINT "PK_f4ceecd1c578d08b2e6e910703c" PRIMARY KEY ("user_profile_id", "location_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "seniority" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_relocation_locations" ADD CONSTRAINT "FK_07f125b73b84a898b1a340db081" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_relocation_locations" ADD CONSTRAINT "FK_8ce9da625f7b7922c5f5bfc35a3" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_relocation_locations" DROP CONSTRAINT "FK_8ce9da625f7b7922c5f5bfc35a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_relocation_locations" DROP CONSTRAINT "FK_07f125b73b84a898b1a340db081"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP COLUMN "seniority"`,
    );
    await queryRunner.query(`DROP TABLE "user_relocation_locations"`);
  }
}
