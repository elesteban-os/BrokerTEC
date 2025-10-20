USE BrokerTEC;
GO

-------------------------------------------------------------------------
-- CONSULTA 1: LISTAR TODAS LAS TABLAS CREADAS
-------------------------------------------------------------------------

PRINT '==============================================';
PRINT '  LISTADO DE TABLAS DE BROKERTEC (Esquema dbo)';
PRINT '==============================================';

SELECT 
    TABLE_NAME AS Nombre_de_Tabla,
    'OK' AS Estatus
FROM 
    INFORMATION_SCHEMA.TABLES 
WHERE 
    TABLE_TYPE = 'BASE TABLE' 
    AND TABLE_SCHEMA = 'dbo' 
ORDER BY 
    TABLE_NAME;
GO

-------------------------------------------------------------------------
-- CONSULTA 2: MOSTRAR DATOS DE CADA TABLA (si tienen datos insertados)
-------------------------------------------------------------------------

PRINT '==============================================';
PRINT '  DATOS INSERTADOS EN CADA TABLA';
PRINT '==============================================';


PRINT '--- TABLA: roles ---';
SELECT * FROM roles;
GO

PRINT '--- TABLA: usuarios ---';
SELECT 
    id_user, alias, email, nombre, apellido1, country_origin, status, id_role
FROM 
    usuarios; -- Excluye el hash de contraseña y token_version por seguridad
GO

PRINT '--- TABLA: PhoneNumber_User ---';
SELECT * FROM PhoneNumber_User;
GO

PRINT '--- TABLA: auditoria ---';
SELECT 
    id_auditoria, id_user, accion, fecha_hora, exitosa 
FROM 
    auditoria; -- Muestra un resumen de los campos clave
GO

PRINT '--- TABLA: mercado ---';
SELECT * FROM mercado;
GO

PRINT '--- TABLA: empresa ---';
SELECT * FROM empresa;
GO

PRINT '--- TABLA: precio_historico ---';
SELECT * FROM precio_historico;
GO

PRINT '--- TABLA: wallet ---';
SELECT * FROM wallet;
GO

PRINT '--- TABLA: recarga ---';
SELECT * FROM recarga;
GO

PRINT '--- TABLA: cartera_trader ---';
SELECT * FROM cartera_trader;
GO

PRINT '--- TABLA: transaccion ---';
SELECT * FROM transaccion;
GO

PRINT 'Script de muestra de tablas finalizado.';