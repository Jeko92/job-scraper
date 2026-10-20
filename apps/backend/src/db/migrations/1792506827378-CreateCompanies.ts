import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanies1792506827378 implements MigrationInterface {
  name = 'CreateCompanies1792506827378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "company_industries" ("company_id" uuid NOT NULL, "industry_id" uuid NOT NULL, CONSTRAINT "PK_e449d8f4f39f2118dd1dbc19a1b" PRIMARY KEY ("company_id", "industry_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "company_locations" ("company_id" uuid NOT NULL, "location_id" uuid NOT NULL, CONSTRAINT "PK_b23ca2a20123eddb8bce679f686" PRIMARY KEY ("company_id", "location_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "company_skills" ("company_id" uuid NOT NULL, "skill_id" uuid NOT NULL, CONSTRAINT "PK_3a3d0639280e2c4db17b63aafe1" PRIMARY KEY ("company_id", "skill_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "legal_name" character varying, "domain" character varying, "website_url" character varying, "company_type" character varying, "description" text, "number_of_employees" integer, "employee_range" character varying, "founding_year" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_89a223b4d883067d909eedd3558" UNIQUE ("domain"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_industries" ADD CONSTRAINT "FK_d9f9369033ae302ff1423780911" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_industries" ADD CONSTRAINT "FK_d15362c925492ce14e9e4c1a930" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_locations" ADD CONSTRAINT "FK_14447a749111cf5703338e1b8bc" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_locations" ADD CONSTRAINT "FK_dbca3386667bef49eecab11a680" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_skills" ADD CONSTRAINT "FK_c7487cc68f4996509b6d460cd03" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_skills" ADD CONSTRAINT "FK_094c7d27d40f63dbe6d7ae91261" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_skills" DROP CONSTRAINT "FK_094c7d27d40f63dbe6d7ae91261"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_skills" DROP CONSTRAINT "FK_c7487cc68f4996509b6d460cd03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_locations" DROP CONSTRAINT "FK_dbca3386667bef49eecab11a680"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_locations" DROP CONSTRAINT "FK_14447a749111cf5703338e1b8bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_industries" DROP CONSTRAINT "FK_d15362c925492ce14e9e4c1a930"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_industries" DROP CONSTRAINT "FK_d9f9369033ae302ff1423780911"`,
    );
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TABLE "company_skills"`);
    await queryRunner.query(`DROP TABLE "company_locations"`);
    await queryRunner.query(`DROP TABLE "company_industries"`);
  }
}
