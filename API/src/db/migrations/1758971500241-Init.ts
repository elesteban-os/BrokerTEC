import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758971500241 implements MigrationInterface {
    name = 'Init1758971500241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" int NOT NULL IDENTITY(1,1), "alias" nvarchar(255) NOT NULL, "role" nvarchar(255) NOT NULL CONSTRAINT "DF_6620cd026ee2b231beac7cfe578" DEFAULT 'TRADER', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1d5324dc4f0c41f17ebe4bf5ab" ON "user" ("alias") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_1d5324dc4f0c41f17ebe4bf5ab" ON "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}