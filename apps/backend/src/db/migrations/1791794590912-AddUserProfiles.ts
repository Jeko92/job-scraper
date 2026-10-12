import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Splits personal data off `users` into `user_profiles` and adds preferences,
 * skills, industries and locations. Hand-written so existing users keep their
 * password hash and names (a generated migration would drop and re-add them).
 */
export class AddUserProfiles1791794590912 implements MigrationInterface {
  name = 'AddUserProfiles1791794590912';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // users: snake_case password column, optional email, timestamps.
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );

    // Lookup tables.
    await queryRunner.query(
      `CREATE TABLE "locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country_code" character varying, "country_name" character varying, "state_name" character varying, "city" character varying, "postal_code" character varying, CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, CONSTRAINT "UQ_81f05095507fd84aa2769b4a522" UNIQUE ("name"), CONSTRAINT "UQ_55b7acbf80551e7fa2b5a33ed6c" UNIQUE ("slug"), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "industries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, CONSTRAINT "UQ_447df075c342af02a92901dc810" UNIQUE ("name"), CONSTRAINT "UQ_4ff129e4d52b3a32e131fa21fde" UNIQUE ("slug"), CONSTRAINT "PK_f1626dcb2d58142d7dfcca7b8d1" PRIMARY KEY ("id"))`,
    );

    // user_profiles, backfilled with the names currently stored on users.
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "first_name" character varying, "last_name" character varying, "headline" character varying, "years_experience" numeric(4,1), "location_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_6ca9503d77ae39b4b5a6cc3ba8" UNIQUE ("user_id"), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_c8896d40349ab46c4542f1f67fe" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `INSERT INTO "user_profiles" ("user_id", "first_name", "last_name") SELECT "id", "firstName", "lastName" FROM "users"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);

    // Tables hanging off user_profiles.
    await queryRunner.query(
      `CREATE TABLE "user_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_profile_id" uuid NOT NULL, "remote_preference" character varying(50), "employment_type" character varying(50), "min_salary" numeric(12,2), "salary_currency" character(3), "willing_to_relocate" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_c57f39ad2b8810aaf927e0c19a" UNIQUE ("user_profile_id"), CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_c57f39ad2b8810aaf927e0c19a6" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_skills" ("user_profile_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "level" character varying, "years_experience" numeric(4,1), CONSTRAINT "PK_a1abd44dd28724598e4df80d15a" PRIMARY KEY ("user_profile_id", "skill_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_skills" ADD CONSTRAINT "FK_03430c2bf2b34f5f99aceb1303b" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_skills" ADD CONSTRAINT "FK_eb69710b0a00f42fb95fc2ac2f5" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_industries" ("user_profile_id" uuid NOT NULL, "industry_id" uuid NOT NULL, "priority" integer, CONSTRAINT "PK_999e8558f28a732a37f12dcce1a" PRIMARY KEY ("user_profile_id", "industry_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_industries" ADD CONSTRAINT "FK_6234431fe08ac8458e9e9cccabb" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_industries" ADD CONSTRAINT "FK_e2b1a0064c0f6c0fdef589ab708" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_industries"`);
    await queryRunner.query(`DROP TABLE "user_skills"`);
    await queryRunner.query(`DROP TABLE "user_preferences"`);

    // Copy names back onto users before dropping user_profiles.
    await queryRunner.query(
      `ALTER TABLE "users" ADD "firstName" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastName" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "firstName" = COALESCE(p."first_name", ''), "lastName" = COALESCE(p."last_name", '') FROM "user_profiles" p WHERE p."user_id" = "users"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "firstName" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "lastName" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP TABLE "user_profiles"`);

    await queryRunner.query(`DROP TABLE "industries"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP TABLE "locations"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "password_hash" TO "passwordHash"`,
    );
  }
}
