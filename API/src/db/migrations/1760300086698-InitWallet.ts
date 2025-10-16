import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWalletsTable1697100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          {
            name: 'id_wallet',
            type: 'uniqueidentifier',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'NEWID()'
          },
          { name: 'id_user', type: 'uniqueidentifier' },
          { name: 'category', type: 'varchar', length: '10', isNullable: false },
          { name: 'balance', type: 'decimal', precision: 18, scale: 2, default: 0 },
          { name: 'daily_limit', type: 'decimal', precision: 18, scale: 2, default: 0 },
          { name: 'today_consumed', type: 'decimal', precision: 18, scale: 2, default: 0 },
          { name: 'created_at', type: 'datetime', default: 'GETDATE()' }
        ],
        foreignKeys: [
          {
            columnNames: ['id_user'],
            referencedColumnNames: ['id_user'],
            referencedTableName: 'usuarios',
            onDelete: 'CASCADE'
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wallets');
  }
}
