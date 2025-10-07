import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTokenVersionToUserAndEntityAuditoria1759827904174 implements MigrationInterface {
    name = 'AddTokenVersionToUserAndEntityAuditoria1759827904174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auditoria" ("id_auditoria" uniqueidentifier NOT NULL CONSTRAINT "DF_9c9ae9e15c3caf7d555c6b9f354" DEFAULT NEWSEQUENTIALID(), "id_user" uniqueidentifier, "user_alias" varchar(50), "user_role" varchar(20), "accion" varchar(50) NOT NULL, "entidad_afectada" varchar(50) NOT NULL, "id_registro_afectado" uniqueidentifier, "ticker_empresa" varchar(10), "cantidad_acciones" int, "precio_operacion" decimal(15,2), "monto_operacion" decimal(15,2), "saldo_anterior" decimal(15,2), "saldo_nuevo" decimal(15,2), "justificacion" text, "requiere_confirmacion" bit NOT NULL CONSTRAINT "DF_e432b71eed207056e06c4c240f1" DEFAULT 0, "descripcion" text, "fecha_hora" datetime2 NOT NULL CONSTRAINT "DF_beca173a6410c1e4e4230cb181f" DEFAULT getdate(), "exitosa" bit NOT NULL CONSTRAINT "DF_2c05e36f562d50ced01cb2f1c8f" DEFAULT 1, "mensaje_error" text, CONSTRAINT "PK_9c9ae9e15c3caf7d555c6b9f354" PRIMARY KEY ("id_auditoria"))`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "token_version" int NOT NULL CONSTRAINT "DF_4caf39e03bf3f4e85f4ccfc924f" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_c3b96775833e656856573e19334"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "id_role" int NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_c3b96775833e656856573e19334" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auditoria" ADD CONSTRAINT "FK_2a391b3092635e1a7ef4344a566" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auditoria" DROP CONSTRAINT "FK_2a391b3092635e1a7ef4344a566"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_c3b96775833e656856573e19334"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "id_role" int`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_c3b96775833e656856573e19334" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "DF_4caf39e03bf3f4e85f4ccfc924f"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "token_version"`);
        await queryRunner.query(`DROP TABLE "auditoria"`);
    }

}
