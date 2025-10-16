-- Script de inserción de datos para la base de datos BrokerTEC
USE BrokerTEC;
GO

-------------------------------------------------------------------------
-- PASO 1: Inserción de Roles y Usuarios (1, 2)
-------------------------------------------------------------------------

-- 1. Tabla: [ROLE] (Id: 101+)
INSERT INTO [ROLE] (Role_type) VALUES
('Admin'),      
('Trader'),     
('Analyst');    
GO

-- 2. Tabla: [USER] (Id: 1001+)
INSERT INTO [USER] (Alias, Email, Password_hash, Role_Id, Username, Address_dir, User_status) VALUES
-- Admin
('Andres_admin', 'andres.v@brokertec.com', HASHBYTES('SHA2_256', 'Andres_password'), 101, 'Andres Vargas', 'US, New York', 'Active'),       
-- Traders (5 tuplas)
('Jose_L', 'jose.l@brokertec.com', HASHBYTES('SHA2_256', 'jose_password'), 102, 'Jose Loria', 'US, New York', 'Active'),                    
('Jason_A', 'jason.a@brokertec.com', HASHBYTES('SHA2_256', 'jason_password'), 102, 'Jason Alvarado', 'CR, San Jose', 'Active'),             
('Yonathan_M', 'yonathan.m@brokertec.com', HASHBYTES('SHA2_256', 'yonathan_password'), 102, 'Yonathan Monge', 'MX, CDMX', 'Active'),        
('Fernanda_A', 'fernanda.a@brokertec.com', HASHBYTES('SHA2_256', 'fernanda_password'), 102, 'Fernanda Alvarez', 'CR, Cartago', 'Active'),   
('Kevin_C', 'kevin.c@brokertec.com', HASHBYTES('SHA2_256', 'kevin_password'), 102, 'Kevin Chinchilla', 'MX, CDMX', 'Active'),               
-- Analysts (2 tuplas)
('Milton_A', 'milton.v@brokertec.com', HASHBYTES('SHA2_256', 'milton_password'), 103, 'Milton Villegas', 'CR, Cartago', 'Active'),          
('Laura_A', 'laura.c@brokertec.com', HASHBYTES('SHA2_256', 'laura_password'), 103, 'Laura Cortes', 'MX, CDMX', 'Active');                   
GO

-------------------------------------------------------------------------
-- PASO 2: Inserción de Mercado y Empresas (3, 4)
-------------------------------------------------------------------------

-- 3. Tabla: [MARKET] (Id: 2001+)
INSERT INTO [MARKET] (Market_name, Market_status, Currency) VALUES
('TecStock Exchange', 'Open', 'USD'),   -- ID 2001
('Innovacion Index', 'Open', 'USD');    -- ID 2002
GO

-- 4. Tabla: [COMPANY] (Id: 3001+)
INSERT INTO [COMPANY] (Market_Id, Company_name, Total_shares_count, Available_shares, Current_market_cap, Company_status) VALUES
(2001, 'AlphaTech Solutions', 1000000, 500000, 15000000.00, 'Listed'),  -- ID 3001
(2001, 'BetaEnergy Corp', 500000, 100000, 10000000.00, 'Listed'),       -- ID 3002
(2002, 'Gamma Pharma', 2000000, 800000, 40000000.00, 'Listed'),         -- ID 3003
(2002, 'Delta Retail', 750000, 250000, 3000000.00, 'Listed');           -- ID 3004
GO

-------------------------------------------------------------------------
-- PASO 3: Inserción de Precios (5)
-------------------------------------------------------------------------

-- 5. Tabla: [PRICE_HISTORY] (Id: 4001+)
-- Precios para AlphaTech (3001)
INSERT INTO [PRICE_HISTORY] (Company_id, Price, PH_timestamp) VALUES
(3001, 15.00, DATEADD(hour, -2, GETDATE())),    
(3001, 15.50, DATEADD(hour, -1, GETDATE())),    
(3001, 15.75, DATEADD(minute, -30, GETDATE())), 
(3001, 15.20, GETDATE()), -- Precio actual      

-- Precios para BetaEnergy (3002) 
(3002, 20.00, DATEADD(hour, -2, GETDATE())),    
(3002, 19.50, DATEADD(hour, -1, GETDATE())),    
(3002, 19.90, DATEADD(minute, -30, GETDATE())), 
(3002, 19.80, GETDATE()); -- Precio actual
GO

-------------------------------------------------------------------------
-- PASO 4: Inserción de Wallets y Recargas (6, 7)
-------------------------------------------------------------------------

-- 6. Tabla: [WALLET] (Id: 5001+)
-- User_id: 1002 al 1006 (Traders)
INSERT INTO [WALLET] (User_id, Balance, Category, Daily_limit, Daily_consumption) VALUES
(1002, 15000.00, 'Senior', 10000.00, 0.00), -- Jose_L (ID 5001)
(1003, 8000.00, 'Junior', 5000.00, 0.00),   -- Jason_A (ID 5002)
(1004, 12000.00, 'Junior', 5000.00, 0.00),  -- Yonathan_M (ID 5003)
(1005, 6000.00, 'Mid', 5000.00, 0.00),      -- Fernanda_A (ID 5004)
(1006, 4000.00, 'Senior', 2000.00, 0.00);   -- Kevin_C (ID 5005)
GO

-- 7. Tabla: [TOP_UP] (Id: 6001+)
-- Wallet_id: 5001 al 5005
INSERT INTO [TOP_UP] (Wallet_id, Amount, Top_up_timestamp) VALUES
(5001, 2000.00, DATEADD(day, -5, GETDATE())),
(5002, 1500.00, DATEADD(day, -1, GETDATE())),
(5003, 1000.00, GETDATE()),
(5004, 2500.00, DATEADD(day, -2, GETDATE())),
(5005, 3000.00, GETDATE());
GO

-------------------------------------------------------------------------
-- PASO 5: Transacciones y Portafolio (8, 9)
-------------------------------------------------------------------------

-- 8. Tabla: [TRADER_PORTFOLIO] (Id: 7001+)
-- Esta tabla debe reflejar la posición final después de las transacciones iniciales.
-- User_id 1002 (Jose_L)
INSERT INTO [TRADER_PORTFOLIO] (User_id, Company_id, Share_count, Average_cost) VALUES
(1002, 3001, 500, 14.50), -- AlphaTech
(1002, 3002, 200, 21.00); -- BetaEnergy
-- User_id 1003 (Jason_A) - Añadido para dar consistencia a la venta en TRANSACTION
INSERT INTO [TRADER_PORTFOLIO] (User_id, Company_id, Share_count, Average_cost) VALUES
(1003, 3001, 450, 14.50), -- 500 comprados - 50 vendidos = 450
(1003, 3002, 200, 21.00);
GO

-- 9. Tabla: [TRANSACTION] (Id: 8001+)
-- Transacciones de User_id 1003 (Jason_A) - Necesita Portafolio para la Venta
INSERT INTO [TRANSACTION] (User_id, Company_id, Transaction_type, QUANTITY, Price, Transaction_timestamp) VALUES
(1003, 3001, 'Buy', 500, 14.50, DATEADD(day, -10, GETDATE())),
(1003, 3002, 'Buy', 200, 21.00, DATEADD(day, -9, GETDATE())),
(1003, 3001, 'Sell', 50, 15.30, DATEADD(day, -1, GETDATE()));
GO

-- Transacciones de User_id 1004 (Yonathan_M)
INSERT INTO [TRANSACTION] (User_id, Company_id, Transaction_type, QUANTITY, Price, Transaction_timestamp) VALUES
(1004, 3003, 'Buy', 100, 38.00, DATEADD(day, -5, GETDATE())),
(1004, 3004, 'Buy', 50, 4.20, GETDATE());
GO