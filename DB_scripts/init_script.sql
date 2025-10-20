-- Script de inicialización para la base de datos BrokerTEC (Corregido por Entities de TypeORM)

-------------------------------------------------------------------------
-- PASO 1: VERIFICACIÓN Y USO DE BASE DE DATOS
-------------------------------------------------------------------------

IF NOT EXISTS (SELECT * FROM sys.databases WHERE NAME = 'BrokerTEC')
BEGIN
    CREATE DATABASE BrokerTEC;
    PRINT 'Base de datos BrokerTEC creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'Base de datos BrokerTEC ya existe.';
END
GO

USE BrokerTEC;
GO

-- Se eliminan todas las restricciones de una sola vez
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' 
    + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) 
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) 
    + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' 
FROM sys.foreign_keys;
EXEC sp_executesql @sql;
GO

-- 2. Eliminación de tablas en orden seguro (para evitar errores de dependencia al eliminar)
IF OBJECT_ID('transaccion', 'U') IS NOT NULL DROP TABLE transaccion;
IF OBJECT_ID('cartera_trader', 'U') IS NOT NULL DROP TABLE cartera_trader;
IF OBJECT_ID('recarga', 'U') IS NOT NULL DROP TABLE recarga;
IF OBJECT_ID('wallet', 'U') IS NOT NULL DROP TABLE wallet;
IF OBJECT_ID('precio_historico', 'U') IS NOT NULL DROP TABLE precio_historico;
IF OBJECT_ID('empresa', 'U') IS NOT NULL DROP TABLE empresa;
IF OBJECT_ID('mercado', 'U') IS NOT NULL DROP TABLE mercado;
IF OBJECT_ID('auditoria', 'U') IS NOT NULL DROP TABLE auditoria;
IF OBJECT_ID('PhoneNumber_User', 'U') IS NOT NULL DROP TABLE PhoneNumber_User;
IF OBJECT_ID('usuarios', 'U') IS NOT NULL DROP TABLE usuarios;
IF OBJECT_ID('roles', 'U') IS NOT NULL DROP TABLE roles;
GO
PRINT 'Tablas y restricciones existentes eliminadas.';
GO

-------------------------------------------------------------------------
-- PASO 2: CREACIÓN DE TABLAS BASE (DDL) - Sincronizado con .ts
-------------------------------------------------------------------------

-- 1. Tabla: [roles] (Basado en role.entity.ts)
CREATE TABLE roles (
    id_role INT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);
GO

-- 2. Tabla: [usuarios] (Basado en user.entity.ts)
CREATE TABLE usuarios (
    id_user UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    alias VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido1 VARCHAR(50) NOT NULL,
    apellido2 VARCHAR(50), 
    password VARCHAR(255) NOT NULL, 
    country_origin VARCHAR(100) NOT NULL,
    status BIT NOT NULL DEFAULT 1, 
    id_role INT NOT NULL,
    token_version INT NOT NULL DEFAULT 0
);
GO

-- 3. Tabla: [PhoneNumber_User] (Basado en phone-number-user.entity.ts)
CREATE TABLE PhoneNumber_User (
    id_phone UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    id_user UNIQUEIDENTIFIER NOT NULL,
    phone_number VARCHAR(20) NOT NULL
);
GO

-- 4. Tabla: [auditoria] (Basado en auditoria.entity.ts)
CREATE TABLE auditoria (
    id_auditoria UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    id_user UNIQUEIDENTIFIER,
    user_alias VARCHAR(50), 
    user_role VARCHAR(20), 
    accion VARCHAR(50) NOT NULL,
    entidad_afectada VARCHAR(50) NOT NULL,
    id_registro_afectado NVARCHAR(50),
    ticker_empresa VARCHAR(10), 
    cantidad_acciones INT, 
    precio_operacion DECIMAL(15, 2),
    monto_operacion DECIMAL(15, 2),
    saldo_anterior DECIMAL(15, 2),
    saldo_nuevo DECIMAL(15, 2),
    justificacion TEXT, 
    requiere_confirmacion BIT NOT NULL DEFAULT 0, 
    descripcion TEXT, 
    fecha_hora DATETIME2 NOT NULL DEFAULT GETDATE(),
    exitosa BIT NOT NULL DEFAULT 1, 
    mensaje_error TEXT
);
GO

-- 5. Tabla: [mercado]
CREATE TABLE mercado (
    id_mercado INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(35) NOT NULL UNIQUE,
    estado NVARCHAR(15) NOT NULL,
    moneda NVARCHAR(5) NOT NULL
);
GO

-- 6. Tabla: [empresa]
CREATE TABLE empresa (
    id_empresa INT IDENTITY(1,1) PRIMARY KEY,
    id_mercado INT NOT NULL,
    nombre NVARCHAR(35) NOT NULL UNIQUE,
    acciones_totales BIGINT NOT NULL CHECK (acciones_totales >= 0),
    acciones_disponibles BIGINT NOT NULL CHECK (acciones_disponibles >= 0),
    capital_actual DECIMAL(10, 2) NOT NULL,
    estado NVARCHAR(15) NOT NULL CHECK (estado IN ('Listed', 'Delisted')),
    justificacion_delistar NVARCHAR(35)
);
GO

-- 7. Tabla: [precio_historico]
CREATE TABLE precio_historico (
    id_precio_hist INT IDENTITY(1,1) PRIMARY KEY,
    id_empresa INT NOT NULL,
    precio DECIMAL(10, 4) NOT NULL CHECK (precio >= 0),
    fecha_hora DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Company_PriceTimestamp UNIQUE (id_empresa, fecha_hora)
);
GO

-- 8. Tabla: [wallet]
CREATE TABLE wallet (
    id_wallet INT IDENTITY(1,1) PRIMARY KEY,
    id_user UNIQUEIDENTIFIER NOT NULL UNIQUE, 
    saldo DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    categoria NVARCHAR(50) NOT NULL CHECK (categoria IN ('Junior', 'Mid', 'Senior')), 
    limite_diario DECIMAL(10, 2) NOT NULL,
    consumo_diario DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);
GO

-- 9. Tabla: [recarga]
CREATE TABLE recarga (
    id_recarga INT IDENTITY(1,1) PRIMARY KEY,
    id_wallet INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    fecha_hora DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- 10. Tabla: [cartera_trader]
CREATE TABLE cartera_trader (
    id_cartera_trader INT IDENTITY(1,1) PRIMARY KEY,
    id_user UNIQUEIDENTIFIER NOT NULL, 
    id_empresa INT NOT NULL,
    cantidad_acciones INT NOT NULL CHECK (cantidad_acciones >= 0),
    costo_promedio DECIMAL(10, 2) NOT NULL CHECK (costo_promedio >= 0),
    CONSTRAINT UQ_User_Company UNIQUE (id_user, id_empresa)
);
GO

-- 11. Tabla: [transaccion]
CREATE TABLE transaccion (
    id_transaccion INT IDENTITY(1,1) PRIMARY KEY,
    -- CRÍTICO: id_user debe ser UNIQUEIDENTIFIER
    id_user UNIQUEIDENTIFIER NOT NULL, 
    id_empresa INT NOT NULL,
    tipo NVARCHAR(50) NOT NULL CHECK (tipo IN ('Buy', 'Sell')),
    cantidad INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    fecha_hora DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-------------------------------------------------------------------------
-- PASO 4: AÑADIR CLAVES FORÁNEAS (FKs) CON ALTER TABLE Y CASCADE
-------------------------------------------------------------------------

-- 1. Tablas principales de USUARIOS
ALTER TABLE usuarios
ADD CONSTRAINT FK_User_Role FOREIGN KEY (id_role) REFERENCES roles(id_role)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE PhoneNumber_User
ADD CONSTRAINT FK_PhoneNumber_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Tablas AUDITORÍA y LOGS
ALTER TABLE auditoria
ADD CONSTRAINT FK_Auditoria_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user); 
-- Sin CASCADE: la auditoría es un registro histórico que debe persistir.

-- 3. Tablas de MERCADO y EMPRESA
ALTER TABLE empresa
ADD CONSTRAINT FK_Company_Market FOREIGN KEY (id_mercado) REFERENCES mercado(id_mercado) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE precio_historico
ADD CONSTRAINT FK_PriceHistory_Company FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Tablas de WALLET y RECARGAS
ALTER TABLE wallet
ADD CONSTRAINT FK_Wallet_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE recarga
ADD CONSTRAINT FK_TopUp_Wallet FOREIGN KEY (id_wallet) REFERENCES wallet(id_wallet) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Tablas de OPERACIONES
ALTER TABLE cartera_trader
ADD CONSTRAINT FK_TP_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user)
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE cartera_trader
ADD CONSTRAINT FK_TP_Company FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE transaccion
ADD CONSTRAINT FK_Transaction_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user)
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE transaccion
ADD CONSTRAINT FK_Transaction_Company FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
    ON DELETE CASCADE ON UPDATE CASCADE;
GO

-------------------------------------------------------------------------
PRINT 'Script de creación de base de datos BrokerTEC finalizado.';
GO
SELECT TABLE_NAME AS Nombre_de_Tabla 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo' 
ORDER BY TABLE_NAME;
GO
-------------------------------------------------------------------------