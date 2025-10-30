-- Stored Procedure: usp_DelistEmpresa
-- Descripción: Elimina una empresa del sistema y liquida automáticamente
--              todas las posiciones activas de los traders
------------------
-- Parámetros de entrada:
-- @id_empresa: ID de la empresa a eliminar (delisting)
-- @justificacion: Justificación del delisting (para auditoría)
-- @id_admin: ID del administrador que realiza la acción
-- @admin_alias: Alias del administrador
-- @admin_role: Rol del administrador

CREATE OR ALTER PROCEDURE usp_DelistEmpresa
    @id_empresa INT,
    @justificacion NVARCHAR(MAX),
    @id_admin INT,
    @admin_alias VARCHAR(50),
    @admin_role VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Variables
    DECLARE @precio_actual DECIMAL(15, 2);
    DECLARE @nombre_empresa VARCHAR(100);
    DECLARE @posiciones_liquidadas INT = 0;
    DECLARE @monto_total_liquidado DECIMAL(15, 2) = 0;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -----------------------------------------------
        -- 1. VALIDAR QUE LA EMPRESA EXISTE Y ESTÁ HABILITADA

        IF NOT EXISTS (SELECT 1 FROM empresas WHERE id_empresa = @id_empresa)
        BEGIN
            RAISERROR('La empresa no existe', 16, 1);
            RETURN;
        END
        
        -- Validar que la empresa esté habilitada
        IF EXISTS (SELECT 1 FROM empresas WHERE id_empresa = @id_empresa AND habilitado = 0)
        BEGIN
            RAISERROR('La empresa ya está deshabilitada', 16, 1);
            RETURN;
        END
        
        -- Obtener información de la empresa
        SELECT 
            @precio_actual = precio_actual,
            @nombre_empresa = nombre
        FROM empresas
        WHERE id_empresa = @id_empresa;
        
        -----------------------------------------------
        -- 2. LIQUIDAR TODAS LAS POSICIONES ACTIVAS
    
        -- Cursor para procesar cada posición
        DECLARE @id_posicion INT;
        DECLARE @id_user INT;
        DECLARE @cantidad INT;
        DECLARE @costo_promedio DECIMAL(15, 2);
        DECLARE @monto_liquidacion DECIMAL(15, 2);
        DECLARE @ganancia_perdida DECIMAL(15, 2);
        DECLARE @user_alias VARCHAR(50);
        
        DECLARE posiciones_cursor CURSOR FOR
        SELECT p.id_posicion, p.id_user, p.cantidad, p.costo_promedio, u.alias
        FROM posiciones p
        INNER JOIN usuarios u ON p.id_user = u.id_user
        WHERE p.id_empresa = @id_empresa;
        
        OPEN posiciones_cursor;
        FETCH NEXT FROM posiciones_cursor INTO @id_posicion, @id_user, @cantidad, @costo_promedio, @user_alias;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Calcular monto de liquidación
            SET @monto_liquidacion = @cantidad * @precio_actual;
            
            -- Calcular ganancia o pérdida: (precio_actual - costo_promedio) × cantidad
            SET @ganancia_perdida = (@precio_actual - @costo_promedio) * @cantidad;
            
            -- Abonar al wallet del trader
            UPDATE wallets
            SET saldo = saldo + @monto_liquidacion
            WHERE id_user = @id_user;
            
            -- DEVOLVER ACCIONES AL INVENTARIO DE LA EMPRESA
            UPDATE empresas
            SET cantidad_acciones = cantidad_acciones + @cantidad
            WHERE id_empresa = @id_empresa;
            
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
            SELECT 
                @id_user,
                @user_alias,
                r.role_name,
                'VENTA',
                'posiciones',
                @id_posicion,
                @nombre_empresa,
                @cantidad,
                @precio_actual,
                @monto_liquidacion,
                w.saldo - @monto_liquidacion,
                w.saldo,
                @ganancia_perdida,
                @justificacion,
                'Venta forzada por delisting de ' + @nombre_empresa,
                GETDATE(),
                1
            FROM usuarios u
            INNER JOIN roles r ON u.id_role = r.id_role
            INNER JOIN wallets w ON u.id_user = w.id_user
            WHERE u.id_user = @id_user;
            
            -- Eliminar la posición
            DELETE FROM posiciones WHERE id_posicion = @id_posicion;
            
            -- Incrementar contadores
            SET @posiciones_liquidadas = @posiciones_liquidadas + 1;
            SET @monto_total_liquidado = @monto_total_liquidado + @monto_liquidacion;
            
            FETCH NEXT FROM posiciones_cursor INTO @id_posicion, @id_user, @cantidad, @costo_promedio, @user_alias;
        END
        
        CLOSE posiciones_cursor;
        DEALLOCATE posiciones_cursor;
        
        ----------------
        -- 3. DESHABILITAR LA EMPRESA
        UPDATE empresas
        SET habilitado = 0
        WHERE id_empresa = @id_empresa;

        ----------------
        -- 4. REGISTRAR AUDITORÍA DEL DELISTING
        INSERT INTO auditoria (
            id_user,
            user_alias,
            user_role,
            accion,
            entidad_afectada,
            id_registro_afectado,
            ticker_empresa,
            justificacion,
            descripcion,
            fecha_hora,
            exitosa
        )
        VALUES (
            @id_admin,
            @admin_alias,
            @admin_role,
            'DELISTING',
            'empresas',
            @id_empresa,
            @nombre_empresa,  -- Guardamos el nombre de la empresa
            @justificacion,
            'Delisting de ' + @nombre_empresa + '. ' + 
            CAST(@posiciones_liquidadas AS VARCHAR) + ' posiciones liquidadas por $' + 
            CAST(@monto_total_liquidado AS VARCHAR),
            GETDATE(),  --  NECESARIO en SP
            1
        );

        -------------------------------
        -- 5. CONFIRMAR TRANSACCIÓN
        COMMIT TRANSACTION;
        
        -- Mensaje de éxito
        PRINT 'Delisting completado exitosamente';
        PRINT 'Empresa: ' + @nombre_empresa;
        PRINT 'Posiciones liquidadas: ' + CAST(@posiciones_liquidadas AS VARCHAR);
        PRINT 'Monto total liquidado: $' + CAST(@monto_total_liquidado AS VARCHAR);
        
    END TRY
    BEGIN CATCH
        -------------------------------
        -- MANEJO DE ERRORES
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
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
            'DELISTING',
            'empresas',
            @id_empresa,
            @justificacion,
            'Error en delisting de empresa',
            ERROR_MESSAGE(),
            GETDATE(),  -- ✅ NECESARIO en SP
            0
        );
        
        -- Re-lanzar el error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- EJEMPLO DE USO:
-- EXEC usp_DelistEmpresa 
--     @id_empresa = 1, 
--     @justificacion = 'Fusión corporativa',
--     @id_admin = 1,
--     @admin_alias = 'admin_john',
--     @admin_role = 'ADMINISTRADOR';
