import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Gives every user a role; existing and new users start as "user". */
export class AddRoleToUsers1793183028117 implements MigrationInterface {
  name = 'AddRoleToUsers1793183028117';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" character varying(20) NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "CHK_users_role" CHECK ("role" IN ('user', 'admin'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "CHK_users_role"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
  }
}
