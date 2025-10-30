-- =============================================
-- Stored Procedure: usp_DisableTrader
-- Descripción: Deshabilita un trader y liquida automáticamente todas sus posiciones
-- =============================================

CREATE OR ALTER PROCEDURE usp_DisableTrader
    @id_trader INT,                 -- ID del trader a deshabilitar
    @justificacion NVARCHAR(MAX),   -- Justificación del bloqueo
    @id_admin INT,                  -- ID del administrador que ejecuta
    @admin_alias NVARCHAR(50),      -- Alias del admin
    @admin_role NVARCHAR(20)        -- Rol del admin
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    -- Variables
    DECLARE @posiciones_liquidadas INT = 0;
    DECLARE @monto_total_liquidado DECIMAL(15, 2) = 0;
    DECLARE @trader_alias NVARCHAR(50);
    DECLARE @id_posicion INT;
    DECLARE @id_empresa INT;
    DECLARE @cantidad INT;
    DECLARE @precio_actual DECIMAL(15, 2);
    DECLARE @costo_promedio DECIMAL(15, 2);
    DECLARE @monto_liquidacion DECIMAL(15, 2);
    DECLARE @ganancia_perdida DECIMAL(15, 2);
    DECLARE @nombre_empresa NVARCHAR(100);
    DECLARE @saldo_anterior DECIMAL(15, 2);
    DECLARE @saldo_nuevo DECIMAL(15, 2);
    
    BEGIN TRY
        -----------------------------------------------
        -- 1. VALIDAR QUE EL TRADER EXISTE Y ESTÁ ACTIVO
        
        IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_user = @id_trader)
        BEGIN
            RAISERROR('El trader no existe', 16, 1);
            RETURN;
        END
        
        -- Obtener información del trader
        SELECT @trader_alias = alias
        FROM usuarios
        WHERE id_user = @id_trader;
        
        -- Validar que no esté ya deshabilitado
        IF EXISTS (SELECT 1 FROM usuarios WHERE id_user = @id_trader AND status = 0)
        BEGIN
            RAISERROR('El trader ya está deshabilitado', 16, 1);
            RETURN;
        END
        
        -- Validar que sea realmente un trader (id_role = 3)
        IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_user = @id_trader AND id_role = 3)
        BEGIN
            RAISERROR('El usuario no es un trader', 16, 1);
            RETURN;
        END
        
        -----------------------------------------------
        -- 2. LIQUIDAR TODAS LAS POSICIONES ACTIVAS
        
        -- Cursor para procesar cada posición del trader
        DECLARE posiciones_cursor CURSOR FOR
        SELECT 
            p.id_posicion,
            p.id_empresa,
            p.cantidad,
            p.costo_promedio,
            e.nombre,
            e.precio_actual
        FROM posiciones p
        INNER JOIN empresas e ON p.id_empresa = e.id_empresa
        WHERE p.id_user = @id_trader;
        
        OPEN posiciones_cursor;
        FETCH NEXT FROM posiciones_cursor INTO @id_posicion, @id_empresa, @cantidad, @costo_promedio, @nombre_empresa, @precio_actual;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Calcular monto de liquidación (precio actual × cantidad)
            SET @monto_liquidacion = @cantidad * @precio_actual;
            
            -- Calcular ganancia o pérdida: (precio_actual - costo_promedio) × cantidad
            SET @ganancia_perdida = (@precio_actual - @costo_promedio) * @cantidad;
            
            -- Obtener saldo actual del wallet
            SELECT @saldo_anterior = saldo
            FROM wallets
            WHERE id_user = @id_trader;
            
            -- Abonar al wallet del trader
            UPDATE wallets
            SET saldo = saldo + @monto_liquidacion
            WHERE id_user = @id_trader;
            
            -- DEVOLVER ACCIONES AL INVENTARIO DE LA EMPRESA
            UPDATE empresas
            SET cantidad_acciones = cantidad_acciones + @cantidad
            WHERE id_empresa = @id_empresa;
            
            -- Obtener nuevo saldo
            SELECT @saldo_nuevo = saldo
            FROM wallets
            WHERE id_user = @id_trader;
            
            -- Registrar auditoría de la liquidación como VENTA
            INSERT INTO auditoria (
                id_user,
                user_alias,
                user_role,
                accion,
                entidad_afectada,
                id_registro_afectado,
                ticker_empresa,
                cantidad_acciones,
                precio_operacion,
                monto_operacion,
                saldo_anterior,
                saldo_nuevo,
                ganancia_perdida,
                justificacion,
                descripcion,
                fecha_hora,
                exitosa
            )
            VALUES (
                @id_trader,
                @trader_alias,
                'TRADER',
                'VENTA',
                'posiciones',
                @id_posicion,
                @nombre_empresa,
                @cantidad,
                @precio_actual,
                @monto_liquidacion,
                @saldo_anterior,
                @saldo_nuevo,
                @ganancia_perdida,
                @justificacion,
                'Venta automática por deshabilitación de cuenta',
                GETDATE(),
                1
            );
            
            -- Eliminar la posición
            DELETE FROM posiciones WHERE id_posicion = @id_posicion;
            
            -- Incrementar contadores
            SET @posiciones_liquidadas = @posiciones_liquidadas + 1;
            SET @monto_total_liquidado = @monto_total_liquidado + @monto_liquidacion;
            
            FETCH NEXT FROM posiciones_cursor INTO @id_posicion, @id_empresa, @cantidad, @costo_promedio, @nombre_empresa, @precio_actual;
        END;
        
        CLOSE posiciones_cursor;
        DEALLOCATE posiciones_cursor;
        
        -----------------------------------------------
        -- 3. DESHABILITAR AL TRADER
        
        UPDATE usuarios
        SET status = 0
        WHERE id_user = @id_trader;
        
        -----------------------------------------------
        -- 4. REGISTRAR AUDITORÍA DE LA DESHABILITACIÓN
        
        INSERT INTO auditoria (
            id_user,
            user_alias,
            user_role,
            accion,
            entidad_afectada,
            id_registro_afectado,
            justificacion,
            descripcion,
            fecha_hora,
            exitosa
        )
        VALUES (
            @id_admin,
            @admin_alias,
            @admin_role,
            'USER_DISABLE',
            'usuarios',
            @id_trader,
            @justificacion,
            CONCAT('Trader ', @trader_alias, ' deshabilitado. ', 
                   @posiciones_liquidadas, ' posiciones liquidadas por $', 
                   CAST(@monto_total_liquidado AS VARCHAR)),
            GETDATE(),
            1
        );
        
        -----------------------------------------------
        -- 5. RETORNAR RESULTADOS
        
        SELECT 
            @posiciones_liquidadas AS posiciones_liquidadas,
            @monto_total_liquidado AS monto_total_liquidado;
        
    END TRY
    BEGIN CATCH
        -----------------------------------------------
        -- MANEJO DE ERRORES
        
        -- Registrar auditoría de error
        INSERT INTO auditoria (
            id_user,
            user_alias,
            user_role,
            accion,
            entidad_afectada,
            id_registro_afectado,
            justificacion,
            descripcion,
            mensaje_error,
            fecha_hora,
            exitosa
        )
        VALUES (
            @id_admin,
            @admin_alias,
            @admin_role,
            'USER_DISABLE',
            'usuarios',
            @id_trader,
            @justificacion,
            'Error al deshabilitar trader',
            ERROR_MESSAGE(),
            GETDATE(),
            0
        );
        
        -- Re-lanzar el error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END;
GO

-- =============================================
-- EJEMPLO DE USO:
-- =============================================
-- EXEC usp_DisableTrader 
--     @id_trader = 5,
--     @justificacion = 'Trader violó las políticas de trading',
--     @id_admin = 1,
--     @admin_alias = 'admin',
--     @admin_role = 'ADMINISTRADOR';
