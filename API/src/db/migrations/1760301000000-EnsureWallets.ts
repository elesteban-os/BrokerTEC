import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class EnsureWallets1760301000000 implements MigrationInterface {
  name = 'EnsureWallets1760301000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Si no existe la tabla 'wallets', créala
    const hasWallets = await queryRunner.hasTable('wallets');
    if (!hasWallets) {
      await queryRunner.createTable(
        new Table({
          name: 'wallets',
          columns: [
            {
              name: 'id_wallet',
              type: 'uniqueidentifier', // mssql: uniqueidentifier
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'uuid',
              default: 'NEWID()'
            },
            { name: 'id_user', type: 'uniqueidentifier', isNullable: true },
            { name: 'category', type: 'varchar', length: '10', default: `'JUNIOR'` },
            { name: 'balance', type: 'decimal', precision: 18, scale: 2, default: 0 },
            { name: 'daily_limit', type: 'decimal', precision: 18, scale: 2, default: 0 },
            { name: 'today_consumed', type: 'decimal', precision: 18, scale: 2, default: 0 },
            { name: 'last_consumed_date', type: 'date', isNullable: true },
            { name: 'currency', type: 'varchar', length: '10', default: `'USD'` },
            { name: 'created_at', type: 'datetime', default: 'GETDATE()' }
          ],
        }),
        true
      );
    }

    // 2) Asegura la columna id_user existe (si la tabla venía de antes sin ella)
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'id_user' AND Object_ID = Object_ID(N'wallets')
      )
      BEGIN
        ALTER TABLE wallets ADD id_user uniqueidentifier NULL;
      END
    `);

    // 3) Índice UNIQUE (1:1) en id_user
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = N'UQ_wallets_id_user' AND object_id = OBJECT_ID(N'wallets')
      )
      BEGIN
        CREATE UNIQUE INDEX UQ_wallets_id_user ON wallets(id_user) WHERE id_user IS NOT NULL;
      END
    `);

    // 4) FK hacia 'usuarios(id_user)' con ON DELETE CASCADE
    //    Solo crear si NO existe ninguna FK en wallets apuntando a usuarios
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
    // No tiramos la tabla para no perder datos
    // Solo quitamos FK e índice si existen
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

