USE BrokerTEC;
GO

-- Trigger 1:  Se dispara despues de una insercion en 'transaccion' para registar el evento en 'auditoria'
CREATE TRIGGER tr_Insert_Transaction_Audit
ON transaccion
AFTER INSERT 
AS 
BEGIN
    SET NOCOUNT ON;

    INSERT INTO auditoria (
        id_user,
        user_alias,
        user_role,
        accion, 
        entidad_afectada,
        id_registro_afectado,
        cantidad_acciones,
        precio_operacion,
        monto_operacion, 
        descripcion
    ) 
    SELECT 
        I.id_user,
        U.alias,
        R.role_name,
        I.tipo, -- 'Buy' o 'Sell'
        'transaccion',
        CAST(I.id_transaccion AS NVARCHAR(50)),
        I.cantidad, 
        I.precio,
        (I.cantidad * I.precio) AS Monto,
        'Registro de operacion de ' + I.tipo + ' por ' + U.alias + ' para la empresa ' + E.nombre
    FROM
        inserted AS I
    JOIN 
        usuarios AS U ON I.id_user = U.id_user
    JOIN 
        roles AS R ON U.id_role = R.id_role
    JOIN
        empresa AS E ON I.id_empresa = E.id_empresa;
END
GO
PRINT 'Trigger tr_Insert_Transaction_Audit creado.';
GO