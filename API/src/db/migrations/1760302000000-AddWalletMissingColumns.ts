import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWalletMissingColumns1760302000000 implements MigrationInterface {
  name = 'AddWalletMissingColumns1760302000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add currency if missing
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'currency' AND Object_ID = Object_ID(N'wallets')
      )
      BEGIN
        ALTER TABLE wallets ADD currency varchar(10) NOT NULL CONSTRAINT DF_wallets_currency DEFAULT 'USD';
      END
    `);

    // Add last_consumed_date if missing
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'last_consumed_date' AND Object_ID = Object_ID(N'wallets')
      )
      BEGIN
        ALTER TABLE wallets ADD last_consumed_date date NULL;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove default constraint then drop column currency if exists
    await queryRunner.query(`
      IF EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'currency' AND Object_ID = Object_ID(N'wallets')
      )
      BEGIN
        DECLARE @dfName NVARCHAR(200);
        SELECT @dfName = df.name
        FROM sys.default_constraints df
        INNER JOIN sys.columns c ON c.default_object_id = df.object_id
        WHERE df.parent_object_id = OBJECT_ID(N'wallets')
          AND c.name = N'currency';
        IF @dfName IS NOT NULL EXEC('ALTER TABLE wallets DROP CONSTRAINT ' + @dfName);
        ALTER TABLE wallets DROP COLUMN currency;
      END
    `);

    // Drop last_consumed_date if exists
    await queryRunner.query(`
      IF EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'last_consumed_date' AND Object_ID = Object_ID(N'wallets')
      )
      BEGIN
        ALTER TABLE wallets DROP COLUMN last_consumed_date;
      END
    `);
  }
}

