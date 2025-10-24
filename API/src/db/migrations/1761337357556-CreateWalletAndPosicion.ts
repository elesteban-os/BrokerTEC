import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWalletAndPosicion1761337357556 implements MigrationInterface {
    name = 'CreateWalletAndPosicion1761337357556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "posiciones" ("id_posicion" int NOT NULL IDENTITY(1,1), "id_user" int NOT NULL, "id_empresa" int NOT NULL, "cantidad" int NOT NULL CONSTRAINT "DF_498cb9fc9bf47cb91c45579e5ee" DEFAULT 0, "costo_promedio" decimal(15,2) NOT NULL CONSTRAINT "DF_4b1497fe6ad1f29ab923780ff1e" DEFAULT 0, "fecha_creacion" datetime2 NOT NULL CONSTRAINT "DF_476b87a21c78d9bebb31edc8b52" DEFAULT getdate(), "fecha_actualizacion" datetime2 NOT NULL CONSTRAINT "DF_267684ef61b51cbd8b9addeb85c" DEFAULT getdate(), CONSTRAINT "PK_9ba916c88866c488297543c1c92" PRIMARY KEY ("id_posicion"))`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id_wallet" int NOT NULL IDENTITY(1,1), "id_user" int NOT NULL, "saldo" decimal(15,2) NOT NULL CONSTRAINT "DF_56d413337ae6cb0c892dbc1ef15" DEFAULT 0, "categoria" varchar(10) NOT NULL CONSTRAINT "DF_7b91fe8febbbabcc4be14ec183b" DEFAULT 'JUNIOR', "limite_diario" decimal(15,2) NOT NULL CONSTRAINT "DF_f1fb7f9a5753c268fbab37a4805" DEFAULT 0, "consumo_dia" decimal(15,2) NOT NULL CONSTRAINT "DF_ce256ad70d01313fd1714dd27cd" DEFAULT 0, "fecha_ultima_recarga" date, "fecha_creacion" datetime2 NOT NULL CONSTRAINT "DF_ae0e6a1c267d6fd369702517f72" DEFAULT getdate(), CONSTRAINT "UQ_afda9ef5337d4c564cae4fea9c1" UNIQUE ("id_user"), CONSTRAINT "PK_fa9779ed321f5258b9848409df0" PRIMARY KEY ("id_wallet"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_afda9ef5337d4c564cae4fea9c" ON "wallets" ("id_user") WHERE "id_user" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "posiciones" ADD CONSTRAINT "FK_b38c27651ada70e824aff95e534" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posiciones" ADD CONSTRAINT "FK_6bb3051551a2b24fe3f40f1ba95" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_afda9ef5337d4c564cae4fea9c1" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_afda9ef5337d4c564cae4fea9c1"`);
        await queryRunner.query(`ALTER TABLE "posiciones" DROP CONSTRAINT "FK_6bb3051551a2b24fe3f40f1ba95"`);
        await queryRunner.query(`ALTER TABLE "posiciones" DROP CONSTRAINT "FK_b38c27651ada70e824aff95e534"`);
        await queryRunner.query(`DROP INDEX "REL_afda9ef5337d4c564cae4fea9c" ON "wallets"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TABLE "posiciones"`);
    }

}
