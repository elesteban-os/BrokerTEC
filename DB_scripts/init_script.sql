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

-------------------------------------------------------------------------
-- PASO 2: CREACIÓN DE TABLAS BASE (DDL) - Sincronizado con .ts
-------------------------------------------------------------------------

-- 1. Tabla: [roles] (Basado en role.entity.ts)
CREATE TABLE roles (
    -- PK: @PrimaryGeneratedColumn() -> INT IDENTITY
    id_role INT IDENTITY(1,1) PRIMARY KEY,
    -- CORRECCIÓN: Tipo y longitud ajustados a role.entity.ts (VARCHAR(50))
    role_name VARCHAR(50) NOT NULL UNIQUE
);
GO
PRINT 'Tabla [roles] creada exitosamente.';
GO

-- 2. Tabla: [usuarios] (Basado en user.entity.ts)
CREATE TABLE usuarios (
    -- PK: @PrimaryGeneratedColumn('uuid') -> UNIQUEIDENTIFIER
    id_user UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    
    -- Alias y Email (Índices únicos)
    alias VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    
    -- Campos Personales
    nombre VARCHAR(50) NOT NULL,
    apellido1 VARCHAR(50) NOT NULL,
    apellido2 VARCHAR(50), -- @Column({ nullable: true })
    
    -- Seguridad
    password VARCHAR(255) NOT NULL, 
    
    -- Datos de Contacto/Ubicación
    country_origin VARCHAR(100) NOT NULL,
    
    -- Estado y Roles
    status BIT NOT NULL DEFAULT 1, -- @Column({ type: 'bit', default: true })
    id_role INT NOT NULL,
    
    -- JWT Management
    token_version INT NOT NULL DEFAULT 0,

    -- Foreign Key Constraints
    -- Relación 1:N con [roles]
    CONSTRAINT FK_User_Role FOREIGN KEY (id_role) REFERENCES roles(id_role)
);
GO
PRINT 'Tabla [usuarios] creada exitosamente.';
GO

-- 3. Tabla: [PhoneNumber_User] (Basado en phone-number-user.entity.ts)
CREATE TABLE PhoneNumber_User (
    -- PK: @PrimaryGeneratedColumn('uuid') -> UNIQUEIDENTIFIER
    id_phone UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    
    -- FK: @Column({ type: 'uuid' }) -> UNIQUEIDENTIFIER
    id_user UNIQUEIDENTIFIER NOT NULL, -- Sincronizado con usuarios.id_user
    
    phone_number VARCHAR(20) NOT NULL,

    -- Foreign Key Constraints
    -- Relación N:1 con [usuarios]
    CONSTRAINT FK_PhoneNumber_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user)
);
GO
PRINT 'Tabla [PhoneNumber_User] creada exitosamente.';
GO

-- 4. Tabla: [auditoria] (Basado en auditoria.entity.ts)
CREATE TABLE auditoria (
    -- PK: @PrimaryGeneratedColumn('uuid') -> UNIQUEIDENTIFIER
    id_auditoria UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    
    -- QUIÉN HIZO
    id_user UNIQUEIDENTIFIER, -- nullable: true, Sincronizado con usuarios.id_user
    user_alias VARCHAR(50), 
    user_role VARCHAR(20), 
    
    -- QUÉ HIZO
    accion VARCHAR(50) NOT NULL,
    entidad_afectada VARCHAR(50) NOT NULL,
    id_registro_afectado UNIQUEIDENTIFIER, -- nullable: true
    
    -- ESPECÍFICO PARA TRADING
    ticker_empresa VARCHAR(10), 
    cantidad_acciones INT, 
    precio_operacion DECIMAL(15, 2), -- precision: 15, scale: 2
    monto_operacion DECIMAL(15, 2),
    saldo_anterior DECIMAL(15, 2),
    saldo_nuevo DECIMAL(15, 2),
    
    -- INFORMACIÓN ADMINISTRATIVA/LOG
    justificacion TEXT, 
    requiere_confirmacion BIT NOT NULL DEFAULT 0, 
    descripcion TEXT, 
    fecha_hora DATETIME2 NOT NULL DEFAULT GETDATE(), -- Uso de DATETIME2 para precisión
    exitosa BIT NOT NULL DEFAULT 1, 
    mensaje_error TEXT, 
    
    -- Foreign Key Constraints
    CONSTRAINT FK_Auditoria_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user)
);
GO
PRINT 'Tabla [auditoria] creada exitosamente.';
GO

-------------------------------------------------------------------------
-- PASO 3: TABLAS FALTANTES (DDL) - Claves Foráneas de usuario corregidas
-------------------------------------------------------------------------

-- 5. Tabla: [mercado]
CREATE TABLE mercado (
    id_mercado INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(35) NOT NULL UNIQUE,
    estado NVARCHAR(15) NOT NULL,
    moneda NVARCHAR(5) NOT NULL
);
GO
PRINT 'Tabla [mercado] creada exitosamente.';
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
    justificacion_delistar NVARCHAR(35),

    -- Foreign Key Constraints
    CONSTRAINT FK_Company_Market FOREIGN KEY (id_mercado) REFERENCES mercado(id_mercado) 
);
GO
PRINT 'Tabla [empresa] creada exitosamente.';
GO

-- 7. Tabla: [precio_historico]
CREATE TABLE precio_historico (
    id_precio_hist INT IDENTITY(1,1) PRIMARY KEY,
    id_empresa INT NOT NULL,
    precio DECIMAL(10, 4) NOT NULL CHECK (precio >= 0),
    fecha_hora DATETIME NOT NULL DEFAULT GETDATE(),

    -- Foreign Key Constraints
    CONSTRAINT FK_PriceHistory_Company FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),

    -- Restricción para que no haya duplicados en (Company_id, PH_timestamp)
    CONSTRAINT UQ_Company_PriceTimestamp UNIQUE (id_empresa, fecha_hora)
);
GO
PRINT 'Tabla [precio_historico] creada exitosamente.';
GO

-- 8. Tabla: [wallet]
CREATE TABLE wallet (
    id_wallet INT IDENTITY(1,1) PRIMARY KEY,
    -- CRÍTICO: id_user debe ser UNIQUEIDENTIFIER
    id_user UNIQUEIDENTIFIER NOT NULL UNIQUE, 
    saldo DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    -- Nota: 'Category' en el CHECK debe coincidir con los valores permitidos (Junior, Mid, Senior)
    categoria NVARCHAR(50) NOT NULL CHECK (categoria IN ('Junior', 'Mid', 'Senior')), 
    limite_diario DECIMAL(10, 2) NOT NULL,
    consumo_diario DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    -- Foreign Key Constraints
    -- Relación 1:1 con [USER]
    CONSTRAINT FK_Wallet_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
GO
PRINT 'Tabla [wallet] creada exitosamente.';
GO

-- 9. Tabla: [recarga]
CREATE TABLE recarga (
    id_recarga INT IDENTITY(1,1) PRIMARY KEY,
    id_wallet INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    fecha_hora DATETIME NOT NULL DEFAULT GETDATE(),

    -- Foreign Key Constraints
    -- Relación N:1 con [WALLET]
    CONSTRAINT FK_TopUp_Wallet FOREIGN KEY (id_wallet) REFERENCES wallet(id_wallet) 
);
GO
PRINT 'Tabla [recarga] creada exitosamente.';
GO

-- 10. Tabla: [cartera_trader]
CREATE TABLE cartera_trader (
    id_cartera_trader INT IDENTITY(1,1) PRIMARY KEY,
    -- CRÍTICO: id_user debe ser UNIQUEIDENTIFIER
    id_user UNIQUEIDENTIFIER NOT NULL, 
    id_empresa INT NOT NULL,
    cantidad_acciones INT NOT NULL CHECK (cantidad_acciones >= 0),
    costo_promedio DECIMAL(10, 2) NOT NULL CHECK (costo_promedio >= 0),

    -- Foreign Key Constraints
    -- Relación N:1 con [USER]
    CONSTRAINT FK_TP_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user)
    -- Relación N:1 con [COMPANY]
    CONSTRAINT FK_TP_Company FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),

    -- Restricción para que no haya duplicados en (User_id, Company_id)
    CONSTRAINT UQ_User_Company UNIQUE (id_user, id_empresa)
);
GO
PRINT 'Tabla [cartera_trader] creada exitosamente.';
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
    fecha_hora DATETIME NOT NULL DEFAULT GETDATE(),

    -- Foreign Key Constraints
    -- Relación N:1 con [USER]
    CONSTRAINT FK_Transaction_User FOREIGN KEY (id_user) REFERENCES usuarios(id_user),
    -- Relación N:1 con [COMPANY]
    CONSTRAINT FK_Transaction_Company FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);
GO
PRINT 'Tabla [transaccion] creada exitosamente.';
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