import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUserTable1759830000000 implements MigrationInterface {
    name = 'DropUserTable1759830000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            IF EXISTS (
                SELECT 1 FROM sys.indexes 
                WHERE name = 'IDX_1d5324dc4f0c41f17ebe4bf5ab' 
                  AND object_id = OBJECT_ID('user')
            )
            DROP INDEX "IDX_1d5324dc4f0c41f17ebe4bf5ab" ON "user";
        `);

        await queryRunner.query(`
            IF OBJECT_ID('user', 'U') IS NOT NULL
            DROP TABLE "user";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            IF OBJECT_ID('user', 'U') IS NULL
            CREATE TABLE "user" (
                "id" int NOT NULL IDENTITY(1,1),
                "alias" nvarchar(255) NOT NULL,
                "role" nvarchar(255) NOT NULL CONSTRAINT "DF_6620cd026ee2b231beac7cfe578" DEFAULT 'TRADER',
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            );
        `);

        await queryRunner.query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.indexes 
                WHERE name = 'IDX_1d5324dc4f0c41f17ebe4bf5ab' 
                  AND object_id = OBJECT_ID('user')
            )
            CREATE UNIQUE INDEX "IDX_1d5324dc4f0c41f17ebe4bf5ab" ON "user" ("alias");
        `);
    }

}
