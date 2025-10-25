
-- Stored Procedure: usp_ComprarAcciones
-- Descripción: Compra de acciones por un trader
-- Maneja la transacción completa de forma atómica


CREATE OR ALTER PROCEDURE usp_ComprarAcciones
    @id_user INT,                    -- ID del trader que compra
    @id_empresa INT,                 -- ID de la empresa a comprar
    @cantidad INT,                   -- Cantidad de acciones a comprar
    @user_alias VARCHAR(50),         -- Alias del trader (para auditoría)
    @mensaje_resultado NVARCHAR(500) OUTPUT,  -- Mensaje de resultado
    @exito BIT OUTPUT                -- 1 = éxito, 0 = error
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;  -- Rollback automático si hay error
    
    DECLARE @precio_actual DECIMAL(15,2);
    DECLARE @costo_total DECIMAL(15,2);
    DECLARE @saldo_wallet DECIMAL(15,2);
    DECLARE @id_wallet INT;
    DECLARE @id_mercado INT;
    DECLARE @mercado_habilitado BIT;
    DECLARE @empresa_habilitada BIT;
    DECLARE @cantidad_disponible_empresa INT;
    DECLARE @id_posicion_trader INT;
    DECLARE @cantidad_actual_trader INT;
    DECLARE @costo_promedio_actual DECIMAL(15,2);
    DECLARE @nuevo_costo_promedio DECIMAL(15,2);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
     -----------------
        -- 1. VALIDACIONES INICIALES
    
        
        -- Validar que la empresa exista y obtener su precio actual e info
        SELECT 
            @precio_actual = precio_actual,
            @id_mercado = id_mercado,
            @empresa_habilitada = habilitado,
            @cantidad_disponible_empresa = cantidad_acciones
        FROM empresas 
        WHERE id_empresa = @id_empresa;
        
        IF @precio_actual IS NULL
        BEGIN
            SET @mensaje_resultado = 'La empresa no existe';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validar que la empresa esté habilitada
        IF @empresa_habilitada = 0
        BEGIN
            SET @mensaje_resultado = 'La empresa está deshabilitada. No se puede comprar.';
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
        
        -- Validar que el mercado esté habilitado
        SELECT @mercado_habilitado = habilitado
        FROM mercados
        WHERE id_mercado = @id_mercado;
        
        IF @mercado_habilitado = 0
        BEGIN
            SET @mensaje_resultado = 'El mercado de esta empresa está deshabilitado';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Calcular costo total
        SET @costo_total = @cantidad * @precio_actual;
        
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
        
        -- Validar que el trader tenga cash suficiente
        IF @saldo_wallet < @costo_total
        BEGIN
            SET @mensaje_resultado = 'Saldo insuficiente. Necesitas $' + 
                CAST(@costo_total AS VARCHAR(20)) + 
                ' pero solo tienes $' + 
                CAST(@saldo_wallet AS VARCHAR(20)) +
                '. Máximo comprable: ' + 
                CAST(FLOOR(@saldo_wallet / @precio_actual) AS VARCHAR(20)) + ' acciones';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        --------------------------------------------------------------------------------------------
        -- 2. VALIDAR ACCIONES DISPONIBLES EN LA EMPRESA
        
        -- Validar que haya acciones disponibles en el inventario de la empresa
        IF @cantidad_disponible_empresa IS NULL OR @cantidad_disponible_empresa = 0
        BEGIN
            SET @mensaje_resultado = 'No hay acciones disponibles de esta empresa';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validar cantidad suficiente
        IF @cantidad_disponible_empresa < @cantidad
        BEGIN
            SET @mensaje_resultado = 'Acciones insuficientes. ' +
                'Disponibles: ' + CAST(@cantidad_disponible_empresa AS VARCHAR(20)) + 
                ' acciones, solicitadas: ' + CAST(@cantidad AS VARCHAR(20));
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
-----------------------------------------------------------------------------------
        -- 3. ACTUALIZAR WALLET (DESCONTAR DINERO)

        
        UPDATE wallets
        SET saldo = saldo - @costo_total
        WHERE id_wallet = @id_wallet;
        
       -------------------------------------------------------
        -- 4. ACTUALIZAR/CREAR POSICIÓN DEL TRADER

        
        -- Verificar si el trader ya tiene una posición en esta empresa
        SELECT 
            @id_posicion_trader = id_posicion,
            @cantidad_actual_trader = cantidad,
            @costo_promedio_actual = costo_promedio
        FROM posiciones
        WHERE id_user = @id_user
        AND id_empresa = @id_empresa;
        
        IF @id_posicion_trader IS NULL
        BEGIN
            -- CREAR nueva posición (primera compra)
            INSERT INTO posiciones (id_user, id_empresa, cantidad, costo_promedio, fecha_creacion)
            VALUES (@id_user, @id_empresa, @cantidad, @precio_actual, GETDATE());
            
            SET @id_posicion_trader = SCOPE_IDENTITY();
            SET @nuevo_costo_promedio = @precio_actual;
        END
        ELSE
        BEGIN
            -- ACTUALIZAR posición existente (calcular nuevo costo promedio)
            -- Fórmula: nuevo_costo_promedio = (valor_invertido_anterior + valor_nueva_compra) / cantidad_total
            -- valor_invertido_anterior = cantidad_actual × costo_promedio_actual
            -- valor_nueva_compra = cantidad_nueva × precio_actual
            
            DECLARE @valor_invertido_anterior DECIMAL(15,2);
            DECLARE @valor_nueva_compra DECIMAL(15,2);
            DECLARE @nueva_cantidad_total INT;
            
            SET @valor_invertido_anterior = @cantidad_actual_trader * @costo_promedio_actual;
            SET @valor_nueva_compra = @cantidad * @precio_actual;
            SET @nueva_cantidad_total = @cantidad_actual_trader + @cantidad;
            
            SET @nuevo_costo_promedio = (@valor_invertido_anterior + @valor_nueva_compra) / @nueva_cantidad_total;
            
            UPDATE posiciones
            SET cantidad = @nueva_cantidad_total,
                costo_promedio = @nuevo_costo_promedio,
                fecha_actualizacion = GETDATE()
            WHERE id_posicion = @id_posicion_trader;
        END
        
       -----------------------------------------------------
        -- 5. ACTUALIZAR INVENTARIO DE LA EMPRESA
        
        -- Reducir cantidad de acciones disponibles en la empresa
        UPDATE empresas
        SET cantidad_acciones = cantidad_acciones - @cantidad
        WHERE id_empresa = @id_empresa;
        
      -------------------------------------------------
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
            descripcion,
            exitosa,
            fecha_hora
        )
        VALUES (
            @id_user,
            @user_alias,
            'COMPRA',
            'posiciones',
            @id_posicion_trader,
            (SELECT nombre FROM empresas WHERE id_empresa = @id_empresa),
            @cantidad,
            @precio_actual,
            @costo_total,
            @saldo_wallet,
            @saldo_wallet - @costo_total,
            'Compra de ' + CAST(@cantidad AS VARCHAR(20)) + ' acciones a $' + CAST(@precio_actual AS VARCHAR(20)),
            1,
            GETDATE()
        );
        
      ------------------------------------------------------
        -- 7. COMMIT Y RESULTADO
    
        
        COMMIT TRANSACTION;
        
        SET @mensaje_resultado = 'Compra exitosa: ' + CAST(@cantidad AS VARCHAR(20)) + 
            ' acciones a $' + CAST(@precio_actual AS VARCHAR(20)) + 
            ' c/u. Total: $' + CAST(@costo_total AS VARCHAR(20)) +
            '. Costo promedio: $' + CAST(@nuevo_costo_promedio AS VARCHAR(20));
        SET @exito = 1;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SET @mensaje_resultado = 'Error en la compra: ' + ERROR_MESSAGE();
        SET @exito = 0;
    END CATCH
END
GO
