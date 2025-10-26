-- Stored Procedure: usp_VenderAcciones
-- Descripción: Venta de acciones por un trader
-- Maneja la transacción completa de forma atómica

CREATE OR ALTER PROCEDURE usp_VenderAcciones
    @id_user INT,                    -- ID del trader que vende
    @id_empresa INT,                 -- ID de la empresa a vender
    @cantidad INT,                   -- Cantidad de acciones a vender
    @user_alias VARCHAR(50),         -- Alias del trader (para auditoría)
    @mensaje_resultado NVARCHAR(500) OUTPUT,  -- Mensaje de resultado
    @exito BIT OUTPUT                -- 1 = éxito, 0 = error
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;  -- Rollback automático si hay error
    
    DECLARE @precio_actual DECIMAL(15,2);
    DECLARE @monto_venta DECIMAL(15,2);
    DECLARE @saldo_wallet DECIMAL(15,2);
    DECLARE @id_wallet INT;
    DECLARE @id_posicion_trader INT;
    DECLARE @cantidad_poseida INT;
    DECLARE @costo_promedio DECIMAL(15,2);
    DECLARE @ganancia_perdida DECIMAL(15,2);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -------------------------------------------------
        -- 1. VALIDACIONES INICIALES
        
        -- Validar que la empresa exista y obtener su precio actual
        SELECT @precio_actual = precio_actual
        FROM empresas 
        WHERE id_empresa = @id_empresa;
        
        IF @precio_actual IS NULL
        BEGIN
            SET @mensaje_resultado = 'La empresa no existe';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validar que el precio actual esté disponible (> 0)
        IF @precio_actual <= 0
        BEGIN
            SET @mensaje_resultado = 'Precio actual no disponible para esta empresa';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Calcular monto de la venta
        SET @monto_venta = @cantidad * @precio_actual;
        
        -- Obtener wallet del trader
        SELECT @id_wallet = id_wallet, @saldo_wallet = saldo
        FROM wallets
        WHERE id_user = @id_user;
        
        IF @id_wallet IS NULL
        BEGIN
            SET @mensaje_resultado = 'No tienes un wallet activo. Contacta al administrador.';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- ------------------------------------------------
        -- 2. VALIDAR POSICIÓN DEL TRADER
        
        -- Verificar que el trader tenga una posición en esta empresa
        SELECT 
            @id_posicion_trader = id_posicion,
            @cantidad_poseida = cantidad,
            @costo_promedio = costo_promedio
        FROM posiciones
        WHERE id_user = @id_user
        AND id_empresa = @id_empresa;
        
        IF @id_posicion_trader IS NULL
        BEGIN
            SET @mensaje_resultado = 'No posees acciones de esta empresa';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validar que tenga suficientes acciones para vender
        IF @cantidad_poseida < @cantidad
        BEGIN
            SET @mensaje_resultado = 'Cantidad insuficiente. Posees ' + 
                CAST(@cantidad_poseida AS VARCHAR(20)) + 
                ' acciones, pero intentas vender ' + 
                CAST(@cantidad AS VARCHAR(20));
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Calcular ganancia/pérdida
        SET @ganancia_perdida = (@precio_actual - @costo_promedio) * @cantidad;

        -- ------------------------------------------------
        -- 3. ACTUALIZAR WALLET (AGREGAR DINERO)
        
        UPDATE wallets
        SET saldo = saldo + @monto_venta
        WHERE id_wallet = @id_wallet;

        -- ------------------------------------------------
        -- 4. ACTUALIZAR POSICIÓN DEL TRADER

        
        IF @cantidad_poseida = @cantidad
        BEGIN
            -- Si vende todas sus acciones, eliminar la posición
            DELETE FROM posiciones WHERE id_posicion = @id_posicion_trader;
        END
        ELSE
        BEGIN
            -- Si vende parcialmente, reducir cantidad (el costo_promedio se mantiene)
            UPDATE posiciones
            SET cantidad = cantidad - @cantidad,
                fecha_actualizacion = GETDATE()
            WHERE id_posicion = @id_posicion_trader;
        END

        -- ------------------------------------------------
        -- 5. ACTUALIZAR INVENTARIO DE LA EMPRESA
        
        -- Aumentar cantidad de acciones disponibles en la empresa
        UPDATE empresas
        SET cantidad_acciones = cantidad_acciones + @cantidad
        WHERE id_empresa = @id_empresa;

        -- ------------------------------------------------
        -- 6. REGISTRAR AUDITORÍA

        
        INSERT INTO auditoria (
            id_user,
            user_alias,
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
            descripcion,
            exitosa,
            fecha_hora
        )
        VALUES (
            @id_user,
            @user_alias,
            'VENTA',
            'posiciones',
            @id_posicion_trader,
            (SELECT nombre FROM empresas WHERE id_empresa = @id_empresa),
            @cantidad,
            @precio_actual,
            @monto_venta,
            @saldo_wallet,
            @saldo_wallet + @monto_venta,
            @ganancia_perdida,
            'Venta de ' + CAST(@cantidad AS VARCHAR(20)) + ' acciones a $' + CAST(@precio_actual AS VARCHAR(20)) +
            '. Ganancia/Pérdida: $' + CAST(@ganancia_perdida AS VARCHAR(20)),
            1,
            GETDATE()
        );

        -- ------------------------------------------------
        -- 7. COMMIT Y RESULTADO
        
        COMMIT TRANSACTION;
        
        DECLARE @mensaje_ganancia_perdida VARCHAR(100);
        
        IF @ganancia_perdida > 0
            SET @mensaje_ganancia_perdida = 'Ganancia: $' + CAST(@ganancia_perdida AS VARCHAR(20));
        ELSE IF @ganancia_perdida < 0
            SET @mensaje_ganancia_perdida = 'Pérdida: $' + CAST(ABS(@ganancia_perdida) AS VARCHAR(20));
        ELSE
            SET @mensaje_ganancia_perdida = 'Sin ganancia ni pérdida';
        
        SET @mensaje_resultado = 'Venta exitosa: ' + CAST(@cantidad AS VARCHAR(20)) + 
            ' acciones a $' + CAST(@precio_actual AS VARCHAR(20)) + 
            ' c/u. Total recibido: $' + CAST(@monto_venta AS VARCHAR(20)) +
            '. ' + @mensaje_ganancia_perdida;
        SET @exito = 1;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SET @mensaje_resultado = 'Error en la venta: ' + ERROR_MESSAGE();
        SET @exito = 0;
    END CATCH
END
GO
