import { MigrationInterface, QueryRunner } from 'typeorm';

export class WalletOneToOne1700000000000 implements MigrationInterface {
  name = 'WalletOneToOne1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Asegurar columna id_user en wallets (no borra nada si ya existe)
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'id_user' AND Object_ID = Object_ID(N'wallets')
      )
      BEGIN
        ALTER TABLE wallets ADD id_user uniqueidentifier NULL;
      END
    `);

    // 2) Crear índice UNIQUE filtrado (1:1 por usuario) si no existe
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = N'UQ_wallets_id_user' AND object_id = OBJECT_ID(N'wallets')
      )
      BEGIN
        CREATE UNIQUE INDEX UQ_wallets_id_user ON wallets(id_user) WHERE id_user IS NOT NULL;
      END
    `);

    // 3) Asegurar FK hacia 'usuarios(id_user)' con ON DELETE CASCADE
    //    Si ya existe cualquier FK en wallets(id_user) apuntando a usuarios, no crear otra para evitar duplicados
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys fk
        JOIN sys.tables t ON t.object_id = fk.parent_object_id
        WHERE t.name = N'wallets'
          AND fk.referenced_object_id = OBJECT_ID(N'usuarios')
      )
      BEGIN
        ALTER TABLE wallets
        ADD CONSTRAINT FK_wallets_usuarios_id_user
        FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE CASCADE;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir sin borrar datos
    await queryRunner.query(`
      IF EXISTS (
        SELECT * FROM sys.foreign_keys 
        WHERE name = N'FK_wallets_usuarios_id_user'
      )
      BEGIN
        ALTER TABLE wallets DROP CONSTRAINT FK_wallets_usuarios_id_user;
      END
    `);

    await queryRunner.query(`
      IF EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = N'UQ_wallets_id_user' AND object_id = OBJECT_ID(N'wallets')
      )
      BEGIN
        DROP INDEX UQ_wallets_id_user ON wallets;
      END
    `);

    
  }
}
