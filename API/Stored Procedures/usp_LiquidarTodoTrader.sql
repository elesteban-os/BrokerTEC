-- =============================================
-- Stored Procedure: usp_LiquidarTodoTrader
-- Descripción: Vende TODAS las posiciones de un trader al precio actual
-- Requiere validación de contraseña previa en la API
-- Maneja la transacción completa de forma atómica
-- =============================================

CREATE OR ALTER PROCEDURE usp_LiquidarTodoTrader
    @id_user INT,                    -- ID del trader que liquida
    @user_alias VARCHAR(50),         -- Alias del trader (para auditoría)
    @mensaje_resultado NVARCHAR(1000) OUTPUT,  -- Mensaje de resultado
    @exito BIT OUTPUT                -- 1 = éxito, 0 = error
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;  -- Rollback automático si hay error
    
    DECLARE @id_wallet INT;
    DECLARE @saldo_inicial DECIMAL(15,2);
    DECLARE @saldo_final DECIMAL(15,2);
    DECLARE @total_recibido DECIMAL(15,2) = 0;
    DECLARE @total_invertido DECIMAL(15,2) = 0;
    DECLARE @ganancia_perdida_total DECIMAL(15,2) = 0;
    DECLARE @cantidad_posiciones INT = 0;
    DECLARE @cantidad_acciones_vendidas INT = 0;
    
    -- Variables para iterar posiciones
    DECLARE @id_posicion INT;
    DECLARE @id_empresa INT;
    DECLARE @cantidad INT;
    DECLARE @costo_promedio DECIMAL(15,2);
    DECLARE @precio_actual DECIMAL(15,2);
    DECLARE @monto_venta DECIMAL(15,2);
    DECLARE @valor_invertido DECIMAL(15,2);
    DECLARE @ganancia_perdida_posicion DECIMAL(15,2);
    DECLARE @nombre_empresa VARCHAR(100);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- =============================================
        -- 1. VALIDACIONES INICIALES
        -- =============================================
        
        -- Obtener wallet del trader
        SELECT @id_wallet = id_wallet, @saldo_inicial = saldo
        FROM wallets
        WHERE id_user = @id_user;
        
        IF @id_wallet IS NULL
        BEGIN
            SET @mensaje_resultado = 'No tienes un wallet activo. Contacta al administrador.';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Contar posiciones del trader
        SELECT @cantidad_posiciones = COUNT(*)
        FROM posiciones
        WHERE id_user = @id_user;
        
        IF @cantidad_posiciones = 0
        BEGIN
            SET @mensaje_resultado = 'No tienes posiciones activas para liquidar';
            SET @exito = 0;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- =============================================
        -- 2. CREAR TABLA TEMPORAL PARA PROCESAR
        -- =============================================
        
        CREATE TABLE #PosicionesALiquidar (
            id_posicion INT,
            id_empresa INT,
            nombre_empresa VARCHAR(100),
            cantidad INT,
            costo_promedio DECIMAL(15,2),
            precio_actual DECIMAL(15,2),
            monto_venta DECIMAL(15,2),
            valor_invertido DECIMAL(15,2),
            ganancia_perdida DECIMAL(15,2)
        );
        
        -- Insertar todas las posiciones con sus cálculos
        INSERT INTO #PosicionesALiquidar
        SELECT 
            p.id_posicion,
            p.id_empresa,
            e.nombre,
            p.cantidad,
            p.costo_promedio,
            e.precio_actual,
            p.cantidad * e.precio_actual AS monto_venta,
            p.cantidad * p.costo_promedio AS valor_invertido,
            (e.precio_actual - p.costo_promedio) * p.cantidad AS ganancia_perdida
        FROM posiciones p
        INNER JOIN empresas e ON p.id_empresa = e.id_empresa
        WHERE p.id_user = @id_user
        AND e.precio_actual > 0;  -- Solo empresas con precio válido
        
        -- Validar que todas las posiciones tengan precio
        IF (SELECT COUNT(*) FROM #PosicionesALiquidar) < @cantidad_posiciones
        BEGIN
            SET @mensaje_resultado = 'Algunas empresas no tienen precio actual disponible. No se puede liquidar.';
            SET @exito = 0;
            DROP TABLE #PosicionesALiquidar;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- =============================================
        -- 3. CALCULAR TOTALES
        -- =============================================
        
        SELECT 
            @total_recibido = SUM(monto_venta),
            @total_invertido = SUM(valor_invertido),
            @ganancia_perdida_total = SUM(ganancia_perdida),
            @cantidad_acciones_vendidas = SUM(cantidad)
        FROM #PosicionesALiquidar;
        
        -- =============================================
        -- 4. ACTUALIZAR WALLET
        -- =============================================
        
        UPDATE wallets
        SET saldo = saldo + @total_recibido
        WHERE id_wallet = @id_wallet;
        
        SET @saldo_final = @saldo_inicial + @total_recibido;
        
        -- =============================================
        -- 5. PROCESAR CADA POSICIÓN
        -- =============================================
        
        DECLARE cursor_posiciones CURSOR FOR
        SELECT id_posicion, id_empresa, nombre_empresa, cantidad, costo_promedio, 
               precio_actual, monto_venta, ganancia_perdida
        FROM #PosicionesALiquidar;
        
        OPEN cursor_posiciones;
        
        FETCH NEXT FROM cursor_posiciones 
        INTO @id_posicion, @id_empresa, @nombre_empresa, @cantidad, @costo_promedio,
             @precio_actual, @monto_venta, @ganancia_perdida_posicion;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Eliminar la posición del trader
            DELETE FROM posiciones WHERE id_posicion = @id_posicion;
            
            -- Devolver acciones al inventario de la empresa
            UPDATE empresas
            SET cantidad_acciones = cantidad_acciones + @cantidad
            WHERE id_empresa = @id_empresa;
            
            -- Registrar auditoría de cada venta
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
                requiere_confirmacion,
                exitosa,
                fecha_hora
            )
            VALUES (
                @id_user,
                @user_alias,
                'LIQUIDAR_TODO',
                'posiciones',
                @id_posicion,
                @nombre_empresa,
                @cantidad,
                @precio_actual,
                @monto_venta,
                @saldo_inicial,
                @saldo_final,
                @ganancia_perdida_posicion,
                'Liquidación total: Venta de ' + CAST(@cantidad AS VARCHAR(20)) + 
                ' acciones de ' + @nombre_empresa + ' a $' + CAST(@precio_actual AS VARCHAR(20)),
                1,  -- Requirió confirmación de contraseña
                1,
                GETDATE()
            );
            
            FETCH NEXT FROM cursor_posiciones 
            INTO @id_posicion, @id_empresa, @nombre_empresa, @cantidad, @costo_promedio,
                 @precio_actual, @monto_venta, @ganancia_perdida_posicion;
        END
        
        CLOSE cursor_posiciones;
        DEALLOCATE cursor_posiciones;
        
        -- =============================================
        -- 6. LIMPIAR Y COMMIT
        -- =============================================
        
        DROP TABLE #PosicionesALiquidar;
        
        COMMIT TRANSACTION;
        
        -- Construir mensaje de resultado
        DECLARE @mensaje_ganancia_perdida VARCHAR(200);
        
        IF @ganancia_perdida_total > 0
            SET @mensaje_ganancia_perdida = 'Ganancia total: $' + CAST(@ganancia_perdida_total AS VARCHAR(20));
        ELSE IF @ganancia_perdida_total < 0
            SET @mensaje_ganancia_perdida = 'Pérdida total: $' + CAST(ABS(@ganancia_perdida_total) AS VARCHAR(20));
        ELSE
            SET @mensaje_ganancia_perdida = 'Sin ganancia ni pérdida';
        
        SET @mensaje_resultado = 'Liquidación exitosa de ' + CAST(@cantidad_posiciones AS VARCHAR(20)) + 
            ' posiciones (' + CAST(@cantidad_acciones_vendidas AS VARCHAR(20)) + ' acciones). ' +
            'Total invertido: $' + CAST(@total_invertido AS VARCHAR(20)) + '. ' +
            'Total recibido: $' + CAST(@total_recibido AS VARCHAR(20)) + '. ' +
            @mensaje_ganancia_perdida + '. ' +
            'Saldo final: $' + CAST(@saldo_final AS VARCHAR(20));
        
        SET @exito = 1;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Limpiar tabla temporal si existe
        IF OBJECT_ID('tempdb..#PosicionesALiquidar') IS NOT NULL
            DROP TABLE #PosicionesALiquidar;
        
        SET @mensaje_resultado = 'Error en la liquidación: ' + ERROR_MESSAGE();
        SET @exito = 0;
    END CATCH
END
GO
