import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1760925442790 implements MigrationInterface {
    name = 'Init1760925442790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "PhoneNumber_User" ("id_phone" uniqueidentifier NOT NULL CONSTRAINT "DF_fda56775b3e828a758b3d3f7867" DEFAULT NEWSEQUENTIALID(), "id_user" uniqueidentifier NOT NULL, "phone_number" varchar(20) NOT NULL, CONSTRAINT "PK_fda56775b3e828a758b3d3f7867" PRIMARY KEY ("id_phone"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id_role" int NOT NULL IDENTITY(1,1), "role_name" varchar(50) NOT NULL, CONSTRAINT "UQ_ac35f51a0f17e3e1fe121126039" UNIQUE ("role_name"), CONSTRAINT "PK_3ebdb96dd6787bda0e3c8f89d66" PRIMARY KEY ("id_role"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id_user" uniqueidentifier NOT NULL CONSTRAINT "DF_762fedc5a858bbb008722708ccd" DEFAULT NEWSEQUENTIALID(), "alias" varchar(50) NOT NULL, "email" varchar(100) NOT NULL, "nombre" varchar(50) NOT NULL, "apellido1" varchar(50) NOT NULL, "apellido2" varchar(50), "password" varchar(255) NOT NULL, "country_origin" varchar(100) NOT NULL, "status" bit NOT NULL CONSTRAINT "DF_a2ee79d58d56e7e79d048030091" DEFAULT 1, "id_role" int NOT NULL, "token_version" int NOT NULL CONSTRAINT "DF_4caf39e03bf3f4e85f4ccfc924f" DEFAULT 0, CONSTRAINT "PK_762fedc5a858bbb008722708ccd" PRIMARY KEY ("id_user"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_86c1ab44c24b70ce469068f9c6" ON "usuarios" ("alias") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_446adfc18b35418aac32ae0b7b" ON "usuarios" ("email") `);
        await queryRunner.query(`CREATE TABLE "recarga" ("id_recarga" int NOT NULL IDENTITY(1,1), "id_wallet" int NOT NULL, "monto" decimal(10,2) NOT NULL, "fecha_hora" datetime2 NOT NULL CONSTRAINT "DF_37c5fbfba67129199a97366cce3" DEFAULT getdate(), CONSTRAINT "CHK_311dd7a62f5ad78a856812709c" CHECK ("monto" > 0), CONSTRAINT "PK_8871e351843734cb810afa5cfe4" PRIMARY KEY ("id_recarga"))`);
        await queryRunner.query(`CREATE TABLE "wallet" ("id_wallet" int NOT NULL IDENTITY(1,1), "id_user" uniqueidentifier NOT NULL, "saldo" decimal(10,2) NOT NULL CONSTRAINT "DF_435d6261bd80a552fcc72cbd7ca" DEFAULT 0, "categoria" nvarchar(50) NOT NULL, "limite_diario" decimal(10,2) NOT NULL, "consumo_diario" decimal(10,2) NOT NULL CONSTRAINT "DF_47f5efefb36304070dad826490f" DEFAULT 0, CONSTRAINT "UQ_1079a248779c565ecfb24dfcf92" UNIQUE ("id_user"), CONSTRAINT "CHK_94c0b622a5bec95341b60e4716" CHECK ("categoria" IN ('Junior', 'Mid', 'Senior')), CONSTRAINT "PK_e1faf1a2071e19335595cfbad1e" PRIMARY KEY ("id_wallet"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_1079a248779c565ecfb24dfcf9" ON "wallet" ("id_user") WHERE "id_user" IS NOT NULL`);
        await queryRunner.query(`CREATE TABLE "mercado" ("id_mercado" int NOT NULL IDENTITY(1,1), "nombre" varchar(35) NOT NULL, "estado" varchar(15) NOT NULL, "moneda" varchar(5) NOT NULL, CONSTRAINT "UQ_cd029c805ebe7a9085206c25ac2" UNIQUE ("nombre"), CONSTRAINT "PK_d511482b3f94a3232b839561a9d" PRIMARY KEY ("id_mercado"))`);
        await queryRunner.query(`CREATE TABLE "precio_historico" ("id_precio_hist" int NOT NULL IDENTITY(1,1), "id_empresa" int NOT NULL, "precio" decimal(10,4) NOT NULL, "fecha_hora" datetime2 NOT NULL CONSTRAINT "DF_a7551282e0c348adaf1f1421d82" DEFAULT getdate(), CONSTRAINT "CHK_5d34dd3d8bf9a73f79e4e17637" CHECK ("precio" >= 0), CONSTRAINT "PK_f1a0def8b20196071984d66337f" PRIMARY KEY ("id_precio_hist"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b563b1d3517cd00923ac53658c" ON "precio_historico" ("id_empresa", "fecha_hora") `);
        await queryRunner.query(`CREATE TABLE "empresa" ("id_empresa" int NOT NULL IDENTITY(1,1), "id_mercado" int NOT NULL, "nombre" varchar(35) NOT NULL, "acciones_totales" bigint NOT NULL, "acciones_disponibles" bigint NOT NULL, "capital_actual" decimal(10,2) NOT NULL, "estado" varchar(15) NOT NULL, "justificacion_delistar" varchar(35), CONSTRAINT "UQ_fb0e2384af944c2fb6ac781c625" UNIQUE ("nombre"), CONSTRAINT "CHK_40dcf5529a8a5acaa5282f079c" CHECK ("capital_actual" >= 0), CONSTRAINT "CHK_de597f03322b20ff7c23cf81c4" CHECK ("estado" IN ('Listado', 'No Listado')), CONSTRAINT "CHK_1cd1d640e95b1e551260aeec85" CHECK ("acciones_disponibles" >= 0), CONSTRAINT "CHK_b2012343abf67454f6351a8f53" CHECK ("acciones_totales" >= 0), CONSTRAINT "PK_5ba2e4397739ba6b0207476c81e" PRIMARY KEY ("id_empresa"))`);
        await queryRunner.query(`CREATE TABLE "transaccion" ("id_transaccion" int NOT NULL IDENTITY(1,1), "id_user" uniqueidentifier NOT NULL, "id_empresa" int NOT NULL, "tipo" nvarchar(50) NOT NULL, "cantidad" int NOT NULL, "precio" decimal(10,2) NOT NULL, "fecha_hora" datetime2 NOT NULL CONSTRAINT "DF_1aee4d714a36878b604b2abc75f" DEFAULT getdate(), CONSTRAINT "CHK_761d46d733c48f16012a32fa1c" CHECK ("precio" >= 0), CONSTRAINT "CHK_8565e99c9c6675d1bf5beff093" CHECK ("tipo" IN ('Buy', 'Sell')), CONSTRAINT "PK_c17ac5ef05e8083b1f17dba320f" PRIMARY KEY ("id_transaccion"))`);
        await queryRunner.query(`CREATE TABLE "cartera_trader" ("id_cartera_trader" int NOT NULL IDENTITY(1,1), "id_user" uniqueidentifier NOT NULL, "id_empresa" int NOT NULL, "cantidad_acciones" int NOT NULL, "costo_promedio" decimal(10,2) NOT NULL, CONSTRAINT "CHK_c6b143229e41d9e1f691319715" CHECK ("costo_promedio" >= 0), CONSTRAINT "CHK_e326eb489f5d2f2f286cc57410" CHECK ("cantidad_acciones" >= 0), CONSTRAINT "PK_ce28a586f1a5cf130e12fd0231b" PRIMARY KEY ("id_cartera_trader"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fd2e9b3fb743bdd44e23d6cfd9" ON "cartera_trader" ("id_user", "id_empresa") `);
        await queryRunner.query(`CREATE TABLE "auditoria" ("id_auditoria" uniqueidentifier NOT NULL CONSTRAINT "DF_9c9ae9e15c3caf7d555c6b9f354" DEFAULT NEWSEQUENTIALID(), "id_user" uniqueidentifier, "user_alias" varchar(50), "user_role" varchar(20), "accion" varchar(50) NOT NULL, "entidad_afectada" varchar(50) NOT NULL, "id_registro_afectado" uniqueidentifier, "ticker_empresa" varchar(10), "cantidad_acciones" int, "precio_operacion" decimal(15,2), "monto_operacion" decimal(15,2), "saldo_anterior" decimal(15,2), "saldo_nuevo" decimal(15,2), "justificacion" text, "requiere_confirmacion" bit NOT NULL CONSTRAINT "DF_e432b71eed207056e06c4c240f1" DEFAULT 0, "descripcion" text, "fecha_hora" datetime2 NOT NULL CONSTRAINT "DF_beca173a6410c1e4e4230cb181f" DEFAULT getdate(), "exitosa" bit NOT NULL CONSTRAINT "DF_2c05e36f562d50ced01cb2f1c8f" DEFAULT 1, "mensaje_error" text, CONSTRAINT "PK_9c9ae9e15c3caf7d555c6b9f354" PRIMARY KEY ("id_auditoria"))`);
        await queryRunner.query(`ALTER TABLE "PhoneNumber_User" ADD CONSTRAINT "FK_86cf8f81322568fd0fd3cb4f830" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_c3b96775833e656856573e19334" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recarga" ADD CONSTRAINT "FK_595fbbcc1fab4ea343b73f21c22" FOREIGN KEY ("id_wallet") REFERENCES "wallet"("id_wallet") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_1079a248779c565ecfb24dfcf92" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "precio_historico" ADD CONSTRAINT "FK_2c528e409b7c24671214c65f6a0" FOREIGN KEY ("id_empresa") REFERENCES "empresa"("id_empresa") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "empresa" ADD CONSTRAINT "FK_059e05ba5dd66c119eb44de19cb" FOREIGN KEY ("id_mercado") REFERENCES "mercado"("id_mercado") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaccion" ADD CONSTRAINT "FK_84511f3f65763d8bd1785ca1872" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaccion" ADD CONSTRAINT "FK_70bb0ba967bb7f2d506f28cbf93" FOREIGN KEY ("id_empresa") REFERENCES "empresa"("id_empresa") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cartera_trader" ADD CONSTRAINT "FK_f50d9b26744c461d9d4bf16dcbd" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cartera_trader" ADD CONSTRAINT "FK_c6d3c2972ceda78bf77a8af905b" FOREIGN KEY ("id_empresa") REFERENCES "empresa"("id_empresa") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auditoria" ADD CONSTRAINT "FK_2a391b3092635e1a7ef4344a566" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auditoria" DROP CONSTRAINT "FK_2a391b3092635e1a7ef4344a566"`);
        await queryRunner.query(`ALTER TABLE "cartera_trader" DROP CONSTRAINT "FK_c6d3c2972ceda78bf77a8af905b"`);
        await queryRunner.query(`ALTER TABLE "cartera_trader" DROP CONSTRAINT "FK_f50d9b26744c461d9d4bf16dcbd"`);
        await queryRunner.query(`ALTER TABLE "transaccion" DROP CONSTRAINT "FK_70bb0ba967bb7f2d506f28cbf93"`);
        await queryRunner.query(`ALTER TABLE "transaccion" DROP CONSTRAINT "FK_84511f3f65763d8bd1785ca1872"`);
        await queryRunner.query(`ALTER TABLE "empresa" DROP CONSTRAINT "FK_059e05ba5dd66c119eb44de19cb"`);
        await queryRunner.query(`ALTER TABLE "precio_historico" DROP CONSTRAINT "FK_2c528e409b7c24671214c65f6a0"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_1079a248779c565ecfb24dfcf92"`);
        await queryRunner.query(`ALTER TABLE "recarga" DROP CONSTRAINT "FK_595fbbcc1fab4ea343b73f21c22"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_c3b96775833e656856573e19334"`);
        await queryRunner.query(`ALTER TABLE "PhoneNumber_User" DROP CONSTRAINT "FK_86cf8f81322568fd0fd3cb4f830"`);
        await queryRunner.query(`DROP TABLE "auditoria"`);
        await queryRunner.query(`DROP INDEX "IDX_fd2e9b3fb743bdd44e23d6cfd9" ON "cartera_trader"`);
        await queryRunner.query(`DROP TABLE "cartera_trader"`);
        await queryRunner.query(`DROP TABLE "transaccion"`);
        await queryRunner.query(`DROP TABLE "empresa"`);
        await queryRunner.query(`DROP INDEX "IDX_b563b1d3517cd00923ac53658c" ON "precio_historico"`);
        await queryRunner.query(`DROP TABLE "precio_historico"`);
        await queryRunner.query(`DROP TABLE "mercado"`);
        await queryRunner.query(`DROP INDEX "REL_1079a248779c565ecfb24dfcf9" ON "wallet"`);
        await queryRunner.query(`DROP TABLE "wallet"`);
        await queryRunner.query(`DROP TABLE "recarga"`);
        await queryRunner.query(`DROP INDEX "IDX_446adfc18b35418aac32ae0b7b" ON "usuarios"`);
        await queryRunner.query(`DROP INDEX "IDX_86c1ab44c24b70ce469068f9c6" ON "usuarios"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "PhoneNumber_User"`);
    }

}
