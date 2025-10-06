-- Script de inicialización para la base de datos BrokerTEC

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
-- PASO 2: CREACIÓN DE TABLAS (DDL)
-------------------------------------------------------------------------

-- 1. Tabla: [ROLE]
CREATE TABLE [ROLE] (
    Id INT IDENTITY(101,1) PRIMARY KEY,
    Role_type NVARCHAR(100) NOT NULL UNIQUE
);
GO
PRINT 'Tabla [ROLE] creada exitosamente.';
GO

-- 2. Tabla: [USER]
CREATE TABLE [USER] (
    Id INT IDENTITY(1001,1) PRIMARY KEY,
    Alias NVARCHAR(15) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Password_hash NVARCHAR(255) NOT NULL,
    Role_Id INT NOT NULL,
    Username NVARCHAR(255) NOT NULL,
    Address_dir NVARCHAR(255),
    Country_of_origin NVARCHAR(100),
    Phone NVARCHAR(20),
    User_status NVARCHAR(50) NOT NULL CHECK (User_status IN ('Active', 'Inactive')),
    last_access DATETIME,
    Deactivation_reason NVARCHAR(255),

    -- Foreign Key Constraints
    -- Relación 1:N con [ROLE]
    CONSTRAINT FK_User_Role FOREIGN KEY (Role_Id) REFERENCES [ROLE](Id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
GO
PRINT 'Tabla [USER] creada exitosamente.';
GO

-- 3. Tabla: [MARKET]
CREATE TABLE [MARKET] (
    Id INT IDENTITY(2001,1) PRIMARY KEY,
    Market_name NVARCHAR(255) NOT NULL UNIQUE,
    Market_status NVARCHAR(100) NOT NULL,
    Currency NVARCHAR(50) NOT NULL
);
GO
PRINT 'Tabla [MARKET] creada exitosamente.';
GO

-- 4. Tabla: [COMPANY]
CREATE TABLE [COMPANY] (
    Id INT IDENTITY(3001,1) PRIMARY KEY,
    Market_Id INT NOT NULL,
    Company_name NVARCHAR(255) NOT NULL UNIQUE,
    Total_shares_count BIGINT NOT NULL CHECK (Total_shares_count >= 0),
    Available_shares BIGINT NOT NULL CHECK (Available_shares >= 0),
    Current_market_cap DECIMAL(18, 2) NOT NULL,
    Company_status NVARCHAR(100) NOT NULL CHECK (Company_status IN ('Listed', 'Delisted')),
    Delisting_reason NVARCHAR(255),

    -- Foreign Key Constraints
    -- Relación 1:N con [MARKET]
    CONSTRAINT FK_Company_Market FOREIGN KEY (Market_Id) REFERENCES [MARKET](Id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
GO
PRINT 'Tabla [COMPANY] creada exitosamente.';
GO

-- 5. Tabla: [PRICE_HISTORY]
CREATE TABLE [PRICE_HISTORY] (
    Id INT IDENTITY(4001,1) PRIMARY KEY,
    Company_id INT NOT NULL,
    Price DECIMAL(18, 4) NOT NULL CHECK (Price >= 0),
    PH_timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    -- Foreign Key Constraints
    -- Relación 1:N con [COMPANY]
    CONSTRAINT FK_PriceHistory_Company FOREIGN KEY (Company_id) REFERENCES [COMPANY](Id) 
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Restricción para que no haya duplicados en (Company_id, PH_timestamp)
    CONSTRAINT UQ_Company_PriceTimestamp UNIQUE (Company_id, PH_timestamp)
);
GO
PRINT 'Tabla [PRICE_HISTORY] creada exitosamente.';
GO

 -- 6. Tabla: [WALLET]
CREATE TABLE [WALLET] (
    Id INT IDENTITY(5001,1) PRIMARY KEY,
    User_id INT NOT NULL UNIQUE,
    Balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    Category NVARCHAR(50) NOT NULL CHECK (Category IN ('Junior', 'Mid', 'Senior')),
    Daily_limit DECIMAL(18, 2) NOT NULL,
    Daily_consumption DECIMAL(18, 2) NOT NULL DEFAULT 0.00,

    -- Foreign Key Constraints
    -- Relación 1:1 con [USER]
    CONSTRAINT FK_Wallet_User FOREIGN KEY (User_id) REFERENCES [USER](Id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
GO
PRINT 'Tabla [WALLET] creada exitosamente.';
GO

-- 7. Tabla: [TOP_UP]
CREATE TABLE [TOP_UP] (
    Id INT IDENTITY(6001,1) PRIMARY KEY,
    Wallet_id INT NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL CHECK (Amount > 0),
    Top_up_timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    -- Foreign Key Constraints
    -- Relación N:1 con [WALLET]
    CONSTRAINT FK_TopUp_Wallet FOREIGN KEY (Wallet_id) REFERENCES [WALLET](Id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
GO
PRINT 'Tabla [TOP_UP] creada exitosamente.';
GO

-- 8. Tabla: [TRADER_PORTFOLIO]
CREATE TABLE [TRADER_PORTFOLIO] (
    Id INT IDENTITY(7001,1) PRIMARY KEY,
    User_id INT NOT NULL,
    Company_id INT NOT NULL,
    Share_count INT NOT NULL CHECK (Share_count >= 0),
    Average_cost DECIMAL(18, 2) NOT NULL CHECK (Average_cost >= 0),

    -- Foreign Key Constraints
    -- Relación N:1 con [USER]
    CONSTRAINT FK_TP_User FOREIGN KEY (User_id) REFERENCES [USER](Id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    -- Relación N:1 con [COMPANY]
    CONSTRAINT FK_TP_Company FOREIGN KEY (Company_id) REFERENCES [COMPANY](Id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Restricción para que no haya duplicados en (User_id, Company_id)
    CONSTRAINT UQ_User_Company UNIQUE (User_id, Company_id)
);
GO
PRINT 'Tabla [TRADER_PORTFOLIO] creada exitosamente.';
GO

-- 9. Tabla: [TRANSACTION]
CREATE TABLE [TRANSACTION] (
    Id INT IDENTITY(8001,1) PRIMARY KEY,
    User_id INT NOT NULL,
    Company_id INT NOT NULL,
    Transaction_type NVARCHAR(50) NOT NULL CHECK (Transaction_type IN ('Buy', 'Sell')),
    QUANTITY INT NOT NULL,
    Price DECIMAL(18, 2) NOT NULL CHECK (Price >= 0),
    Transaction_timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    -- Foreign Key Constraints
    -- Relación N:1 con [USER]
    CONSTRAINT FK_Transaction_User FOREIGN KEY (User_id) REFERENCES [USER](Id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    -- Relación N:1 con [COMPANY]
    CONSTRAINT FK_Transaction_Company FOREIGN KEY (Company_id) REFERENCES [COMPANY](Id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
GO
PRINT 'Tabla [TRANSACTION] creada exitosamente.';
GO

-- 10. Tabla: [AUDIT]
CREATE TABLE [AUDIT] (
    Id INT IDENTITY(9001,1) PRIMARY KEY, 
    User_id INT NOT NULL,
    Event_type NVARCHAR(255) NOT NULL, 
    Object_Id INT,
    Reason NVARCHAR(1000), 
    Action_timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    -- Foreign Key Constraints
    -- Relación N:1 con [USER]
    CONSTRAINT FK_Audit_User FOREIGN KEY (User_id) REFERENCES [USER](Id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
GO
PRINT 'Tabla [AUDIT] creada exitosamente.';
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

-- Listar todas las tablas creadas en la base de datos BrokerTEC
