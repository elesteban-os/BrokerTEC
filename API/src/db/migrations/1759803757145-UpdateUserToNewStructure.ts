import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserToNewStructure1759803757145 implements MigrationInterface {
    name = 'UpdateUserToNewStructure1759803757145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "usuarios" ("id_user" uniqueidentifier NOT NULL CONSTRAINT "DF_762fedc5a858bbb008722708ccd" DEFAULT NEWSEQUENTIALID(), "alias" varchar(50) NOT NULL, "email" varchar(100) NOT NULL, "nombre" varchar(50) NOT NULL, "apellido1" varchar(50) NOT NULL, "apellido2" varchar(50), "password" varchar(255) NOT NULL, "country_origin" varchar(100) NOT NULL, "status" bit NOT NULL CONSTRAINT "DF_a2ee79d58d56e7e79d048030091" DEFAULT 1, CONSTRAINT "PK_762fedc5a858bbb008722708ccd" PRIMARY KEY ("id_user"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_86c1ab44c24b70ce469068f9c6" ON "usuarios" ("alias") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_446adfc18b35418aac32ae0b7b" ON "usuarios" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_446adfc18b35418aac32ae0b7b" ON "usuarios"`);
        await queryRunner.query(`DROP INDEX "IDX_86c1ab44c24b70ce469068f9c6" ON "usuarios"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
    }

}
