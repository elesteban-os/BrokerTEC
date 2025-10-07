import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRoles1759820300000 implements MigrationInterface {
    name = 'SeedRoles1759820300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insertar los 3 roles básicos del sistema
        await queryRunner.query(`
            INSERT INTO roles (role_name) VALUES 
            ('ADMINISTRADOR'),
            ('ANALISTA'),
            ('TRADER')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar los roles creados
        await queryRunner.query(`
            DELETE FROM roles WHERE role_name IN ('ADMINISTRADOR', 'ANALISTA', 'TRADER')
        `);
    }
}