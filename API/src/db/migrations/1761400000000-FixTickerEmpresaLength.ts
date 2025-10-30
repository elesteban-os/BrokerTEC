import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTickerEmpresaLength1761400000000 implements MigrationInterface {
    name = 'FixTickerEmpresaLength1761400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Aumentar el tamaño de la columna ticker_empresa de varchar(10) a varchar(100)
        await queryRunner.query(`ALTER TABLE "auditoria" ALTER COLUMN "ticker_empresa" varchar(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir a varchar(10) si es necesario
        await queryRunner.query(`ALTER TABLE "auditoria" ALTER COLUMN "ticker_empresa" varchar(10)`);
    }
}
