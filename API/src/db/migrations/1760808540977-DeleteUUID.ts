import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteUUID1760808540977 implements MigrationInterface {
    name = 'DeleteUUID1760808540977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Atención: esta migración asume que migraciones anteriores crearon tablas con UUID.
        // Para evitar conflictos de objetos existentes, eliminamos FKs y tablas si existen
        // y recreamos con las columnas INT IDENTITY.

        // 1) Quitar FKs y dropear tablas dependientes (si existen)
        await queryRunner.query(`
            IF OBJECT_ID('PhoneNumber_User', 'U') IS NOT NULL
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_86cf8f81322568fd0fd3cb4f830'
                ) ALTER TABLE PhoneNumber_User DROP CONSTRAINT FK_86cf8f81322568fd0fd3cb4f830;
                DROP TABLE PhoneNumber_User;
            END
        `);

        await queryRunner.query(`
            IF OBJECT_ID('auditoria', 'U') IS NOT NULL
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_2a391b3092635e1a7ef4344a566'
                ) ALTER TABLE auditoria DROP CONSTRAINT FK_2a391b3092635e1a7ef4344a566;
                DROP TABLE auditoria;
            END
        `);

        await queryRunner.query(`
            IF OBJECT_ID('usuarios', 'U') IS NOT NULL
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_c3b96775833e656856573e19334'
                ) ALTER TABLE usuarios DROP CONSTRAINT FK_c3b96775833e656856573e19334;
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_446adfc18b35418aac32ae0b7b' AND object_id = OBJECT_ID('usuarios'))
                    DROP INDEX IDX_446adfc18b35418aac32ae0b7b ON usuarios;
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_86c1ab44c24b70ce469068f9c6' AND object_id = OBJECT_ID('usuarios'))
                    DROP INDEX IDX_86c1ab44c24b70ce469068f9c6 ON usuarios;
                DROP TABLE usuarios;
            END
        `);

        // 2) Asegurar que la tabla roles exista (int). Si ya existe, no recrear.
        await queryRunner.query(`
            IF OBJECT_ID('roles', 'U') IS NULL
            BEGIN
                CREATE TABLE roles (
                    id_role int NOT NULL IDENTITY(1,1),
                    role_name varchar(50) NOT NULL,
                    CONSTRAINT UQ_ac35f51a0f17e3e1fe121126039 UNIQUE (role_name),
                    CONSTRAINT PK_3ebdb96dd6787bda0e3c8f89d66 PRIMARY KEY (id_role)
                );
            END
        `);

        // 3) Crear tablas con claves INT
        await queryRunner.query(`
            CREATE TABLE usuarios (
                id_user int NOT NULL IDENTITY(1,1),
                alias varchar(50) NOT NULL,
                email varchar(100) NOT NULL,
                nombre varchar(50) NOT NULL,
                apellido1 varchar(50) NOT NULL,
                apellido2 varchar(50),
                password varchar(255) NOT NULL,
                country_origin varchar(100) NOT NULL,
                status bit NOT NULL CONSTRAINT DF_a2ee79d58d56e7e79d048030091 DEFAULT 1,
                id_role int NOT NULL,
                token_version int NOT NULL CONSTRAINT DF_4caf39e03bf3f4e85f4ccfc924f DEFAULT 0,
                CONSTRAINT PK_762fedc5a858bbb008722708ccd PRIMARY KEY (id_user)
            );
        `);

        await queryRunner.query(`CREATE UNIQUE INDEX IDX_86c1ab44c24b70ce469068f9c6 ON usuarios (alias)`);
        await queryRunner.query(`CREATE UNIQUE INDEX IDX_446adfc18b35418aac32ae0b7b ON usuarios (email)`);

        await queryRunner.query(`
            CREATE TABLE PhoneNumber_User (
                id_phone int NOT NULL IDENTITY(1,1),
                id_user int NOT NULL,
                phone_number varchar(20) NOT NULL,
                CONSTRAINT PK_fda56775b3e828a758b3d3f7867 PRIMARY KEY (id_phone)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE auditoria (
                id_auditoria int NOT NULL IDENTITY(1,1),
                id_user int NULL,
                user_alias varchar(50) NULL,
                user_role varchar(20) NULL,
                accion varchar(50) NOT NULL,
                entidad_afectada varchar(50) NOT NULL,
                id_registro_afectado int NULL,
                ticker_empresa varchar(10) NULL,
                cantidad_acciones int NULL,
                precio_operacion decimal(15,2) NULL,
                monto_operacion decimal(15,2) NULL,
                saldo_anterior decimal(15,2) NULL,
                saldo_nuevo decimal(15,2) NULL,
                justificacion text NULL,
                requiere_confirmacion bit NOT NULL CONSTRAINT DF_e432b71eed207056e06c4c240f1 DEFAULT 0,
                descripcion text NULL,
                fecha_hora datetime2 NOT NULL CONSTRAINT DF_beca173a6410c1e4e4230cb181f DEFAULT getdate(),
                exitosa bit NOT NULL CONSTRAINT DF_2c05e36f562d50ced01cb2f1c8f DEFAULT 1,
                mensaje_error text NULL,
                CONSTRAINT PK_9c9ae9e15c3caf7d555c6b9f354 PRIMARY KEY (id_auditoria)
            );
        `);

        // 4) Crear FKs
        await queryRunner.query(`ALTER TABLE PhoneNumber_User ADD CONSTRAINT FK_86cf8f81322568fd0fd3cb4f830 FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE usuarios ADD CONSTRAINT FK_c3b96775833e656856573e19334 FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE auditoria ADD CONSTRAINT FK_2a391b3092635e1a7ef4344a566 FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auditoria" DROP CONSTRAINT "FK_2a391b3092635e1a7ef4344a566"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_c3b96775833e656856573e19334"`);
        await queryRunner.query(`ALTER TABLE "PhoneNumber_User" DROP CONSTRAINT "FK_86cf8f81322568fd0fd3cb4f830"`);
        await queryRunner.query(`DROP TABLE "auditoria"`);
        await queryRunner.query(`DROP INDEX "IDX_446adfc18b35418aac32ae0b7b" ON "usuarios"`);
        await queryRunner.query(`DROP INDEX "IDX_86c1ab44c24b70ce469068f9c6" ON "usuarios"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "PhoneNumber_User"`);
    }

}
