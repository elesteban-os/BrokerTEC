import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRolesAndUpdateUsers1759819398416 implements MigrationInterface {
    name = 'CreateRolesAndUpdateUsers1759819398416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "roles" ("id_role" uniqueidentifier NOT NULL CONSTRAINT "DF_3ebdb96dd6787bda0e3c8f89d66" DEFAULT NEWSEQUENTIALID(), "role_name" varchar(50) NOT NULL, CONSTRAINT "UQ_ac35f51a0f17e3e1fe121126039" UNIQUE ("role_name"), CONSTRAINT "PK_3ebdb96dd6787bda0e3c8f89d66" PRIMARY KEY ("id_role"))`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "id_role" uniqueidentifier`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_c3b96775833e656856573e19334" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_c3b96775833e656856573e19334"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "id_role"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
