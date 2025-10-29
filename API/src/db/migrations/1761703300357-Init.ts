import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1761703300357 implements MigrationInterface {
    name = 'Init1761703300357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "PhoneNumber_User" ("id_phone" int NOT NULL IDENTITY(1,1), "id_user" int NOT NULL, "phone_number" varchar(20) NOT NULL, CONSTRAINT "PK_fda56775b3e828a758b3d3f7867" PRIMARY KEY ("id_phone"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id_role" int NOT NULL IDENTITY(1,1), "role_name" varchar(50) NOT NULL, CONSTRAINT "UQ_ac35f51a0f17e3e1fe121126039" UNIQUE ("role_name"), CONSTRAINT "PK_3ebdb96dd6787bda0e3c8f89d66" PRIMARY KEY ("id_role"))`);
        await queryRunner.query(`CREATE TABLE "mercados" ("id_mercado" int NOT NULL IDENTITY(1,1), "nombre" varchar(100) NOT NULL, "habilitado" bit NOT NULL CONSTRAINT "DF_14762fe2c6be13bc607e05b7c54" DEFAULT 1, "fecha_creacion" datetime2 NOT NULL CONSTRAINT "DF_729eed0a90ca4237558436e1d42" DEFAULT getdate(), CONSTRAINT "PK_ff8ef4f31403276e20905f9d408" PRIMARY KEY ("id_mercado"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6448ae16919f81d5086514dd39" ON "mercados" ("nombre") `);
        await queryRunner.query(`CREATE TABLE "precios_historicos" ("id_precio" int NOT NULL IDENTITY(1,1), "id_empresa" int NOT NULL, "precio" decimal(15,2) NOT NULL, "fecha_hora" datetime2 NOT NULL CONSTRAINT "DF_b3558138def7782759f293be1dd" DEFAULT getdate(), CONSTRAINT "PK_861b2f146347c6f249e3de395f7" PRIMARY KEY ("id_precio"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bf235856f0f4cc7a5683b55452" ON "precios_historicos" ("id_empresa", "fecha_hora") `);
        await queryRunner.query(`CREATE TABLE "empresas" ("id_empresa" int NOT NULL IDENTITY(1,1), "nombre" varchar(200) NOT NULL, "id_mercado" int NOT NULL, "precio_actual" decimal(15,2) NOT NULL, "cantidad_acciones" int NOT NULL, "habilitado" bit NOT NULL CONSTRAINT "DF_f28f5266570dfdf44970e9dd49e" DEFAULT 1, "fecha_creacion" datetime2 NOT NULL CONSTRAINT "DF_4028caf01c14e993f74d80a65fb" DEFAULT getdate(), CONSTRAINT "PK_b14c38cf8cfb35f23b693d0afb0" PRIMARY KEY ("id_empresa"))`);
        await queryRunner.query(`CREATE TABLE "posiciones" ("id_posicion" int NOT NULL IDENTITY(1,1), "id_user" int NOT NULL, "id_empresa" int NOT NULL, "cantidad" int NOT NULL CONSTRAINT "DF_498cb9fc9bf47cb91c45579e5ee" DEFAULT 0, "costo_promedio" decimal(15,2) NOT NULL CONSTRAINT "DF_4b1497fe6ad1f29ab923780ff1e" DEFAULT 0, "fecha_creacion" datetime2 NOT NULL CONSTRAINT "DF_476b87a21c78d9bebb31edc8b52" DEFAULT getdate(), "fecha_actualizacion" datetime2 NOT NULL CONSTRAINT "DF_267684ef61b51cbd8b9addeb85c" DEFAULT getdate(), CONSTRAINT "PK_9ba916c88866c488297543c1c92" PRIMARY KEY ("id_posicion"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id_user" int NOT NULL IDENTITY(1,1), "alias" varchar(50) NOT NULL, "email" varchar(100) NOT NULL, "nombre" varchar(50) NOT NULL, "apellido1" varchar(50) NOT NULL, "apellido2" varchar(50), "password" varchar(255) NOT NULL, "country_origin" varchar(100) NOT NULL, "status" bit NOT NULL CONSTRAINT "DF_a2ee79d58d56e7e79d048030091" DEFAULT 1, "id_role" int NOT NULL, "token_version" int NOT NULL CONSTRAINT "DF_4caf39e03bf3f4e85f4ccfc924f" DEFAULT 0, CONSTRAINT "PK_762fedc5a858bbb008722708ccd" PRIMARY KEY ("id_user"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_86c1ab44c24b70ce469068f9c6" ON "usuarios" ("alias") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_446adfc18b35418aac32ae0b7b" ON "usuarios" ("email") `);
        await queryRunner.query(`CREATE TABLE "wallets" ("id_wallet" int NOT NULL IDENTITY(1,1), "id_user" int NOT NULL, "saldo" decimal(15,2) NOT NULL CONSTRAINT "DF_56d413337ae6cb0c892dbc1ef15" DEFAULT 0, "categoria" varchar(10) NOT NULL CONSTRAINT "DF_7b91fe8febbbabcc4be14ec183b" DEFAULT 'JUNIOR', "limite_diario" decimal(15,2) NOT NULL CONSTRAINT "DF_f1fb7f9a5753c268fbab37a4805" DEFAULT 0, "consumo_dia" decimal(15,2) NOT NULL CONSTRAINT "DF_ce256ad70d01313fd1714dd27cd" DEFAULT 0, "fecha_ultima_recarga" date, "fecha_creacion" datetime2 NOT NULL CONSTRAINT "DF_ae0e6a1c267d6fd369702517f72" DEFAULT getdate(), CONSTRAINT "UQ_afda9ef5337d4c564cae4fea9c1" UNIQUE ("id_user"), CONSTRAINT "PK_fa9779ed321f5258b9848409df0" PRIMARY KEY ("id_wallet"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_afda9ef5337d4c564cae4fea9c" ON "wallets" ("id_user") WHERE "id_user" IS NOT NULL`);
        await queryRunner.query(`CREATE TABLE "auditoria" ("id_auditoria" int NOT NULL IDENTITY(1,1), "id_user" int, "user_alias" varchar(50), "user_role" varchar(20), "accion" varchar(50) NOT NULL, "entidad_afectada" varchar(50) NOT NULL, "id_registro_afectado" int, "ticker_empresa" varchar(100), "cantidad_acciones" int, "precio_operacion" decimal(15,2), "monto_operacion" decimal(15,2), "saldo_anterior" decimal(15,2), "saldo_nuevo" decimal(15,2), "ganancia_perdida" decimal(15,2), "justificacion" text, "requiere_confirmacion" bit NOT NULL CONSTRAINT "DF_e432b71eed207056e06c4c240f1" DEFAULT 0, "descripcion" text, "fecha_hora" datetime2 NOT NULL CONSTRAINT "DF_beca173a6410c1e4e4230cb181f" DEFAULT getdate(), "exitosa" bit NOT NULL CONSTRAINT "DF_2c05e36f562d50ced01cb2f1c8f" DEFAULT 1, "mensaje_error" text, CONSTRAINT "PK_9c9ae9e15c3caf7d555c6b9f354" PRIMARY KEY ("id_auditoria"))`);
        await queryRunner.query(`ALTER TABLE "PhoneNumber_User" ADD CONSTRAINT "FK_86cf8f81322568fd0fd3cb4f830" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "precios_historicos" ADD CONSTRAINT "FK_3e3f05d49866ca6b0f4de16556d" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "empresas" ADD CONSTRAINT "FK_b0cf8c53e53e9a02a6db0ccc144" FOREIGN KEY ("id_mercado") REFERENCES "mercados"("id_mercado") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posiciones" ADD CONSTRAINT "FK_b38c27651ada70e824aff95e534" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posiciones" ADD CONSTRAINT "FK_6bb3051551a2b24fe3f40f1ba95" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_c3b96775833e656856573e19334" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_afda9ef5337d4c564cae4fea9c1" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auditoria" ADD CONSTRAINT "FK_2a391b3092635e1a7ef4344a566" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auditoria" DROP CONSTRAINT "FK_2a391b3092635e1a7ef4344a566"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_afda9ef5337d4c564cae4fea9c1"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_c3b96775833e656856573e19334"`);
        await queryRunner.query(`ALTER TABLE "posiciones" DROP CONSTRAINT "FK_6bb3051551a2b24fe3f40f1ba95"`);
        await queryRunner.query(`ALTER TABLE "posiciones" DROP CONSTRAINT "FK_b38c27651ada70e824aff95e534"`);
        await queryRunner.query(`ALTER TABLE "empresas" DROP CONSTRAINT "FK_b0cf8c53e53e9a02a6db0ccc144"`);
        await queryRunner.query(`ALTER TABLE "precios_historicos" DROP CONSTRAINT "FK_3e3f05d49866ca6b0f4de16556d"`);
        await queryRunner.query(`ALTER TABLE "PhoneNumber_User" DROP CONSTRAINT "FK_86cf8f81322568fd0fd3cb4f830"`);
        await queryRunner.query(`DROP TABLE "auditoria"`);
        await queryRunner.query(`DROP INDEX "REL_afda9ef5337d4c564cae4fea9c" ON "wallets"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP INDEX "IDX_446adfc18b35418aac32ae0b7b" ON "usuarios"`);
        await queryRunner.query(`DROP INDEX "IDX_86c1ab44c24b70ce469068f9c6" ON "usuarios"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "posiciones"`);
        await queryRunner.query(`DROP TABLE "empresas"`);
        await queryRunner.query(`DROP INDEX "IDX_bf235856f0f4cc7a5683b55452" ON "precios_historicos"`);
        await queryRunner.query(`DROP TABLE "precios_historicos"`);
        await queryRunner.query(`DROP INDEX "IDX_6448ae16919f81d5086514dd39" ON "mercados"`);
        await queryRunner.query(`DROP TABLE "mercados"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "PhoneNumber_User"`);
    }

}
