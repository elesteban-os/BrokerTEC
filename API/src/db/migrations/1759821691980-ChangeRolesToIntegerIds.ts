import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeRolesToIntegerIds1759821691980 implements MigrationInterface {
    name = 'ChangeRolesToIntegerIds1759821691980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Eliminar la foreign key constraint
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_c3b96775833e656856573e19334"`);
        
        // 2. Crear nueva tabla de roles con integer ID
        await queryRunner.query(`
            CREATE TABLE "roles_new" (
                "id_role" int NOT NULL IDENTITY(1,1), 
                "role_name" varchar(50) NOT NULL, 
                CONSTRAINT "UQ_ac35f51a0f17e3e1fe121126039_new" UNIQUE ("role_name"), 
                CONSTRAINT "PK_3ebdb96dd6787bda0e3c8f89d66_new" PRIMARY KEY ("id_role")
            )
        `);
        
        // 3. Insertar los roles con IDs fijos
        await queryRunner.query(`
            INSERT INTO roles_new (role_name) VALUES
            ('ADMINISTRADOR'),
            ('ANALISTA'),
            ('TRADER')
        `);
        
        // 4. Agregar columna temporal en usuarios para mapear
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "id_role_new" int`);
        
        // 5. Mapear los roles existentes a los nuevos IDs
        await queryRunner.query(`
            UPDATE usuarios 
            SET id_role_new = CASE 
                WHEN r.role_name = 'ADMINISTRADOR' THEN 1
                WHEN r.role_name = 'ANALISTA' THEN 2
                WHEN r.role_name = 'TRADER' THEN 3
            END
            FROM usuarios u
            INNER JOIN roles r ON u.id_role = r.id_role
        `);
        
        // 6. Eliminar la columna antigua y renombrar la nueva
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "id_role"`);
        await queryRunner.query(`EXEC sp_rename 'usuarios.id_role_new', 'id_role', 'COLUMN'`);
        
        // 7. Eliminar tabla de roles antigua y renombrar la nueva
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`EXEC sp_rename 'roles_new', 'roles'`);
        await queryRunner.query(`EXEC sp_rename 'UQ_ac35f51a0f17e3e1fe121126039_new', 'UQ_ac35f51a0f17e3e1fe121126039'`);
        await queryRunner.query(`EXEC sp_rename 'PK_3ebdb96dd6787bda0e3c8f89d66_new', 'PK_3ebdb96dd6787bda0e3c8f89d66'`);
        
        // 8. Crear la nueva foreign key constraint
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_c3b96775833e656856573e19334" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir los cambios (complejo, pero factible)
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_c3b96775833e656856573e19334"`);
        
        // Recrear tabla roles con UUID
        await queryRunner.query(`
            CREATE TABLE "roles_old" (
                "id_role" uniqueidentifier NOT NULL DEFAULT NEWSEQUENTIALID(), 
                "role_name" varchar(50) NOT NULL, 
                CONSTRAINT "UQ_ac35f51a0f17e3e1fe121126039_old" UNIQUE ("role_name"), 
                CONSTRAINT "PK_3ebdb96dd6787bda0e3c8f89d66_old" PRIMARY KEY ("id_role")
            )
        `);
        
        await queryRunner.query(`
            INSERT INTO roles_old (role_name) VALUES
            ('ADMINISTRADOR'),
            ('ANALISTA'),
            ('TRADER')
        `);
        
        // Actualizar usuarios con UUIDs (esto perdería las relaciones existentes)
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "id_role_old" uniqueidentifier`);
        
        await queryRunner.query(`
            UPDATE usuarios 
            SET id_role_old = r.id_role
            FROM usuarios u
            INNER JOIN roles_old r ON (
                (u.id_role = 1 AND r.role_name = 'ADMINISTRADOR') OR
                (u.id_role = 2 AND r.role_name = 'ANALISTA') OR
                (u.id_role = 3 AND r.role_name = 'TRADER')
            )
        `);
        
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "id_role"`);
        await queryRunner.query(`EXEC sp_rename 'usuarios.id_role_old', 'id_role', 'COLUMN'`);
        
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`EXEC sp_rename 'roles_old', 'roles'`);
        
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_c3b96775833e656856573e19334" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
