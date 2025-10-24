import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePhoneNumberUserTable1759808813866 implements MigrationInterface {
    name = 'CreatePhoneNumberUserTable1759808813866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "PhoneNumber_User" ("id_phone" uniqueidentifier NOT NULL CONSTRAINT "DF_fda56775b3e828a758b3d3f7867" DEFAULT NEWSEQUENTIALID(), "id_user" uniqueidentifier NOT NULL, "phone_number" varchar(20) NOT NULL, CONSTRAINT "PK_fda56775b3e828a758b3d3f7867" PRIMARY KEY ("id_phone"))`);
        await queryRunner.query(`ALTER TABLE "PhoneNumber_User" ADD CONSTRAINT "FK_86cf8f81322568fd0fd3cb4f830" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PhoneNumber_User" DROP CONSTRAINT "FK_86cf8f81322568fd0fd3cb4f830"`);
        await queryRunner.query(`DROP TABLE "PhoneNumber_User"`);
    }

}
