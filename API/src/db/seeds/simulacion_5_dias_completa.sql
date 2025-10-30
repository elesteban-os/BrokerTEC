
-- SIMULACIÓN DE 5 DÍAS DE TRADING EN BROKERTEC
-- 
-- Este script simula un escenario realista de trading durante 5 días
-- Incluye: traders, mercados, empresas, fluctuaciones de precios y operaciones
-- TODAS las operaciones se registran en auditoría para tracking de ganancias/pérdidas
-- 
-- 
--  REQUISITOS PREVIOS:
-- 1. Ejecutar PRIMERO los Stored Procedures de la carpeta "Stored Procedures":
--    - usp_ComprarAcciones.sql
--    - usp_VenderAcciones.sql
--    - usp_DisableTrader.sql
--    - ...
-- 2. Asegurarse de tener las migraciones ejecutadas (tablas creadas) puede ejecutar el comando en la terminal o el script "Create_Tables.sql"
-------------------------------------------------------------

USE BrokerTEC;
GO

-- =====================================================
-- PASO 0: VERIFICAR Y CREAR ROLES SI NO EXISTEN

IF NOT EXISTS (SELECT 1 FROM roles WHERE id_role = 1)
BEGIN
    SET IDENTITY_INSERT roles ON;
    INSERT INTO roles (id_role, role_name) VALUES (1, 'ADMINISTRADOR');
    SET IDENTITY_INSERT roles OFF;
END

IF NOT EXISTS (SELECT 1 FROM roles WHERE id_role = 2)
BEGIN
    SET IDENTITY_INSERT roles ON;
    INSERT INTO roles (id_role, role_name) VALUES (2, 'ANALISTA');
    SET IDENTITY_INSERT roles OFF;
END

IF NOT EXISTS (SELECT 1 FROM roles WHERE id_role = 3)
BEGIN
    SET IDENTITY_INSERT roles ON;
    INSERT INTO roles (id_role, role_name) VALUES (3, 'TRADER');
    SET IDENTITY_INSERT roles OFF;
END

-- Crear usuario administrador si no existe
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE alias = 'admin')
BEGIN
    DECLARE @password_admin VARCHAR(255) = '$2a$12$sVZCDeYTv37ctmJkuS4T5OGpOV9M95TLBDvm8r84yevJnf.mw8i6S';
    INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, status, id_role, token_version)
    VALUES ('admin', 'admin@brokertec.com', 'Administrador', 'Sistema', NULL, @password_admin, 'Costa Rica', 1, 1, 0);
END

PRINT 'Roles del sistema verificados y admin creado';
GO

-- =====================================================
-- PASO 1: LIMPIAR DATOS EXISTENTES (ORDEN IMPORTANTE)
-- =====================================================

DELETE FROM auditoria;
DELETE FROM precios_historicos;
DELETE FROM posiciones;
DELETE FROM wallets;
IF OBJECT_ID('phone_number_users', 'U') IS NOT NULL
    DELETE FROM phone_number_users;
IF OBJECT_ID('PhoneNumber_User', 'U') IS NOT NULL
    DELETE FROM PhoneNumber_User;
DELETE FROM empresas;
DELETE FROM mercados;
DELETE FROM usuarios WHERE id_role = 3; -- Solo traders, mantener admin
GO

-- =====================================================
-- PASO 2: CREAR TRADERS
-- =====================================================

-- Contraseña para todos: "Holahola1" (ya encriptada con bcrypt)
DECLARE @password VARCHAR(255) = '$2a$12$sVZCDeYTv37ctmJkuS4T5OGpOV9M95TLBDvm8r84yevJnf.mw8i6S';

-- Trader 1: JUNIOR
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE alias = 'trader_junior')
BEGIN
    INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, status, id_role, token_version)
    VALUES ('trader_junior', 'junior@brokertec.com', 'Carlos', 'Rodríguez', 'Pérez', @password, 'Costa Rica', 1, 3, 0);
END

-- Trader 2: MID
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE alias = 'trader_sofia')
BEGIN
    INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, status, id_role, token_version)
    VALUES ('trader_sofia', 'sofia@brokertec.com', 'Sofía', 'Martínez', 'López', @password, 'México', 1, 3, 0);
END

-- Trader 3: MID
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE alias = 'trader_tech')
BEGIN
    INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, status, id_role, token_version)
    VALUES ('trader_tech', 'tech@brokertec.com', 'Miguel', 'González', 'Ramírez', @password, 'España', 1, 3, 0);
END

-- Trader 4: SENIOR
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE alias = 'trader_pro')
BEGIN
    INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, status, id_role, token_version)
    VALUES ('trader_pro', 'pro@brokertec.com', 'Laura', 'Sánchez', 'Mora', @password, 'Argentina', 1, 3, 0);
END

-- Trader 5: DESHABILITADO
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE alias = 'trader_suspended')
BEGIN
    INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, status, id_role, token_version)
    VALUES ('trader_suspended', 'suspended@brokertec.com', 'Roberto', 'Vargas', 'Castro', @password, 'Colombia', 1, 3, 0);
END

PRINT ' Traders creados';
GO

-- =====================================================
-- PASO 3: CREAR WALLETS PARA TRADERS
-- =====================================================

DECLARE @trader_junior_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_junior');
DECLARE @trader_sofia_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_sofia');
DECLARE @trader_tech_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_tech');
DECLARE @trader_pro_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_pro');
DECLARE @trader_suspended_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_suspended');

-- Wallet JUNIOR: Límite 5000 USD/día, empieza con 8000 USD
INSERT INTO wallets (id_user, saldo, categoria, limite_diario, consumo_dia, fecha_ultima_recarga, fecha_creacion)
VALUES (@trader_junior_id, 8000.00, 'JUNIOR', 5000.00, 0.00, DATEADD(DAY, -1, GETDATE()), DATEADD(DAY, -5, GETDATE()));

-- Wallet MID (Sofía): Límite 10000 USD/día, empieza con 25000 USD
INSERT INTO wallets (id_user, saldo, categoria, limite_diario, consumo_dia, fecha_ultima_recarga, fecha_creacion)
VALUES (@trader_sofia_id, 25000.00, 'MID', 10000.00, 0.00, DATEADD(DAY, -1, GETDATE()), DATEADD(DAY, -5, GETDATE()));

-- Wallet MID (Tech): Límite 10000 USD/día, empieza con 12000 USD
INSERT INTO wallets (id_user, saldo, categoria, limite_diario, consumo_dia, fecha_ultima_recarga, fecha_creacion)
VALUES (@trader_tech_id, 12000.00, 'MID', 10000.00, 0.00, DATEADD(DAY, -1, GETDATE()), DATEADD(DAY, -5, GETDATE()));

-- Wallet SENIOR: Límite 50000 USD/día, empieza con 50000 USD
INSERT INTO wallets (id_user, saldo, categoria, limite_diario, consumo_dia, fecha_ultima_recarga, fecha_creacion)
VALUES (@trader_pro_id, 50000.00, 'SENIOR', 50000.00, 0.00, DATEADD(DAY, -1, GETDATE()), DATEADD(DAY, -5, GETDATE()));

-- Wallet DESHABILITADO: Tenía MID, empieza con 10000 USD (será liquidado en día 4)
INSERT INTO wallets (id_user, saldo, categoria, limite_diario, consumo_dia, fecha_ultima_recarga, fecha_creacion)
VALUES (@trader_suspended_id, 10000.00, 'MID', 10000.00, 0.00, DATEADD(DAY, -1, GETDATE()), DATEADD(DAY, -5, GETDATE()));

PRINT ' Wallets creados';
GO

-- =====================================================
-- PASO 3.5: AGREGAR NÚMEROS DE TELÉFONO A TRADERS
-- =====================================================

DECLARE @trader_junior_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_junior');
DECLARE @trader_sofia_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_sofia');
DECLARE @trader_tech_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_tech');
DECLARE @trader_pro_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_pro');
DECLARE @trader_suspended_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_suspended');

-- Determinar nombre correcto de la tabla
DECLARE @table_name NVARCHAR(100);
IF OBJECT_ID('phone_number_users', 'U') IS NOT NULL
    SET @table_name = 'phone_number_users';
ELSE IF OBJECT_ID('PhoneNumber_User', 'U') IS NOT NULL
    SET @table_name = 'PhoneNumber_User';

IF @table_name IS NOT NULL
BEGIN
    DECLARE @sql NVARCHAR(MAX);
    
    SET @sql = N'INSERT INTO ' + @table_name + ' (id_user, phone_number) VALUES 
        (' + CAST(@trader_junior_id AS NVARCHAR(10)) + ', ''+50688887777''),
        (' + CAST(@trader_sofia_id AS NVARCHAR(10)) + ', ''+52555123456''),
        (' + CAST(@trader_tech_id AS NVARCHAR(10)) + ', ''+34912345678''),
        (' + CAST(@trader_pro_id AS NVARCHAR(10)) + ', ''+541142345678''),
        (' + CAST(@trader_suspended_id AS NVARCHAR(10)) + ', ''+573001234567'')';
    
    EXEC sp_executesql @sql;
    PRINT 'Numeros de telefono agregados';
END
GO

-- =====================================================
-- PASO 4: CREAR MERCADOS
-- =====================================================

-- Mercado 1: NASDAQ
IF NOT EXISTS (SELECT 1 FROM mercados WHERE nombre = 'NASDAQ')
BEGIN
    INSERT INTO mercados (nombre, habilitado, fecha_creacion)
    VALUES ('NASDAQ', 1, DATEADD(DAY, -10, GETDATE()));
END

-- Mercado 2: NYSE
IF NOT EXISTS (SELECT 1 FROM mercados WHERE nombre = 'NYSE')
BEGIN
    INSERT INTO mercados (nombre, habilitado, fecha_creacion)
    VALUES ('NYSE', 1, DATEADD(DAY, -10, GETDATE()));
END

-- Mercado 3: BME
IF NOT EXISTS (SELECT 1 FROM mercados WHERE nombre = 'BME')
BEGIN
    INSERT INTO mercados (nombre, habilitado, fecha_creacion)
    VALUES ('BME', 1, DATEADD(DAY, -10, GETDATE()));
END

GO

-- =====================================================
-- PASO 5: CREAR EMPRESAS CON PRECIOS INICIALES
-- =====================================================

DECLARE @mercado_nasdaq INT = (SELECT TOP 1 id_mercado FROM mercados WHERE nombre = 'NASDAQ');
DECLARE @mercado_nyse INT = (SELECT TOP 1 id_mercado FROM mercados WHERE nombre = 'NYSE');
DECLARE @mercado_bme INT = (SELECT TOP 1 id_mercado FROM mercados WHERE nombre = 'BME');
DECLARE @fecha_dia1 DATETIME = DATEADD(DAY, -5, GETDATE());

-- === NASDAQ (3 empresas tecnológicas) ===
-- Apple Inc.
INSERT INTO empresas (nombre, id_mercado, precio_actual, cantidad_acciones, habilitado, fecha_creacion)
VALUES ('Apple Inc.', @mercado_nasdaq, 175.50, 5000, 1, @fecha_dia1);
DECLARE @empresa_apple INT = SCOPE_IDENTITY();

-- Microsoft Corporation
INSERT INTO empresas (nombre, id_mercado, precio_actual, cantidad_acciones, habilitado, fecha_creacion)
VALUES ('Microsoft Corporation', @mercado_nasdaq, 380.25, 8000, 1, @fecha_dia1);
DECLARE @empresa_microsoft INT = SCOPE_IDENTITY();

-- NVIDIA Corporation
INSERT INTO empresas (nombre, id_mercado, precio_actual, cantidad_acciones, habilitado, fecha_creacion)
VALUES ('NVIDIA Corporation', @mercado_nasdaq, 520.80, 6000, 1, @fecha_dia1);
DECLARE @empresa_nvidia INT = SCOPE_IDENTITY();

-- === NYSE (3 empresas tradicionales) ===
-- Coca-Cola Company
INSERT INTO empresas (nombre, id_mercado, precio_actual, cantidad_acciones, habilitado, fecha_creacion)
VALUES ('Coca-Cola Company', @mercado_nyse, 58.90, 7500, 1, @fecha_dia1);
DECLARE @empresa_coca INT = SCOPE_IDENTITY();

-- JPMorgan Chase
INSERT INTO empresas (nombre, id_mercado, precio_actual, cantidad_acciones, habilitado, fecha_creacion)
VALUES ('JPMorgan Chase & Co.', @mercado_nyse, 145.30, 9000, 1, @fecha_dia1);
DECLARE @empresa_jpmorgan INT = SCOPE_IDENTITY();

-- Boeing Company
INSERT INTO empresas (nombre, id_mercado, precio_actual, cantidad_acciones, habilitado, fecha_creacion)
VALUES ('Boeing Company', @mercado_nyse, 187.60, 7000, 1, @fecha_dia1);
DECLARE @empresa_boeing INT = SCOPE_IDENTITY();

-- === BME (3 empresas españolas) ===
-- Banco Santander
INSERT INTO empresas (nombre, id_mercado, precio_actual, cantidad_acciones, habilitado, fecha_creacion)
VALUES ('Banco Santander', @mercado_bme, 3.85, 5000, 1, @fecha_dia1);
DECLARE @empresa_santander INT = SCOPE_IDENTITY();

-- Telefónica
INSERT INTO empresas (nombre, id_mercado, precio_actual, cantidad_acciones, habilitado, fecha_creacion)
VALUES ('Telefónica S.A.', @mercado_bme, 4.12, 4000, 1, @fecha_dia1);
DECLARE @empresa_telefonica INT = SCOPE_IDENTITY();

-- Inditex (Zara)
INSERT INTO empresas (nombre, id_mercado, precio_actual, cantidad_acciones, habilitado, fecha_creacion)
VALUES ('Inditex S.A.', @mercado_bme, 32.45, 4200, 1, @fecha_dia1);
DECLARE @empresa_inditex INT = SCOPE_IDENTITY();

GO

-- =====================================================
-- PASO 6: REGISTRAR PRECIOS HISTÓRICOS DÍA 1
-- =====================================================


DECLARE @empresa_apple INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Apple Inc.');
DECLARE @empresa_microsoft INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Microsoft Corporation');
DECLARE @empresa_nvidia INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'NVIDIA Corporation');
DECLARE @empresa_coca INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Coca-Cola Company');
DECLARE @empresa_jpmorgan INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'JPMorgan Chase & Co.');
DECLARE @empresa_boeing INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Boeing Company');
DECLARE @empresa_santander INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Banco Santander');
DECLARE @empresa_telefonica INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Telefónica S.A.');
DECLARE @empresa_inditex INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Inditex S.A.');
DECLARE @fecha_dia1 DATETIME = DATEADD(DAY, -5, GETDATE());

-- Día 1: Precios de apertura
INSERT INTO precios_historicos (id_empresa, precio, fecha_hora) VALUES
(@empresa_apple, 175.50, @fecha_dia1),
(@empresa_microsoft, 380.25, @fecha_dia1),
(@empresa_nvidia, 520.80, @fecha_dia1),
(@empresa_coca, 58.90, @fecha_dia1),
(@empresa_jpmorgan, 145.30, @fecha_dia1),
(@empresa_boeing, 187.60, @fecha_dia1),
(@empresa_santander, 3.85, @fecha_dia1),
(@empresa_telefonica, 4.12, @fecha_dia1),
(@empresa_inditex, 32.45, @fecha_dia1);


GO

-- =====================================================
-- DÍA 1: OPERACIONES INICIALES
-- =====================================================


DECLARE @trader_junior_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_junior');
DECLARE @trader_sofia_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_sofia');
DECLARE @trader_tech_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_tech');
DECLARE @trader_pro_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_pro');
DECLARE @trader_suspended_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_suspended');
DECLARE @empresa_apple INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Apple Inc.');
DECLARE @empresa_microsoft INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Microsoft Corporation');
DECLARE @empresa_nvidia INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'NVIDIA Corporation');
DECLARE @empresa_coca INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Coca-Cola Company');
DECLARE @empresa_jpmorgan INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'JPMorgan Chase & Co.');
DECLARE @empresa_boeing INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Boeing Company');
DECLARE @empresa_santander INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Banco Santander');
DECLARE @empresa_telefonica INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Telefónica S.A.');
DECLARE @empresa_inditex INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Inditex S.A.');
DECLARE @fecha_dia1 DATETIME = DATEADD(DAY, -5, GETDATE());
DECLARE @msg NVARCHAR(500), @exito BIT;

-- Junior compra Apple (estrategia conservadora)
EXEC usp_ComprarAcciones @trader_junior_id, @empresa_apple, 20, 'trader_junior', @msg OUTPUT, @exito OUTPUT;

-- Sofia compra Microsoft
EXEC usp_ComprarAcciones @trader_sofia_id, @empresa_microsoft, 50, 'trader_sofia', @msg OUTPUT, @exito OUTPUT;

-- Tech compra NVIDIA
EXEC usp_ComprarAcciones @trader_tech_id, @empresa_nvidia, 15, 'trader_tech', @msg OUTPUT, @exito OUTPUT;

-- Pro compra JPMorgan
EXEC usp_ComprarAcciones @trader_pro_id, @empresa_jpmorgan, 100, 'trader_pro', @msg OUTPUT, @exito OUTPUT;

-- Pro compra Coca-Cola
EXEC usp_ComprarAcciones @trader_pro_id, @empresa_coca, 200, 'trader_pro', @msg OUTPUT, @exito OUTPUT;

-- Suspended compra Santander
EXEC usp_ComprarAcciones @trader_suspended_id, @empresa_santander, 500, 'trader_suspended', @msg OUTPUT, @exito OUTPUT;

PRINT 'Operaciones Dia 1 completadas';


GO

-- =====================================================
-- DÍA 2: MERCADO SUBE - ACTUALIZAR PRECIOS
-- =====================================================


DECLARE @fecha_dia2 DATETIME = DATEADD(DAY, -4, GETDATE());
DECLARE @empresa_apple INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Apple Inc.');
DECLARE @empresa_microsoft INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Microsoft Corporation');
DECLARE @empresa_nvidia INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'NVIDIA Corporation');
DECLARE @empresa_coca INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Coca-Cola Company');
DECLARE @empresa_jpmorgan INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'JPMorgan Chase & Co.');
DECLARE @empresa_boeing INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Boeing Company');
DECLARE @empresa_santander INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Banco Santander');
DECLARE @empresa_telefonica INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Telefónica S.A.');
DECLARE @empresa_inditex INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Inditex S.A.');

-- Actualizar precios (subida moderada)
UPDATE empresas SET precio_actual = 182.30 WHERE id_empresa = @empresa_apple; -- +3.9%
UPDATE empresas SET precio_actual = 395.80 WHERE id_empresa = @empresa_microsoft; -- +4.1%
UPDATE empresas SET precio_actual = 548.90 WHERE id_empresa = @empresa_nvidia; -- +5.4%
UPDATE empresas SET precio_actual = 60.15 WHERE id_empresa = @empresa_coca; -- +2.1%
UPDATE empresas SET precio_actual = 149.75 WHERE id_empresa = @empresa_jpmorgan; -- +3.1%
UPDATE empresas SET precio_actual = 185.20 WHERE id_empresa = @empresa_boeing; -- -1.3%
UPDATE empresas SET precio_actual = 3.92 WHERE id_empresa = @empresa_santander; -- +1.8%
UPDATE empresas SET precio_actual = 4.18 WHERE id_empresa = @empresa_telefonica; -- +1.5%
UPDATE empresas SET precio_actual = 33.10 WHERE id_empresa = @empresa_inditex; -- +2.0%

-- Registrar en histórico
INSERT INTO precios_historicos (id_empresa, precio, fecha_hora) VALUES
(@empresa_apple, 182.30, @fecha_dia2),
(@empresa_microsoft, 395.80, @fecha_dia2),
(@empresa_nvidia, 548.90, @fecha_dia2),
(@empresa_coca, 60.15, @fecha_dia2),
(@empresa_jpmorgan, 149.75, @fecha_dia2),
(@empresa_boeing, 185.20, @fecha_dia2),
(@empresa_santander, 3.92, @fecha_dia2),
(@empresa_telefonica, 4.18, @fecha_dia2),
(@empresa_inditex, 33.10, @fecha_dia2);

-- Auditoría de actualización de precios
DECLARE @id_admin INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'admin');
INSERT INTO auditoria (id_user, user_alias, user_role, accion, entidad_afectada, descripcion, fecha_hora, exitosa)
VALUES (@id_admin, 'admin', 'ADMINISTRADOR', 'PRECIO_UPDATE_API', 'precios', 'Actualización automática de precios - Día 2', @fecha_dia2, 1);


GO

-- Operaciones Día 2

DECLARE @trader_junior_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_junior');
DECLARE @trader_tech_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_tech');
DECLARE @trader_pro_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_pro');
DECLARE @empresa_apple INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Apple Inc.');
DECLARE @empresa_nvidia INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'NVIDIA Corporation');
DECLARE @empresa_inditex INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Inditex S.A.');
DECLARE @msg NVARCHAR(500), @exito BIT;

-- Junior vende 10 Apple con ganancia
EXEC usp_VenderAcciones @trader_junior_id, @empresa_apple, 10, 'trader_junior', @msg OUTPUT, @exito OUTPUT;

-- Tech compra mas NVIDIA
EXEC usp_ComprarAcciones @trader_tech_id, @empresa_nvidia, 5, 'trader_tech', @msg OUTPUT, @exito OUTPUT;

-- Pro compra Inditex
EXEC usp_ComprarAcciones @trader_pro_id, @empresa_inditex, 300, 'trader_pro', @msg OUTPUT, @exito OUTPUT;

PRINT 'Operaciones Dia 2 completadas';
GO

-- =====================================================
-- DÍA 3: VOLATILIDAD - ALGUNAS SUBEN, OTRAS BAJAN
-- =====================================================


DECLARE @fecha_dia3 DATETIME = DATEADD(DAY, -3, GETDATE());
DECLARE @empresa_apple INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Apple Inc.');
DECLARE @empresa_microsoft INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Microsoft Corporation');
DECLARE @empresa_nvidia INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'NVIDIA Corporation');
DECLARE @empresa_coca INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Coca-Cola Company');
DECLARE @empresa_jpmorgan INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'JPMorgan Chase & Co.');
DECLARE @empresa_boeing INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Boeing Company');
DECLARE @empresa_santander INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Banco Santander');
DECLARE @empresa_telefonica INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Telefónica S.A.');
DECLARE @empresa_inditex INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Inditex S.A.');

-- Actualizar precios (volatilidad)
UPDATE empresas SET precio_actual = 178.90 WHERE id_empresa = @empresa_apple;
UPDATE empresas SET precio_actual = 402.50 WHERE id_empresa = @empresa_microsoft;
UPDATE empresas SET precio_actual = 535.20 WHERE id_empresa = @empresa_nvidia;
UPDATE empresas SET precio_actual = 59.50 WHERE id_empresa = @empresa_coca;
UPDATE empresas SET precio_actual = 152.40 WHERE id_empresa = @empresa_jpmorgan;
UPDATE empresas SET precio_actual = 182.10 WHERE id_empresa = @empresa_boeing;
UPDATE empresas SET precio_actual = 3.78 WHERE id_empresa = @empresa_santander;
UPDATE empresas SET precio_actual = 4.25 WHERE id_empresa = @empresa_telefonica;
UPDATE empresas SET precio_actual = 34.80 WHERE id_empresa = @empresa_inditex;

-- Registrar histórico
INSERT INTO precios_historicos (id_empresa, precio, fecha_hora) VALUES
(@empresa_apple, 178.90, @fecha_dia3),
(@empresa_microsoft, 402.50, @fecha_dia3),
(@empresa_nvidia, 535.20, @fecha_dia3),
(@empresa_coca, 59.50, @fecha_dia3),
(@empresa_jpmorgan, 152.40, @fecha_dia3),
(@empresa_boeing, 182.10, @fecha_dia3),
(@empresa_santander, 3.78, @fecha_dia3),
(@empresa_telefonica, 4.25, @fecha_dia3),
(@empresa_inditex, 34.80, @fecha_dia3);

DECLARE @id_admin INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'admin');
INSERT INTO auditoria (id_user, user_alias, user_role, accion, entidad_afectada, descripcion, fecha_hora, exitosa)
VALUES (@id_admin, 'admin', 'ADMINISTRADOR', 'PRECIO_UPDATE_API', 'precios', 'Actualización automática de precios - Día 3 (volátil)', @fecha_dia3, 1);

GO

-- Operaciones Día 3

DECLARE @trader_sofia_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_sofia');
DECLARE @trader_tech_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_tech');
DECLARE @trader_suspended_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_suspended');
DECLARE @empresa_microsoft INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Microsoft Corporation');
DECLARE @empresa_nvidia INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'NVIDIA Corporation');
DECLARE @empresa_santander INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Banco Santander');
DECLARE @msg NVARCHAR(500), @exito BIT;

-- Sofia vende Microsoft
EXEC usp_VenderAcciones @trader_sofia_id, @empresa_microsoft, 20, 'trader_sofia', @msg OUTPUT, @exito OUTPUT;

-- Tech vende NVIDIA
EXEC usp_VenderAcciones @trader_tech_id, @empresa_nvidia, 20, 'trader_tech', @msg OUTPUT, @exito OUTPUT;

-- Suspended vende Santander
EXEC usp_VenderAcciones @trader_suspended_id, @empresa_santander, 500, 'trader_suspended', @msg OUTPUT, @exito OUTPUT;

PRINT 'Operaciones Dia 3 completadas';
GO

-- =====================================================
-- DÍA 4: CORRECCIÓN DEL MERCADO - CAÍDA GENERALIZADA
-- =====================================================

DECLARE @fecha_dia4 DATETIME = DATEADD(DAY, -2, GETDATE());
DECLARE @empresa_apple INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Apple Inc.');
DECLARE @empresa_microsoft INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Microsoft Corporation');
DECLARE @empresa_nvidia INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'NVIDIA Corporation');
DECLARE @empresa_coca INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Coca-Cola Company');
DECLARE @empresa_jpmorgan INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'JPMorgan Chase & Co.');
DECLARE @empresa_boeing INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Boeing Company');
DECLARE @empresa_santander INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Banco Santander');
DECLARE @empresa_telefonica INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Telefónica S.A.');
DECLARE @empresa_inditex INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Inditex S.A.');

-- Actualizar precios (correccion bajista)
UPDATE empresas SET precio_actual = 172.40 WHERE id_empresa = @empresa_apple;
UPDATE empresas SET precio_actual = 388.20 WHERE id_empresa = @empresa_microsoft;
UPDATE empresas SET precio_actual = 510.30 WHERE id_empresa = @empresa_nvidia;
UPDATE empresas SET precio_actual = 57.80 WHERE id_empresa = @empresa_coca;
UPDATE empresas SET precio_actual = 147.90 WHERE id_empresa = @empresa_jpmorgan;
UPDATE empresas SET precio_actual = 178.50 WHERE id_empresa = @empresa_boeing;
UPDATE empresas SET precio_actual = 3.68 WHERE id_empresa = @empresa_santander;
UPDATE empresas SET precio_actual = 4.08 WHERE id_empresa = @empresa_telefonica;
UPDATE empresas SET precio_actual = 33.20 WHERE id_empresa = @empresa_inditex;

-- Registrar histórico
INSERT INTO precios_historicos (id_empresa, precio, fecha_hora) VALUES
(@empresa_apple, 172.40, @fecha_dia4),
(@empresa_microsoft, 388.20, @fecha_dia4),
(@empresa_nvidia, 510.30, @fecha_dia4),
(@empresa_coca, 57.80, @fecha_dia4),
(@empresa_jpmorgan, 147.90, @fecha_dia4),
(@empresa_boeing, 178.50, @fecha_dia4),
(@empresa_santander, 3.68, @fecha_dia4),
(@empresa_telefonica, 4.08, @fecha_dia4),
(@empresa_inditex, 33.20, @fecha_dia4);

DECLARE @id_admin INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'admin');
INSERT INTO auditoria (id_user, user_alias, user_role, accion, entidad_afectada, descripcion, fecha_hora, exitosa)
VALUES (@id_admin, 'admin', 'ADMINISTRADOR', 'PRECIO_UPDATE_API', 'precios', 'Actualización automática de precios - Día 4 (corrección bajista)', @fecha_dia4, 1);

GO

-- Operaciones Día 4

DECLARE @trader_suspended_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_suspended');
DECLARE @trader_pro_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_pro');
DECLARE @empresa_coca INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Coca-Cola Company');
DECLARE @id_admin INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'admin');
DECLARE @msg NVARCHAR(500), @exito BIT;

-- Pro vende Coca-Cola
EXEC usp_VenderAcciones @trader_pro_id, @empresa_coca, 100, 'trader_pro', @msg OUTPUT, @exito OUTPUT;

-- Deshabilitar trader suspended (operaciones sospechosas)
EXEC usp_DisableTrader 
    @id_trader = @trader_suspended_id, 
    @justificacion = 'Operaciones fraudulentas detectadas: multiples ventas en panico sin analisis',
    @id_admin = @id_admin,
    @admin_alias = 'admin',
    @admin_role = 'ADMINISTRADOR';

PRINT 'Operaciones Dia 4 completadas - Trader suspended deshabilitado';
GO

-- =====================================================
-- DÍA 5: RECUPERACIÓN DEL MERCADO
-- =====================================================

DECLARE @fecha_dia5 DATETIME = DATEADD(DAY, -1, GETDATE());
DECLARE @empresa_apple INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Apple Inc.');
DECLARE @empresa_microsoft INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Microsoft Corporation');
DECLARE @empresa_nvidia INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'NVIDIA Corporation');
DECLARE @empresa_coca INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Coca-Cola Company');
DECLARE @empresa_jpmorgan INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'JPMorgan Chase & Co.');
DECLARE @empresa_boeing INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Boeing Company');
DECLARE @empresa_santander INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Banco Santander');
DECLARE @empresa_telefonica INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Telefónica S.A.');
DECLARE @empresa_inditex INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Inditex S.A.');

-- Actualizar precios (recuperacion fuerte)
UPDATE empresas SET precio_actual = 185.60 WHERE id_empresa = @empresa_apple;
UPDATE empresas SET precio_actual = 408.90 WHERE id_empresa = @empresa_microsoft;
UPDATE empresas SET precio_actual = 562.40 WHERE id_empresa = @empresa_nvidia;
UPDATE empresas SET precio_actual = 61.20 WHERE id_empresa = @empresa_coca;
UPDATE empresas SET precio_actual = 156.80 WHERE id_empresa = @empresa_jpmorgan;
UPDATE empresas SET precio_actual = 189.70 WHERE id_empresa = @empresa_boeing;
UPDATE empresas SET precio_actual = 4.05 WHERE id_empresa = @empresa_santander;
UPDATE empresas SET precio_actual = 4.32 WHERE id_empresa = @empresa_telefonica;
UPDATE empresas SET precio_actual = 36.50 WHERE id_empresa = @empresa_inditex;

-- Registrar histórico
INSERT INTO precios_historicos (id_empresa, precio, fecha_hora) VALUES
(@empresa_apple, 180.50, @fecha_dia5),
(@empresa_microsoft, 410.80, @fecha_dia5),
(@empresa_nvidia, 545.20, @fecha_dia5),
(@empresa_coca, 61.20, @fecha_dia5),
(@empresa_jpmorgan, 157.30, @fecha_dia5),
(@empresa_boeing, 190.20, @fecha_dia5),
(@empresa_santander, 3.95, @fecha_dia5),
(@empresa_telefonica, 4.35, @fecha_dia5),
(@empresa_inditex, 35.50, @fecha_dia5);

DECLARE @id_admin INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'admin');
INSERT INTO auditoria (id_user, user_alias, user_role, accion, entidad_afectada, descripcion, fecha_hora, exitosa)
VALUES (@id_admin, 'admin', 'ADMINISTRADOR', 'PRECIO_UPDATE_API', 'precios', 'Actualización automática de precios - Día 5 (recuperación)', @fecha_dia5, 1);

GO

-- Operaciones Día 5

DECLARE @trader_junior_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_junior');
DECLARE @trader_sofia_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_sofia');
DECLARE @trader_pro_id INT = (SELECT TOP 1 id_user FROM usuarios WHERE alias = 'trader_pro');
DECLARE @empresa_apple INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Apple Inc.');
DECLARE @empresa_jpmorgan INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'JPMorgan Chase & Co.');
DECLARE @empresa_inditex INT = (SELECT TOP 1 id_empresa FROM empresas WHERE nombre = 'Inditex S.A.');
DECLARE @fecha_dia5 DATETIME = DATEADD(DAY, -1, GETDATE());
DECLARE @msg NVARCHAR(500), @exito BIT;

-- Junior vende resto de Apple
EXEC usp_VenderAcciones @trader_junior_id, @empresa_apple, 10, 'trader_junior', @msg OUTPUT, @exito OUTPUT;

-- Pro vende JPMorgan
EXEC usp_VenderAcciones @trader_pro_id, @empresa_jpmorgan, 50, 'trader_pro', @msg OUTPUT, @exito OUTPUT;

-- Pro vende Inditex
EXEC usp_VenderAcciones @trader_pro_id, @empresa_inditex, 200, 'trader_pro', @msg OUTPUT, @exito OUTPUT;

-- Sofia recarga wallet
UPDATE wallets SET consumo_dia = 0, fecha_ultima_recarga = @fecha_dia5 WHERE id_user = @trader_sofia_id;
UPDATE wallets SET saldo = saldo + 5000.00 WHERE id_user = @trader_sofia_id;
INSERT INTO auditoria (id_user, user_alias, user_role, accion, entidad_afectada, monto_operacion, saldo_anterior, saldo_nuevo, fecha_hora, exitosa)
VALUES (@trader_sofia_id, 'trader_sofia', 'TRADER', 'RECARGA_WALLET', 'wallet', 5000.00, (SELECT saldo - 5000.00 FROM wallets WHERE id_user = @trader_sofia_id), (SELECT saldo FROM wallets WHERE id_user = @trader_sofia_id), @fecha_dia5, 1);

PRINT 'Operaciones Dia 5 completadas';
GO

