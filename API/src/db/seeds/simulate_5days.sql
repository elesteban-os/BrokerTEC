/*
  Simulación de 5 días de actividad en BrokerTEC
  - Crea roles, usuarios (admin/analista/traders), mercados y empresas
  - Crea wallets para traders y realiza recargas diarias
  - Actualiza precios e inserta precios históricos cada día
  - Ejecuta compras/ventas usando Stored Procedures (si existen)
  - Inserta teléfonos (2+ por trader) y auditoría rica (login, cambios, mercados)
  - Delista una empresa para mostrar proceso de deshabilitación + liquidación

  Uso en SSMS:
  1) Selecciona la base de datos correcta en el dropdown (o descomenta USE ...)
  2) (IMPORTANTE) Ajusta el valor de @bcryptHash con el hash de "Holahola1" generado en https://bcrypt-generator.com/
     - Recomendado: costo 12, prefijo $2b
  3) Ejecuta este script (F5). Es idempotente para altas básicas.

  Todas las cuentas se crearán con contraseña: Holahola1 (hash bcrypt en @bcryptHash)
*/

-- USE [BrokerTEC];
SET NOCOUNT ON;

/* ==========================
   0.1) Bootstrap de esquema (crear tablas si no existen)
   Ejecuta este bloque en una BD vacía sin migraciones
   ========================== */

-- ROLES
IF OBJECT_ID('dbo.roles','U') IS NULL
BEGIN
  CREATE TABLE dbo.roles (
    id_role INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
  );
END;

-- USUARIOS
IF OBJECT_ID('dbo.usuarios','U') IS NULL
BEGIN
  CREATE TABLE dbo.usuarios (
    id_user INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    alias VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido1 VARCHAR(50) NOT NULL,
    apellido2 VARCHAR(50) NULL,
    [password] VARCHAR(255) NOT NULL,
    country_origin VARCHAR(100) NOT NULL,
    [status] BIT NOT NULL DEFAULT(1),
    id_role INT NOT NULL,
    token_version INT NOT NULL DEFAULT(0)
  );
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IDX_usuarios_alias' AND object_id=OBJECT_ID('dbo.usuarios'))
    CREATE UNIQUE INDEX IDX_usuarios_alias ON dbo.usuarios(alias);
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IDX_usuarios_email' AND object_id=OBJECT_ID('dbo.usuarios'))
    CREATE UNIQUE INDEX IDX_usuarios_email ON dbo.usuarios(email);
  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_usuarios_roles')
    ALTER TABLE dbo.usuarios ADD CONSTRAINT FK_usuarios_roles FOREIGN KEY (id_role) REFERENCES dbo.roles(id_role);
END;

-- PhoneNumber_User
IF OBJECT_ID('dbo.PhoneNumber_User','U') IS NULL
BEGIN
  CREATE TABLE dbo.PhoneNumber_User (
    id_phone INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    id_user INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL
  );
  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_phone_user')
    ALTER TABLE dbo.PhoneNumber_User ADD CONSTRAINT FK_phone_user FOREIGN KEY (id_user) REFERENCES dbo.usuarios(id_user);
END;

-- AUDITORIA
IF OBJECT_ID('dbo.auditoria','U') IS NULL
BEGIN
  CREATE TABLE dbo.auditoria (
    id_auditoria INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    id_user INT NULL,
    user_alias VARCHAR(50) NULL,
    user_role VARCHAR(20) NULL,
    accion VARCHAR(50) NOT NULL,
    entidad_afectada VARCHAR(50) NOT NULL,
    id_registro_afectado INT NULL,
    ticker_empresa VARCHAR(10) NULL,
    cantidad_acciones INT NULL,
    precio_operacion DECIMAL(15,2) NULL,
    monto_operacion DECIMAL(15,2) NULL,
    saldo_anterior DECIMAL(15,2) NULL,
    saldo_nuevo DECIMAL(15,2) NULL,
    ganancia_perdida DECIMAL(15,2) NULL,
    justificacion TEXT NULL,
    requiere_confirmacion BIT NOT NULL DEFAULT(0),
    descripcion TEXT NULL,
    fecha_hora DATETIME2 NOT NULL DEFAULT(getdate()),
    exitosa BIT NOT NULL DEFAULT(1),
    mensaje_error TEXT NULL
  );
  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_auditoria_user')
    ALTER TABLE dbo.auditoria ADD CONSTRAINT FK_auditoria_user FOREIGN KEY (id_user) REFERENCES dbo.usuarios(id_user);
END;

-- Asegurar columna ganancia_perdida si la tabla ya existía sin ella
IF COL_LENGTH('dbo.auditoria','ganancia_perdida') IS NULL
  ALTER TABLE dbo.auditoria ADD ganancia_perdida DECIMAL(15,2) NULL;

-- MERCADOS
IF OBJECT_ID('dbo.mercados','U') IS NULL
BEGIN
  CREATE TABLE dbo.mercados (
    id_mercado INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    habilitado BIT NOT NULL DEFAULT(1),
    fecha_creacion DATETIME2 NOT NULL DEFAULT(getdate())
  );
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UQ_mercados_nombre' AND object_id=OBJECT_ID('dbo.mercados'))
    CREATE UNIQUE INDEX UQ_mercados_nombre ON dbo.mercados(nombre);
END;

-- EMPRESAS
IF OBJECT_ID('dbo.empresas','U') IS NULL
BEGIN
  CREATE TABLE dbo.empresas (
    id_empresa INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    id_mercado INT NOT NULL,
    precio_actual DECIMAL(15,2) NOT NULL,
    cantidad_acciones INT NOT NULL,
    habilitado BIT NOT NULL DEFAULT(1),
    fecha_creacion DATETIME2 NOT NULL DEFAULT(getdate())
  );
  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_empresas_mercados')
    ALTER TABLE dbo.empresas ADD CONSTRAINT FK_empresas_mercados FOREIGN KEY (id_mercado) REFERENCES dbo.mercados(id_mercado);
END;

-- PRECIOS_HISTORICOS
IF OBJECT_ID('dbo.precios_historicos','U') IS NULL
BEGIN
  CREATE TABLE dbo.precios_historicos (
    id_precio INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    id_empresa INT NOT NULL,
    precio DECIMAL(15,2) NOT NULL,
    fecha_hora DATETIME2 NOT NULL DEFAULT(getdate())
  );
  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_precios_empresas')
    ALTER TABLE dbo.precios_historicos ADD CONSTRAINT FK_precios_empresas FOREIGN KEY (id_empresa) REFERENCES dbo.empresas(id_empresa);
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UQ_precios_empresa_fecha' AND object_id=OBJECT_ID('dbo.precios_historicos'))
    CREATE UNIQUE INDEX UQ_precios_empresa_fecha ON dbo.precios_historicos(id_empresa, fecha_hora);
END;

-- WALLETS
IF OBJECT_ID('dbo.wallets','U') IS NULL
BEGIN
  CREATE TABLE dbo.wallets (
    id_wallet INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    id_user INT NOT NULL,
    saldo DECIMAL(15,2) NOT NULL DEFAULT(0),
    categoria VARCHAR(10) NOT NULL DEFAULT('JUNIOR'),
    limite_diario DECIMAL(15,2) NOT NULL DEFAULT(0),
    consumo_dia DECIMAL(15,2) NOT NULL DEFAULT(0),
    fecha_ultima_recarga DATE NULL,
    fecha_creacion DATETIME2 NOT NULL DEFAULT(getdate())
  );
  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_wallets_usuarios')
    ALTER TABLE dbo.wallets ADD CONSTRAINT FK_wallets_usuarios FOREIGN KEY (id_user) REFERENCES dbo.usuarios(id_user) ON DELETE CASCADE;
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UQ_wallets_id_user' AND object_id=OBJECT_ID('dbo.wallets'))
    CREATE UNIQUE INDEX UQ_wallets_id_user ON dbo.wallets(id_user);
END;

-- POSICIONES
IF OBJECT_ID('dbo.posiciones','U') IS NULL
BEGIN
  CREATE TABLE dbo.posiciones (
    id_posicion INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    id_user INT NOT NULL,
    id_empresa INT NOT NULL,
    cantidad INT NOT NULL DEFAULT(0),
    costo_promedio DECIMAL(15,2) NOT NULL DEFAULT(0),
    fecha_creacion DATETIME2 NOT NULL DEFAULT(getdate()),
    fecha_actualizacion DATETIME2 NOT NULL DEFAULT(getdate())
  );
  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_pos_user')
    ALTER TABLE dbo.posiciones ADD CONSTRAINT FK_pos_user FOREIGN KEY (id_user) REFERENCES dbo.usuarios(id_user) ON DELETE CASCADE;
  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_pos_empresa')
    ALTER TABLE dbo.posiciones ADD CONSTRAINT FK_pos_empresa FOREIGN KEY (id_empresa) REFERENCES dbo.empresas(id_empresa) ON DELETE CASCADE;
END;

/* ==========================
   0) Parámetros (HASH BCRYPT de "Holahola1")
   ========================== */
-- Reemplaza el valor de @bcryptHash con el resultado de https://bcrypt-generator.com/ para "Holahola1"
-- Ejemplo de formato (NO real): '$2b$12$abcdefghijklmnopqrstuvOPQRSTUVwxYZ12abcde34fghijklm'
DECLARE @bcryptHash NVARCHAR(100) = '$2a$12$FX/EnByNtaEzdK8XNgaDteP5q1vjOnwKXQ6jDys1Dj8i81IEZIFfu';

/* ==========================
   1) ROLES (si no existen)
   ========================== */
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'ADMINISTRADOR')
  INSERT INTO dbo.roles (role_name) VALUES ('ADMINISTRADOR');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'ANALISTA')
  INSERT INTO dbo.roles (role_name) VALUES ('ANALISTA');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'TRADER')
  INSERT INTO dbo.roles (role_name) VALUES ('TRADER');

DECLARE @idRoleAdmin  INT = (SELECT id_role FROM dbo.roles WHERE role_name='ADMINISTRADOR');
DECLARE @idRoleAnalyst INT = (SELECT id_role FROM dbo.roles WHERE role_name='ANALISTA');
DECLARE @idRoleTrader INT = (SELECT id_role FROM dbo.roles WHERE role_name='TRADER');

/* ==========================
   2) USUARIOS base
   ========================== */
-- Admin
IF NOT EXISTS (SELECT 1 FROM dbo.usuarios WHERE alias='admin')
BEGIN
  INSERT INTO dbo.usuarios (alias, email, nombre, apellido1, apellido2, [password], country_origin, [status], id_role, token_version)
  VALUES ('admin','admin@brokertec.local','Ada','Admin','Root',@bcryptHash,'CR',1,@idRoleAdmin,0);
END;

-- Analista
IF NOT EXISTS (SELECT 1 FROM dbo.usuarios WHERE alias='analyst')
BEGIN
  INSERT INTO dbo.usuarios (alias, email, nombre, apellido1, apellido2, [password], country_origin, [status], id_role, token_version)
  VALUES ('analyst','analyst@brokertec.local','Ana','Lyst',NULL,@bcryptHash,'CR',1,@idRoleAnalyst,0);
END;

/* ==========================
   3) TRADERS de prueba
   ========================== */
IF NOT EXISTS (SELECT 1 FROM dbo.usuarios WHERE alias='trader1')
BEGIN
  INSERT INTO dbo.usuarios (alias, email, nombre, apellido1, apellido2, [password], country_origin, [status], id_role, token_version)
  VALUES ('trader1','trader1@brokertec.local','Tom','Rader',NULL,@bcryptHash,'CR',1,@idRoleTrader,0);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.usuarios WHERE alias='trader2')
BEGIN
  INSERT INTO dbo.usuarios (alias, email, nombre, apellido1, apellido2, [password], country_origin, [status], id_role, token_version)
  VALUES ('trader2','trader2@brokertec.local','Tara','Rader',NULL,@bcryptHash,'CR',1,@idRoleTrader,0);
END;
IF NOT EXISTS (SELECT 1 FROM dbo.usuarios WHERE alias='trader3')
BEGIN
  INSERT INTO dbo.usuarios (alias, email, nombre, apellido1, apellido2, [password], country_origin, [status], id_role, token_version)
  VALUES ('trader3','trader3@brokertec.local','Tito','Rader',NULL,@bcryptHash,'CR',1,@idRoleTrader,0);
END;

DECLARE @idTrader1 INT = (SELECT id_user FROM dbo.usuarios WHERE alias='trader1');
DECLARE @idTrader2 INT = (SELECT id_user FROM dbo.usuarios WHERE alias='trader2');
DECLARE @idTrader3 INT = (SELECT id_user FROM dbo.usuarios WHERE alias='trader3');

/* ==========================
   2.1) Teléfonos (2+ por trader)
   ========================== */
IF NOT EXISTS (SELECT 1 FROM dbo.PhoneNumber_User WHERE id_user=@idTrader1)
BEGIN
  INSERT INTO dbo.PhoneNumber_User (id_user, phone_number) VALUES
    (@idTrader1, '+506-7001-0001'),
    (@idTrader1, '+506-7001-0002'),
    (@idTrader1, '+506-7001-0003');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.PhoneNumber_User WHERE id_user=@idTrader2)
BEGIN
  INSERT INTO dbo.PhoneNumber_User (id_user, phone_number) VALUES
    (@idTrader2, '+506-7002-0001'),
    (@idTrader2, '+506-7002-0002'),
    (@idTrader2, '+506-7002-0003');
END;
IF NOT EXISTS (SELECT 1 FROM dbo.PhoneNumber_User WHERE id_user=@idTrader3)
BEGIN
  INSERT INTO dbo.PhoneNumber_User (id_user, phone_number) VALUES
    (@idTrader3, '+506-7003-0001'),
    (@idTrader3, '+506-7003-0002'),
    (@idTrader3, '+506-7003-0003');
END;

/* ==========================
   4) MERCADOS
   ========================== */
IF NOT EXISTS (SELECT 1 FROM dbo.mercados WHERE nombre='NASDAQ')
  INSERT INTO dbo.mercados (nombre, habilitado) VALUES ('NASDAQ', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.mercados WHERE nombre='NYSE')
  INSERT INTO dbo.mercados (nombre, habilitado) VALUES ('NYSE', 1);

DECLARE @idNASDAQ INT = (SELECT id_mercado FROM dbo.mercados WHERE nombre='NASDAQ');
DECLARE @idNYSE   INT = (SELECT id_mercado FROM dbo.mercados WHERE nombre='NYSE');

/* ==========================
   5) EMPRESAS (altas masivas si faltan)
   ========================== */
-- NASDAQ
IF NOT EXISTS (SELECT 1 FROM dbo.empresas WHERE nombre='Apple Inc.')
  INSERT INTO dbo.empresas (nombre,id_mercado,precio_actual,cantidad_acciones,habilitado)
  VALUES ('Apple Inc.', @idNASDAQ, 175.50, 2000000, 1);
IF NOT EXISTS (SELECT 1 FROM dbo.empresas WHERE nombre='Microsoft Corporation')
  INSERT INTO dbo.empresas (nombre,id_mercado,precio_actual,cantidad_acciones,habilitado)
  VALUES ('Microsoft Corporation', @idNASDAQ, 410.10, 1500000, 1);
IF NOT EXISTS (SELECT 1 FROM dbo.empresas WHERE nombre='NVIDIA Corporation')
  INSERT INTO dbo.empresas (nombre,id_mercado,precio_actual,cantidad_acciones,habilitado)
  VALUES ('NVIDIA Corporation', @idNASDAQ, 900.00, 1200000, 1);

-- NYSE
IF NOT EXISTS (SELECT 1 FROM dbo.empresas WHERE nombre='Coca-Cola')
  INSERT INTO dbo.empresas (nombre,id_mercado,precio_actual,cantidad_acciones,habilitado)
  VALUES ('Coca-Cola', @idNYSE, 60.00, 3000000, 1);
IF NOT EXISTS (SELECT 1 FROM dbo.empresas WHERE nombre='Walmart')
  INSERT INTO dbo.empresas (nombre,id_mercado,precio_actual,cantidad_acciones,habilitado)
  VALUES ('Walmart', @idNYSE, 160.00, 2500000, 1);

DECLARE @idAAPL INT = (SELECT id_empresa FROM dbo.empresas WHERE nombre='Apple Inc.');
DECLARE @idMSFT INT = (SELECT id_empresa FROM dbo.empresas WHERE nombre='Microsoft Corporation');
DECLARE @idNVDA INT = (SELECT id_empresa FROM dbo.empresas WHERE nombre='NVIDIA Corporation');
DECLARE @idKO   INT = (SELECT id_empresa FROM dbo.empresas WHERE nombre='Coca-Cola');
DECLARE @idWMT  INT = (SELECT id_empresa FROM dbo.empresas WHERE nombre='Walmart');

/* ==========================
   6) WALLETS para traders
   ========================== */
-- Crear wallet por SP (si existe), con categoría por defecto JUNIOR; luego ajustar categoría/limites/saldo
IF NOT EXISTS (SELECT 1 FROM dbo.wallets WHERE id_user=@idTrader1)
BEGIN
  IF OBJECT_ID('dbo.usp_CreateWalletForTrader', 'P') IS NOT NULL
    EXEC dbo.usp_CreateWalletForTrader @id_user=@idTrader1, @categoria='JUNIOR';
  ELSE
    INSERT INTO dbo.wallets (id_user, saldo, categoria, limite_diario, consumo_dia)
    VALUES (@idTrader1, 0, 'JUNIOR', 5000, 0);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.wallets WHERE id_user=@idTrader2)
BEGIN
  IF OBJECT_ID('dbo.usp_CreateWalletForTrader', 'P') IS NOT NULL
    EXEC dbo.usp_CreateWalletForTrader @id_user=@idTrader2, @categoria='MID';
  ELSE
    INSERT INTO dbo.wallets (id_user, saldo, categoria, limite_diario, consumo_dia)
    VALUES (@idTrader2, 0, 'MID', 10000, 0);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.wallets WHERE id_user=@idTrader3)
BEGIN
  IF OBJECT_ID('dbo.usp_CreateWalletForTrader', 'P') IS NOT NULL
    EXEC dbo.usp_CreateWalletForTrader @id_user=@idTrader3, @categoria='SENIOR';
  ELSE
    INSERT INTO dbo.wallets (id_user, saldo, categoria, limite_diario, consumo_dia)
    VALUES (@idTrader3, 0, 'SENIOR', 50000, 0);
END;

-- Ajustar límites explícitos y saldo inicial cómodo para operar
UPDATE w SET 
  limite_diario = CASE w.categoria WHEN 'JUNIOR' THEN 5000 WHEN 'MID' THEN 10000 ELSE 50000 END,
  saldo = CASE w.categoria WHEN 'JUNIOR' THEN 8000 WHEN 'MID' THEN 20000 ELSE 100000 END
FROM dbo.wallets w
WHERE w.id_user IN (@idTrader1, @idTrader2, @idTrader3);

/* ==========================
   7) Utilidades: función para insertar precio histórico con fecha específica
   ========================== */
-- (No se crean funciones persistentes; se usa bloque inline por día)

/* ==========================
   8) Simulación de 5 días
   ========================== */
DECLARE @baseDate DATE = CAST(DATEADD(DAY, -5, GETDATE()) AS DATE);
DECLARE @dia INT = 0;

WHILE @dia < 5
BEGIN
  DECLARE @fecha DATE = DATEADD(DAY, @dia, @baseDate);
  DECLARE @fechaDT DATETIME2(0) = CAST(@fecha AS DATETIME2(0));

  /* 8.1) Variación de precios y guardado histórico */
  -- Reglas simples de variación por día
  DECLARE @pAAPL DECIMAL(15,2) = (SELECT precio_actual FROM dbo.empresas WHERE id_empresa=@idAAPL);
  DECLARE @pMSFT DECIMAL(15,2) = (SELECT precio_actual FROM dbo.empresas WHERE id_empresa=@idMSFT);
  DECLARE @pNVDA DECIMAL(15,2) = (SELECT precio_actual FROM dbo.empresas WHERE id_empresa=@idNVDA);
  DECLARE @pKO   DECIMAL(15,2) = (SELECT precio_actual FROM dbo.empresas WHERE id_empresa=@idKO);
  DECLARE @pWMT  DECIMAL(15,2) = (SELECT precio_actual FROM dbo.empresas WHERE id_empresa=@idWMT);

  -- Aplicar pequeñas variaciones (%): AAPL +0.5%/día, MSFT +0.3%, NVDA +/-1% alterno, KO +0.2%, WMT -0.1%
  SET @pAAPL = ROUND(@pAAPL * (1 + 0.005), 2);
  SET @pMSFT = ROUND(@pMSFT * (1 + 0.003), 2);
  SET @pNVDA = ROUND(@pNVDA * (CASE WHEN (@dia % 2)=0 THEN 1.01 ELSE 0.99 END), 2);
  SET @pKO   = ROUND(@pKO   * (1 + 0.002), 2);
  SET @pWMT  = ROUND(@pWMT  * (1 - 0.001), 2);

  -- Actualizar precios actuales
  UPDATE dbo.empresas SET precio_actual=@pAAPL WHERE id_empresa=@idAAPL;
  UPDATE dbo.empresas SET precio_actual=@pMSFT WHERE id_empresa=@idMSFT;
  UPDATE dbo.empresas SET precio_actual=@pNVDA WHERE id_empresa=@idNVDA;
  UPDATE dbo.empresas SET precio_actual=@pKO   WHERE id_empresa=@idKO;
  UPDATE dbo.empresas SET precio_actual=@pWMT  WHERE id_empresa=@idWMT;

  -- Insertar histórico con timestamp del día (09:30:00)
  DECLARE @ts DATETIME2(0) = DATEADD(SECOND, 0, DATEADD(MINUTE, 30, DATEADD(HOUR, 9, @fechaDT)));
  INSERT INTO dbo.precios_historicos (id_empresa, precio, fecha_hora) VALUES
    (@idAAPL, @pAAPL, @ts),
    (@idMSFT, @pMSFT, @ts),
    (@idNVDA, @pNVDA, @ts),
    (@idKO,   @pKO,   @ts),
    (@idWMT,  @pWMT,  @ts);

  /* 8.2) Recargas de wallet diarias (sin exceder límite) */
  -- trader1 (JUNIOR): recarga 1000
  UPDATE dbo.wallets SET saldo = saldo + 1000, consumo_dia = CASE WHEN fecha_ultima_recarga = @fecha THEN consumo_dia + 1000 ELSE 1000 END, fecha_ultima_recarga = @fecha
    WHERE id_user=@idTrader1 AND (CASE WHEN fecha_ultima_recarga = @fecha THEN consumo_dia + 1000 ELSE 1000 END) <= limite_diario;
  INSERT INTO dbo.auditoria (id_user,user_alias,user_role,accion,entidad_afectada,monto_operacion,saldo_anterior,saldo_nuevo,descripcion,requiere_confirmacion,exitosa)
  SELECT u.id_user, u.alias, 'TRADER', 'RECARGA_WALLET', 'wallet', 1000,
         w.saldo - 1000, w.saldo, CONCAT('Recarga diaria $', 1000, ' (simulada)'), 0, 1
  FROM dbo.usuarios u JOIN dbo.wallets w ON u.id_user = w.id_user WHERE u.id_user=@idTrader1;

  -- trader2 (MID): recarga 3000
  UPDATE dbo.wallets SET saldo = saldo + 3000, consumo_dia = CASE WHEN fecha_ultima_recarga = @fecha THEN consumo_dia + 3000 ELSE 3000 END, fecha_ultima_recarga = @fecha
    WHERE id_user=@idTrader2 AND (CASE WHEN fecha_ultima_recarga = @fecha THEN consumo_dia + 3000 ELSE 3000 END) <= limite_diario;
  INSERT INTO dbo.auditoria (id_user,user_alias,user_role,accion,entidad_afectada,monto_operacion,saldo_anterior,saldo_nuevo,descripcion,requiere_confirmacion,exitosa)
  SELECT u.id_user, u.alias, 'TRADER', 'RECARGA_WALLET', 'wallet', 3000,
         w.saldo - 3000, w.saldo, CONCAT('Recarga diaria $', 3000, ' (simulada)'), 0, 1
  FROM dbo.usuarios u JOIN dbo.wallets w ON u.id_user = w.id_user WHERE u.id_user=@idTrader2;

  -- trader3 (SENIOR): recarga 7000
  UPDATE dbo.wallets SET saldo = saldo + 7000, consumo_dia = CASE WHEN fecha_ultima_recarga = @fecha THEN consumo_dia + 7000 ELSE 7000 END, fecha_ultima_recarga = @fecha
    WHERE id_user=@idTrader3 AND (CASE WHEN fecha_ultima_recarga = @fecha THEN consumo_dia + 7000 ELSE 7000 END) <= limite_diario;
  INSERT INTO dbo.auditoria (id_user,user_alias,user_role,accion,entidad_afectada,monto_operacion,saldo_anterior,saldo_nuevo,descripcion,requiere_confirmacion,exitosa)
  SELECT u.id_user, u.alias, 'TRADER', 'RECARGA_WALLET', 'wallet', 7000,
         w.saldo - 7000, w.saldo, CONCAT('Recarga diaria $', 7000, ' (simulada)'), 0, 1
  FROM dbo.usuarios u JOIN dbo.wallets w ON u.id_user = w.id_user WHERE u.id_user=@idTrader3;

  /* 8.3) Operaciones de compra/venta (vía SP si existen)
         Forzamos ganancias y pérdidas: compramos en días de alza y vendemos tras baja */
  DECLARE @msg NVARCHAR(1000), @ok BIT;
  -- Día impar: compras; Día par: ventas parciales si hay posición
  IF (@dia % 2) = 1
  BEGIN
    IF OBJECT_ID('dbo.usp_ComprarAcciones', 'P') IS NOT NULL
    BEGIN
      -- trader1 compra AAPL 5 acciones
      EXEC dbo.usp_ComprarAcciones @id_user=@idTrader1, @id_empresa=@idAAPL, @cantidad=5,  @user_alias='trader1', @mensaje_resultado=@msg OUTPUT, @exito=@ok OUTPUT;
      -- trader2 compra MSFT 7 acciones
      EXEC dbo.usp_ComprarAcciones @id_user=@idTrader2, @id_empresa=@idMSFT, @cantidad=7, @user_alias='trader2', @mensaje_resultado=@msg OUTPUT, @exito=@ok OUTPUT;
      -- trader3 compra NVDA 3 acciones
      EXEC dbo.usp_ComprarAcciones @id_user=@idTrader3, @id_empresa=@idNVDA, @cantidad=3, @user_alias='trader3', @mensaje_resultado=@msg OUTPUT, @exito=@ok OUTPUT;
      -- compras en KO para que el delisting liquide posiciones
      EXEC dbo.usp_ComprarAcciones @id_user=@idTrader2, @id_empresa=@idKO, @cantidad=20, @user_alias='trader2', @mensaje_resultado=@msg OUTPUT, @exito=@ok OUTPUT;
      EXEC dbo.usp_ComprarAcciones @id_user=@idTrader3, @id_empresa=@idKO, @cantidad=15, @user_alias='trader3', @mensaje_resultado=@msg OUTPUT, @exito=@ok OUTPUT;
    END
  END
  ELSE
  BEGIN
    IF OBJECT_ID('dbo.usp_VenderAcciones', 'P') IS NOT NULL
    BEGIN
      -- trader1 vende AAPL 2 si tiene
      IF EXISTS (SELECT 1 FROM dbo.posiciones WHERE id_user=@idTrader1 AND id_empresa=@idAAPL AND cantidad>=2)
        EXEC dbo.usp_VenderAcciones @id_user=@idTrader1, @id_empresa=@idAAPL, @cantidad=2, @user_alias='trader1', @mensaje_resultado=@msg OUTPUT, @exito=@ok OUTPUT;
      -- trader2 vende MSFT 2 si tiene
      IF EXISTS (SELECT 1 FROM dbo.posiciones WHERE id_user=@idTrader2 AND id_empresa=@idMSFT AND cantidad>=2)
        EXEC dbo.usp_VenderAcciones @id_user=@idTrader2, @id_empresa=@idMSFT, @cantidad=2, @user_alias='trader2', @mensaje_resultado=@msg OUTPUT, @exito=@ok OUTPUT;
      -- trader3 vende NVDA 1 si tiene
      IF EXISTS (SELECT 1 FROM dbo.posiciones WHERE id_user=@idTrader3 AND id_empresa=@idNVDA AND cantidad>=1)
        EXEC dbo.usp_VenderAcciones @id_user=@idTrader3, @id_empresa=@idNVDA, @cantidad=1, @user_alias='trader3', @mensaje_resultado=@msg OUTPUT, @exito=@ok OUTPUT;
    END
  END

  -- Reset de consumo_dia al cambiar de día se manejará por la aplicación; este seed no fuerza reset persistente.

  SET @dia = @dia + 1;
END;

/* ==========================
   8.4) Delisting de una empresa (deshabilitar y liquidar posiciones)
   ========================== */
DECLARE @adminId INT = (SELECT id_user FROM dbo.usuarios WHERE alias='admin');
IF @adminId IS NOT NULL AND @idKO IS NOT NULL
BEGIN
  IF OBJECT_ID('dbo.usp_DelistEmpresa', 'P') IS NOT NULL
  BEGIN
    EXEC dbo.usp_DelistEmpresa @id_empresa=@idKO, @justificacion=N'Delist por decisión de mercado (simulación)', @id_admin=@adminId, @admin_alias='admin', @admin_role='ADMINISTRADOR';
  END
  ELSE
  BEGIN
    UPDATE dbo.empresas SET habilitado = 0 WHERE id_empresa=@idKO;
    INSERT INTO dbo.auditoria (id_user,user_alias,user_role,accion,entidad_afectada,id_registro_afectado,justificacion,descripcion,exitosa)
    VALUES (@adminId,'admin','ADMINISTRADOR','DELISTING','empresas',@idKO,N'Delist por decisión de mercado (simulación)',N'Empresa deshabilitada manualmente (sin SP)',1);
  END
END

/* ==========================
   8.5) Auditoría adicional para parecerse a ejemplos: logins y cambios
   ========================== */
-- Logins y logouts simulados
INSERT INTO dbo.auditoria (id_user,user_alias,user_role,accion,entidad_afectada,descripcion,exitosa)
SELECT id_user, alias, CASE WHEN id_role=@idRoleAdmin THEN 'ADMINISTRADOR' WHEN id_role=@idRoleAnalyst THEN 'ANALISTA' ELSE 'TRADER' END,
       'LOGIN','usuarios', CONCAT('Login exitoso de usuario ', alias), 1
FROM dbo.usuarios WHERE alias IN ('admin','analyst','trader1','trader2','trader3');

INSERT INTO dbo.auditoria (id_user,user_alias,user_role,accion,entidad_afectada,descripcion,exitosa)
SELECT id_user, alias, CASE WHEN id_role=@idRoleAdmin THEN 'ADMINISTRADOR' WHEN id_role=@idRoleAnalyst THEN 'ANALISTA' ELSE 'TRADER' END,
       'LOGOUT','usuarios', CONCAT('Logout de usuario ', alias), 1
FROM dbo.usuarios WHERE alias IN ('trader1','trader2');

-- Intento fallido de login para mostrar variedad
INSERT INTO dbo.auditoria (id_user,user_alias,user_role,accion,entidad_afectada,descripcion,exitosa,mensaje_error)
SELECT id_user, alias, 'TRADER','LOGIN_FAILED','usuarios', CONCAT('Intento de login fallido para usuario ', alias), 0, 'Credenciales inválidas'
FROM dbo.usuarios WHERE alias='trader1';

-- Cambios de contraseña simulados
INSERT INTO dbo.auditoria (id_user,user_alias,user_role,accion,entidad_afectada,requiere_confirmacion,descripcion,exitosa)
SELECT id_user, alias, 'TRADER','PASSWORD_CHANGE','usuarios',1, CONCAT('Cambio de contraseña realizado por ', alias), 1
FROM dbo.usuarios WHERE alias IN ('trader2','trader3');

-- Eventos de mercado (create/update/delete) en auditoría
INSERT INTO dbo.auditoria (id_user,user_alias,user_role,accion,entidad_afectada,descripcion,exitosa)
VALUES
(@adminId,'admin','ADMINISTRADOR','MERCADO_CREATE','mercados','Mercado creado: Bolsa de San Jose',1),
(@adminId,'admin','ADMINISTRADOR','MERCADO_UPDATE','mercados','Mercado actualizado: Bolsa de San Jose',1),
(@adminId,'admin','ADMINISTRADOR','MERCADO_DELETE','mercados','Mercado eliminado: Bolsa de New York (simulación)',1);

/* ==========================
   9) Resumen rápido (opcional)
   ========================== */
PRINT '=== RESUMEN ===';
SELECT 'Usuarios' AS tipo, COUNT(*) AS total FROM dbo.usuarios
UNION ALL SELECT 'Mercados', COUNT(*) FROM dbo.mercados
UNION ALL SELECT 'Empresas', COUNT(*) FROM dbo.empresas
UNION ALL SELECT 'Wallets', COUNT(*) FROM dbo.wallets
UNION ALL SELECT 'Posiciones', COUNT(*) FROM dbo.posiciones
UNION ALL SELECT 'PreciosHist', COUNT(*) FROM dbo.precios_historicos
UNION ALL SELECT 'Auditoria', COUNT(*) FROM dbo.auditoria;

PRINT 'Simulación de 5 días completada.';
