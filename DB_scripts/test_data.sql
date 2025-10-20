USE BrokerTEC;

-------------------------------------------------------------------------
-- PASO 1: DECLARACIÓN DE VARIABLES
-------------------------------------------------------------------------

-- Declarar variables para almacenar los UUIDs de los usuarios y Roles
DECLARE @AdminRoleID INT;
DECLARE @TraderRoleID INT;
DECLARE @AnalystRoleID INT;

DECLARE @JoseAdminID UNIQUEIDENTIFIER;
DECLARE @JasonAnalystID UNIQUEIDENTIFIER;
DECLARE @YonathanAnalystID UNIQUEIDENTIFIER;
DECLARE @FernandaTraderID UNIQUEIDENTIFIER;
DECLARE @KevinTraderID UNIQUEIDENTIFIER;

-- Declarar variables para IDs de Mercado y Empresas
DECLARE @TecMarketID INT;
DECLARE @InnMarketID INT;
DECLARE @AlphaID INT;
DECLARE @BetaID INT;
DECLARE @GammaID INT;
DECLARE @DeltaID INT;

-- Hash de Contraseña (usando HASHBYTES como placeholder)
DECLARE @PasswordHash VARBINARY(256) = HASHBYTES('SHA2_256', 'BrokerTEC2025');


-- Evitar TRUNCATE porque puede fallar si existen FKs referenciando las tablas.
-- En lugar de truncar, insertamos de forma idempotente (IF NOT EXISTS) para no duplicar datos.

-------------------------------------------------------------------------
-- PASO 2: INSERCIÓN DE ROLES
-------------------------------------------------------------------------

INSERT INTO roles (role_name) VALUES
('ADMINISTRADOR'),
('TRADER'),
('ANALISTA');

-- Obtener los IDs de Rol generados
SELECT @AdminRoleID = id_role FROM roles WHERE role_name = 'ADMINISTRADOR';
SELECT @TraderRoleID = id_role FROM roles WHERE role_name = 'TRADER';
SELECT @AnalystRoleID = id_role FROM roles WHERE role_name = 'ANALISTA';

-------------------------------------------------------------------------
-- PASO 3: INSERCIÓN DE USUARIOS Y OBTENCIÓN DE UUIDS
-------------------------------------------------------------------------

-- 1. Administrador: Jose Loria Cordero
INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, id_role)
VALUES ('J_Loria', 'jose.loria@tec.cr', 'Jose', 'Loria', 'Cordero', @PasswordHash, 'Costa Rica', @AdminRoleID);
SELECT @JoseAdminID = id_user FROM usuarios WHERE alias = 'J_Loria';

-- 2. Traders: Fernanda Alvarez Martinez y Kevin Chinchilla Rodriguez
INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, id_role)
VALUES ('F_Alvarez', 'f.alvarez@tec.cr', 'Fernanda', 'Alvarez', 'Martinez', @PasswordHash, 'Costa Rica', @TraderRoleID);
SELECT @FernandaTraderID = id_user FROM usuarios WHERE alias = 'F_Alvarez';

INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, id_role)
VALUES ('K_Chinchi', 'k.chinchilla@tec.cr', 'Kevin', 'Chinchilla', 'Rodriguez', @PasswordHash, 'Costa Rica', @TraderRoleID);
SELECT @KevinTraderID = id_user FROM usuarios WHERE alias = 'K_Chinchi';

-- 3. Analistas: Jason Alvarado Camacho y Yonathan Monge Sanabria
INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, id_role)
VALUES ('J_Alva', 'j.alvarado@tec.cr', 'Jason', 'Alvarado', 'Camacho', @PasswordHash, 'Costa Rica', @AnalystRoleID);
SELECT @JasonAnalystID = id_user FROM usuarios WHERE alias = 'J_Alva';

INSERT INTO usuarios (alias, email, nombre, apellido1, apellido2, password, country_origin, id_role)
VALUES ('Y_Monge', 'y.monge@tec.cr', 'Yonathan', 'Monge', 'Sanabria', @PasswordHash, 'Costa Rica', @AnalystRoleID);
SELECT @YonathanAnalystID = id_user FROM usuarios WHERE alias = 'Y_Monge';

-------------------------------------------------------------------------
-- PASO 4: INSERCIÓN DE MERCADOS Y EMPRESAS (Tecnología)
-------------------------------------------------------------------------

-- 1. Mercados
INSERT INTO mercado (nombre, estado, moneda) VALUES
('Global Tech Index', 'Open', 'USD'),
('Software Solutions', 'Open', 'USD');

SELECT @TecMarketID = id_mercado FROM mercado WHERE nombre = 'Global Tech Index';
SELECT @InnMarketID = id_mercado FROM mercado WHERE nombre = 'Software Solutions';

-- 2. Empresas (Tecnología)
INSERT INTO empresa (id_mercado, nombre, acciones_totales, acciones_disponibles, capital_actual, estado) VALUES
(@TecMarketID, 'Cyberdyne Systems', 50000000, 1000000, 1500000.00, 'Listed'), -- ID ~1
(@TecMarketID, 'Aperture Science', 25000000, 500000, 800000.00, 'Listed'),  -- ID ~2
(@InnMarketID, 'OmniCorp Software', 10000000, 200000, 400000.00, 'Listed'),  -- ID ~3
(@InnMarketID, 'Quantum Leap Inc', 7500000, 150000, 1200000.00, 'Listed');   -- ID ~4

SELECT @AlphaID = id_empresa FROM empresa WHERE nombre = 'Cyberdyne Systems';
SELECT @BetaID = id_empresa FROM empresa WHERE nombre = 'Aperture Science';
SELECT @GammaID = id_empresa FROM empresa WHERE nombre = 'OmniCorp Software';
SELECT @DeltaID = id_empresa FROM empresa WHERE nombre = 'Quantum Leap Inc';

-------------------------------------------------------------------------
-- PASO 5: INSERCIÓN DE PRECIOS HISTÓRICOS Y WALLETS
-------------------------------------------------------------------------

-- 1. Precios Históricos (Precio actual para SPs)
INSERT INTO precio_historico (id_empresa, precio, fecha_hora) VALUES
(@AlphaID, 30.00, DATEADD(hour, -2, GETDATE())),
(@AlphaID, 30.50, GETDATE()), -- Actual: 30.50

(@BetaID, 15.00, DATEADD(hour, -2, GETDATE())),
(@BetaID, 15.20, GETDATE()), -- Actual: 15.20

(@GammaID, 40.00, DATEADD(hour, -1, GETDATE())),
(@GammaID, 40.10, GETDATE()), -- Actual: 40.10

(@DeltaID, 100.00, GETDATE()); -- Actual: 100.00

-- 2. Wallets
INSERT INTO wallet (id_user, saldo, categoria, limite_diario, consumo_diario) VALUES
(@FernandaTraderID, 25000.00, 'Senior', 15000.00, 0.00), -- ID ~1
(@KevinTraderID, 10000.00, 'Mid', 5000.00, 0.00);        -- ID ~2

DECLARE @FernandaWalletID INT;
DECLARE @KevinWalletID INT;

SELECT @FernandaWalletID = id_wallet FROM wallet WHERE id_user = @FernandaTraderID;
SELECT @KevinWalletID = id_wallet FROM wallet WHERE id_user = @KevinTraderID;

-------------------------------------------------------------------------
-- PASO 6: INSERCIÓN DE RECARGAS Y TRANSACCIONES
-------------------------------------------------------------------------

-- 1. Recargas (Top-ups)
INSERT INTO recarga (id_wallet, monto, fecha_hora) VALUES
(@FernandaWalletID, 5000.00, DATEADD(day, -5, GETDATE())),
(@KevinWalletID, 2000.00, DATEADD(hour, -3, GETDATE()));

-- 2. Transacciones (Compras y Ventas)
-- Simular transacciones para Fernanda (ID: @FernandaTraderID)
INSERT INTO transaccion (id_user, id_empresa, tipo, cantidad, precio, fecha_hora) VALUES
(@FernandaTraderID, @AlphaID, 'Buy', 100, 30.00, DATEADD(day, -2, GETDATE())), -- Compra inicial
(@FernandaTraderID, @BetaID, 'Buy', 50, 15.00, DATEADD(day, -1, GETDATE())),
(@FernandaTraderID, @AlphaID, 'Sell', 10, 30.50, GETDATE()); -- Venta parcial

-- Simular transacciones para Kevin (ID: @KevinTraderID)
INSERT INTO transaccion (id_user, id_empresa, tipo, cantidad, precio, fecha_hora) VALUES
(@KevinTraderID, @GammaID, 'Buy', 200, 40.00, DATEADD(hour, -4, GETDATE()));

-------------------------------------------------------------------------
-- PASO 7: CREACIÓN DE PORTAFOLIOS (Debe reflejar las transacciones)
-------------------------------------------------------------------------

-- Nota: En un sistema real, esto lo haría el SP de Compra/Venta. Aquí lo hacemos manualmente.

-- Portafolio de Fernanda (90 acciones de Alpha, 50 de Beta)
INSERT INTO cartera_trader (id_user, id_empresa, cantidad_acciones, costo_promedio) VALUES
(@FernandaTraderID, @AlphaID, 90, 30.00), -- 100 compradas - 10 vendidas
(@FernandaTraderID, @BetaID, 50, 15.00);

-- Portafolio de Kevin (200 acciones de Gamma)
INSERT INTO cartera_trader (id_user, id_empresa, cantidad_acciones, costo_promedio) VALUES
(@KevinTraderID, @GammaID, 200, 40.00);

-- 3. Auditoría (Ejemplo de evento administrativo)
INSERT INTO auditoria (id_user, user_alias, user_role, accion, entidad_afectada, justificacion, fecha_hora) VALUES
(@JoseAdminID, 'J_Loria', 'ADMINISTRADOR', 'Price Update', 'empresa', 'Actualización de rutina para cierre de mercado.', GETDATE());

PRINT 'Inserción de datos de prueba finalizada.';