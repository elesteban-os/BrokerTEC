import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMercadosAndEmpresas1761027982101 implements MigrationInterface {
    name = 'CreateMercadosAndEmpresas1761027982101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "precios_historicos" ("id_precio" int NOT NULL IDENTITY(1,1), "id_empresa" int NOT NULL, "precio" decimal(15,2) NOT NULL, "fecha_hora" datetime2 NOT NULL CONSTRAINT "DF_b3558138def7782759f293be1dd" DEFAULT getdate(), CONSTRAINT "PK_861b2f146347c6f249e3de395f7" PRIMARY KEY ("id_precio"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bf235856f0f4cc7a5683b55452" ON "precios_historicos" ("id_empresa", "fecha_hora") `);
        await queryRunner.query(`CREATE TABLE "empresas" ("id_empresa" int NOT NULL IDENTITY(1,1), "nombre" varchar(200) NOT NULL, "id_mercado" int NOT NULL, "precio_actual" decimal(15,2) NOT NULL, "cantidad_acciones" int NOT NULL, "habilitado" bit NOT NULL CONSTRAINT "DF_f28f5266570dfdf44970e9dd49e" DEFAULT 1, "fecha_creacion" datetime2 NOT NULL CONSTRAINT "DF_4028caf01c14e993f74d80a65fb" DEFAULT getdate(), CONSTRAINT "PK_b14c38cf8cfb35f23b693d0afb0" PRIMARY KEY ("id_empresa"))`);
        await queryRunner.query(`CREATE TABLE "mercados" ("id_mercado" int NOT NULL IDENTITY(1,1), "nombre" varchar(100) NOT NULL, "habilitado" bit NOT NULL CONSTRAINT "DF_14762fe2c6be13bc607e05b7c54" DEFAULT 1, "fecha_creacion" datetime2 NOT NULL CONSTRAINT "DF_729eed0a90ca4237558436e1d42" DEFAULT getdate(), CONSTRAINT "PK_ff8ef4f31403276e20905f9d408" PRIMARY KEY ("id_mercado"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6448ae16919f81d5086514dd39" ON "mercados" ("nombre") `);
        await queryRunner.query(`ALTER TABLE "precios_historicos" ADD CONSTRAINT "FK_3e3f05d49866ca6b0f4de16556d" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "empresas" ADD CONSTRAINT "FK_b0cf8c53e53e9a02a6db0ccc144" FOREIGN KEY ("id_mercado") REFERENCES "mercados"("id_mercado") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "empresas" DROP CONSTRAINT "FK_b0cf8c53e53e9a02a6db0ccc144"`);
        await queryRunner.query(`ALTER TABLE "precios_historicos" DROP CONSTRAINT "FK_3e3f05d49866ca6b0f4de16556d"`);
        await queryRunner.query(`DROP INDEX "IDX_6448ae16919f81d5086514dd39" ON "mercados"`);
        await queryRunner.query(`DROP TABLE "mercados"`);
        await queryRunner.query(`DROP TABLE "empresas"`);
        await queryRunner.query(`DROP INDEX "IDX_bf235856f0f4cc7a5683b55452" ON "precios_historicos"`);
        await queryRunner.query(`DROP TABLE "precios_historicos"`);
    }

}
