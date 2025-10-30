
-- SCRIPT DE CREACION DE TABLAS PARA BROKERTEC
-- Este script crea todas las tablas del sistema BrokerTEC
-- con tipos de datos 100% identicos a como TypeORM las genera
-- Basado en las entidades y migraciones del proyecto
-- 
-- 
-- IMPORTANTE:
-- - Ejecutar este script en una base de datos limpia
-- - Las constraints y defaults son identicos se basan en los archivos de migracion de nuestro proyecto
-- - NO modificar tipos de datos o la API fallara
--
-- ==============================================================================

USE BrokerTEC;
GO

-- =================================================================================
-- ELIMINAR TABLAS EXISTENTES (ORDEN INVERSO DE DEPENDENCIAS)

IF OBJECT_ID('auditoria', 'U') IS NOT NULL DROP TABLE auditoria;
IF OBJECT_ID('precios_historicos', 'U') IS NOT NULL DROP TABLE precios_historicos;
IF OBJECT_ID('posiciones', 'U') IS NOT NULL DROP TABLE posiciones;
IF OBJECT_ID('wallets', 'U') IS NOT NULL DROP TABLE wallets;
IF OBJECT_ID('PhoneNumber_User', 'U') IS NOT NULL DROP TABLE PhoneNumber_User;
IF OBJECT_ID('empresas', 'U') IS NOT NULL DROP TABLE empresas;
IF OBJECT_ID('mercados', 'U') IS NOT NULL DROP TABLE mercados;
IF OBJECT_ID('usuarios', 'U') IS NOT NULL DROP TABLE usuarios;
IF OBJECT_ID('roles', 'U') IS NOT NULL DROP TABLE roles;
GO

PRINT 'Tablas antiguas eliminadas';
GO

-- ===============================================================================
-- TABLA: roles
-- Almacena los roles del sistema (ADMINISTRADOR, ANALISTA, TRADER)
-- IDs fijos: 1=ADMINISTRADOR, 2=ANALISTA, 3=TRADER

CREATE TABLE roles (
    id_role int NOT NULL IDENTITY(1,1),
    role_name varchar(50) NOT NULL,
    CONSTRAINT UQ_ac35f51a0f17e3e1fe121126039 UNIQUE (role_name),
    CONSTRAINT PK_3ebdb96dd6787bda0e3c8f89d66 PRIMARY KEY (id_role)
);
GO

PRINT 'Tabla roles creada';
GO

-- ==========================================================================
-- TABLA: usuarios
-- Almacena informacion de todos los usuarios del sistema

CREATE TABLE usuarios (
    id_user int NOT NULL IDENTITY(1,1),
    alias varchar(50) NOT NULL,
    email varchar(100) NOT NULL,
    nombre varchar(50) NOT NULL,
    apellido1 varchar(50) NOT NULL,
    apellido2 varchar(50) NULL,
    password varchar(255) NOT NULL,
    country_origin varchar(100) NOT NULL,
    status bit NOT NULL CONSTRAINT DF_usuarios_status DEFAULT 1,
    id_role int NOT NULL,
    token_version int NOT NULL CONSTRAINT DF_usuarios_token_version DEFAULT 0,
    CONSTRAINT PK_d6e99f8d7e706cead77815af8c8 PRIMARY KEY (id_user),
    CONSTRAINT FK_c3b96775833e656856573e19334 FOREIGN KEY (id_role) 
        REFERENCES roles(id_role) ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

CREATE UNIQUE INDEX IDX_4c5e2c6c3e8e1c8f95b82d5c05 ON usuarios (alias);
CREATE UNIQUE INDEX IDX_a8c6f1f3e2c5d8b4f2e6a7c9d1 ON usuarios (email);
GO

PRINT 'Tabla usuarios creada';
GO

-- ==========================================================================
-- TABLA: PhoneNumber_User
-- Almacena numeros de telefono de usuarios (relacion 1:N)

CREATE TABLE PhoneNumber_User (
    id_phone int NOT NULL IDENTITY(1,1),
    id_user int NOT NULL,
    phone_number varchar(20) NOT NULL,
    CONSTRAINT PK_phone_number_user PRIMARY KEY (id_phone),
    CONSTRAINT FK_phone_user FOREIGN KEY (id_user) 
        REFERENCES usuarios(id_user) ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

PRINT 'Tabla PhoneNumber_User creada';
GO

-- ================================================================================
-- TABLA: wallets
-- Almacena billeteras de usuarios con saldos y limites

CREATE TABLE wallets (
    id_wallet int NOT NULL IDENTITY(1,1),
    id_user int NOT NULL,
    saldo decimal(15,2) NOT NULL CONSTRAINT DF_56d413337ae6cb0c892dbc1ef15 DEFAULT 0,
    categoria varchar(10) NOT NULL CONSTRAINT DF_7b91fe8febbbabcc4be14ec183b DEFAULT 'JUNIOR',
    limite_diario decimal(15,2) NOT NULL CONSTRAINT DF_f1fb7f9a5753c268fbab37a4805 DEFAULT 0,
    consumo_dia decimal(15,2) NOT NULL CONSTRAINT DF_ce256ad70d01313fd1714dd27cd DEFAULT 0,
    fecha_ultima_recarga date NULL,
    fecha_creacion datetime2 NOT NULL CONSTRAINT DF_ae0e6a1c267d6fd369702517f72 DEFAULT GETDATE(),
    CONSTRAINT UQ_afda9ef5337d4c564cae4fea9c1 UNIQUE (id_user),
    CONSTRAINT PK_fa9779ed321f5258b9848409df0 PRIMARY KEY (id_wallet),
    CONSTRAINT FK_afda9ef5337d4c564cae4fea9c1 FOREIGN KEY (id_user) 
        REFERENCES usuarios(id_user) ON DELETE CASCADE ON UPDATE NO ACTION
);
GO

CREATE UNIQUE INDEX REL_afda9ef5337d4c564cae4fea9c ON wallets (id_user) WHERE id_user IS NOT NULL;
GO

PRINT 'Tabla wallets creada';
GO

-- ==============================================================
-- TABLA: mercados
-- Almacena mercados bursatiles (NASDAQ, NYSE, etc.)

CREATE TABLE mercados (
    id_mercado int NOT NULL IDENTITY(1,1),
    nombre varchar(100) NOT NULL,
    habilitado bit NOT NULL CONSTRAINT DF_14762fe2c6be13bc607e05b7c54 DEFAULT 1,
    fecha_creacion datetime2 NOT NULL CONSTRAINT DF_729eed0a90ca4237558436e1d42 DEFAULT GETDATE(),
    CONSTRAINT PK_ff8ef4f31403276e20905f9d408 PRIMARY KEY (id_mercado)
);
GO

CREATE UNIQUE INDEX IDX_6448ae16919f81d5086514dd39 ON mercados (nombre);
GO

PRINT 'Tabla mercados creada';
GO

-- =====================================================
-- TABLA: empresas
-- Almacena empresas que cotizan en los mercados

CREATE TABLE empresas (
    id_empresa int NOT NULL IDENTITY(1,1),
    nombre varchar(200) NOT NULL,
    id_mercado int NOT NULL,
    precio_actual decimal(15,2) NOT NULL,
    cantidad_acciones int NOT NULL,
    habilitado bit NOT NULL CONSTRAINT DF_f28f5266570dfdf44970e9dd49e DEFAULT 1,
    fecha_creacion datetime2 NOT NULL CONSTRAINT DF_4028caf01c14e993f74d80a65fb DEFAULT GETDATE(),
    CONSTRAINT PK_b14c38cf8cfb35f23b693d0afb0 PRIMARY KEY (id_empresa),
    CONSTRAINT FK_b0cf8c53e53e9a02a6db0ccc144 FOREIGN KEY (id_mercado) 
        REFERENCES mercados(id_mercado) ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

PRINT 'Tabla empresas creada';
GO

-- =====================================================================
-- TABLA: precios_historicos
-- Almacena historico de precios de acciones

CREATE TABLE precios_historicos (
    id_precio int NOT NULL IDENTITY(1,1),
    id_empresa int NOT NULL,
    precio decimal(15,2) NOT NULL,
    fecha_hora datetime2 NOT NULL CONSTRAINT DF_b3558138def7782759f293be1dd DEFAULT GETDATE(),
    CONSTRAINT PK_861b2f146347c6f249e3de395f7 PRIMARY KEY (id_precio),
    CONSTRAINT FK_3e3f05d49866ca6b0f4de16556d FOREIGN KEY (id_empresa) 
        REFERENCES empresas(id_empresa) ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

CREATE UNIQUE INDEX IDX_bf235856f0f4cc7a5683b55452 ON precios_historicos (id_empresa, fecha_hora);
GO

PRINT 'Tabla precios_historicos creada';
GO

-- ========================================================================
-- TABLA: posiciones
-- Almacena posiciones de acciones de cada usuario

CREATE TABLE posiciones (
    id_posicion int NOT NULL IDENTITY(1,1),
    id_user int NOT NULL,
    id_empresa int NOT NULL,
    cantidad int NOT NULL CONSTRAINT DF_498cb9fc9bf47cb91c45579e5ee DEFAULT 0,
    costo_promedio decimal(15,2) NOT NULL CONSTRAINT DF_4b1497fe6ad1f29ab923780ff1e DEFAULT 0,
    fecha_creacion datetime2 NOT NULL CONSTRAINT DF_476b87a21c78d9bebb31edc8b52 DEFAULT GETDATE(),
    fecha_actualizacion datetime2 NOT NULL CONSTRAINT DF_267684ef61b51cbd8b9addeb85c DEFAULT GETDATE(),
    CONSTRAINT PK_9ba916c88866c488297543c1c92 PRIMARY KEY (id_posicion),
    CONSTRAINT FK_b38c27651ada70e824aff95e534 FOREIGN KEY (id_user) 
        REFERENCES usuarios(id_user) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT FK_6bb3051551a2b24fe3f40f1ba95 FOREIGN KEY (id_empresa) 
        REFERENCES empresas(id_empresa) ON DELETE CASCADE ON UPDATE NO ACTION
);
GO

PRINT 'Tabla posiciones creada';
GO

-- ===================================================================
-- TABLA: auditoria
-- Almacena registro de auditoria de todas las operaciones

CREATE TABLE auditoria (
    id_auditoria int NOT NULL IDENTITY(1,1),
    id_user int NULL,
    user_alias varchar(50) NULL,
    user_role varchar(20) NULL,
    accion varchar(50) NOT NULL,
    entidad_afectada varchar(50) NOT NULL,
    id_registro_afectado int NULL,
    ticker_empresa varchar(100) NULL,
    cantidad_acciones int NULL,
    precio_operacion decimal(15,2) NULL,
    monto_operacion decimal(15,2) NULL,
    saldo_anterior decimal(15,2) NULL,
    saldo_nuevo decimal(15,2) NULL,
    ganancia_perdida decimal(15,2) NULL,
    justificacion nvarchar(max) NULL,
    requiere_confirmacion bit NOT NULL CONSTRAINT DF_auditoria_requiere_confirmacion DEFAULT 0,
    descripcion nvarchar(max) NULL,
    fecha_hora datetime2 NOT NULL CONSTRAINT DF_auditoria_fecha_hora DEFAULT GETDATE(),
    exitosa bit NOT NULL CONSTRAINT DF_auditoria_exitosa DEFAULT 1,
    mensaje_error nvarchar(max) NULL,
    CONSTRAINT PK_auditoria PRIMARY KEY (id_auditoria),
    CONSTRAINT FK_auditoria_user FOREIGN KEY (id_user) 
        REFERENCES usuarios(id_user) ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

PRINT 'Tabla auditoria creada';
GO





