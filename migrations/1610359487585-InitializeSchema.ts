import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitializeSchema1610359487585 implements MigrationInterface {
  name = 'InitializeSchema1610359487585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."core_core_size_enum" AS ENUM('small', 'medium', 'large')`);
    await queryRunner.query(
      `CREATE TABLE "public"."core" ("id" SERIAL NOT NULL, "core_size" "public"."core_core_size_enum" NOT NULL DEFAULT 'small', "description" character varying(255) NOT NULL, "core_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "allocated_node_ids_range" int8range NOT NULL, "allocated_way_ids_range" int8range NOT NULL, "allocated_relation_ids_range" int8range NOT NULL, "allocated_changeset_ids_range" int8range NOT NULL, "allocation_date_created" TIMESTAMP NOT NULL DEFAULT now(), "allocation_date_updated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_51d0776ec0a5d96bdd05213e86e" UNIQUE ("core_id"), CONSTRAINT "XCL_088f8fd61f225583337a8072c6" EXCLUDE USING gist ("allocated_changeset_ids_range" WITH &&), CONSTRAINT "XCL_db53d9674adc0a4517fc348604" EXCLUDE USING gist ("allocated_relation_ids_range" WITH &&), CONSTRAINT "XCL_4b0659344d229b8b5969fc53fe" EXCLUDE USING gist ("allocated_way_ids_range" WITH &&), CONSTRAINT "XCL_783644c2a6f9d7badafd0b67bd" EXCLUDE USING gist ("allocated_node_ids_range" WITH &&), CONSTRAINT "PK_5b3b5740a68800709cc38868e2a" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "public"."core"`);
    await queryRunner.query(`DROP TYPE "public"."core_core_size_enum"`);
  }
}
