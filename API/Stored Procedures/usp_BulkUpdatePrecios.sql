
-- Stored Procedure: usp_BulkUpdatePrecios
-- Descripción: Actualiza precios de múltiples empresas en una transacción atómica


CREATE OR ALTER PROCEDURE usp_BulkUpdatePrecios
    @precios_json NVARCHAR(MAX), -- JSON con array de {id_empresa, precio_actual}
    @id_admin INT,
    @admin_alias NVARCHAR(50),
    @admin_role NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON; -- Importante para manejar transacciones correctamente
    
    DECLARE @exitosos INT = 0;
    DECLARE @fallidos INT = 0;
    DECLARE @id_empresa INT;
    DECLARE @precio_nuevo DECIMAL(10,2);
    DECLARE @precio_anterior DECIMAL(10,2);
    DECLARE @nombre_empresa NVARCHAR(100);
    DECLARE @empresa_habilitada BIT;
    DECLARE @mercado_habilitado BIT;
    DECLARE @error_msg NVARCHAR(500);
    
    -- Tabla temporal para almacenar resultados
    CREATE TABLE #Resultados (
        id_empresa INT,
        nombre_empresa NVARCHAR(100),
        status NVARCHAR(20),
        precio_anterior DECIMAL(10,2) NULL,
        precio_nuevo DECIMAL(10,2) NULL,
        variacion_porcentual DECIMAL(10,2) NULL,
        mensaje NVARCHAR(500) NULL
    );

    BEGIN TRY
        -- Parsear JSON y crear tabla temporal con los datos
        SELECT 
            CAST(JSON_VALUE(value, '$.id_empresa') AS INT) AS id_empresa,
            CAST(JSON_VALUE(value, '$.precio_actual') AS DECIMAL(10,2)) AS precio_actual
        INTO #PreciosTemp
        FROM OPENJSON(@precios_json);

        -- Cursor para procesar cada empresa
        DECLARE precio_cursor CURSOR FOR
        SELECT id_empresa, precio_actual
        FROM #PreciosTemp;

        OPEN precio_cursor;
        FETCH NEXT FROM precio_cursor INTO @id_empresa, @precio_nuevo;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @error_msg = NULL;
            SET @nombre_empresa = NULL;
            SET @precio_anterior = NULL;
            SET @empresa_habilitada = NULL;
            SET @mercado_habilitado = NULL;
            
            -- Validar que la empresa existe y obtener datos
            SELECT 
                @nombre_empresa = e.nombre,
                @precio_anterior = e.precio_actual,
                @empresa_habilitada = e.habilitado,
                @mercado_habilitado = m.habilitado
            FROM empresas e
            INNER JOIN mercados m ON e.id_mercado = m.id_mercado
            WHERE e.id_empresa = @id_empresa;

            -- Validaciones
            IF @nombre_empresa IS NULL
            BEGIN
                SET @error_msg = 'Empresa no encontrada';
                SET @fallidos = @fallidos + 1;
                
                INSERT INTO #Resultados (id_empresa, nombre_empresa, status, mensaje)
                VALUES (@id_empresa, NULL, 'error', @error_msg);
            END
            ELSE IF @empresa_habilitada = 0
            BEGIN
                SET @error_msg = 'Empresa deshabilitada';
                SET @fallidos = @fallidos + 1;
                
                INSERT INTO #Resultados (id_empresa, nombre_empresa, status, mensaje)
                VALUES (@id_empresa, @nombre_empresa, 'error', @error_msg);
            END
            ELSE IF @mercado_habilitado = 0
            BEGIN
                SET @error_msg = 'Mercado deshabilitado';
                SET @fallidos = @fallidos + 1;
                
                INSERT INTO #Resultados (id_empresa, nombre_empresa, status, mensaje)
                VALUES (@id_empresa, @nombre_empresa, 'error', @error_msg);
            END
            ELSE IF @precio_nuevo <= 0
            BEGIN
                SET @error_msg = 'Precio inválido (debe ser mayor a 0)';
                SET @fallidos = @fallidos + 1;
                
                INSERT INTO #Resultados (id_empresa, nombre_empresa, status, mensaje)
                VALUES (@id_empresa, @nombre_empresa, 'error', @error_msg);
            END
            ELSE
            BEGIN
                -- Actualización exitosa
                
                -- 1. Guardar en historial de precios (tabla correcta: precios_historicos)
                INSERT INTO precios_historicos (id_empresa, precio, fecha_hora)
                VALUES (@id_empresa, @precio_nuevo, GETDATE());

                -- 2. Actualizar precio actual en la empresa
                UPDATE empresas
                SET precio_actual = @precio_nuevo
                WHERE id_empresa = @id_empresa;

                -- 3. Registrar resultado exitoso
                DECLARE @variacion DECIMAL(10,2);
                IF @precio_anterior > 0
                    SET @variacion = ((@precio_nuevo - @precio_anterior) / @precio_anterior) * 100;
                ELSE
                    SET @variacion = 0;

                INSERT INTO #Resultados (id_empresa, nombre_empresa, status, precio_anterior, precio_nuevo, variacion_porcentual, mensaje)
                VALUES (@id_empresa, @nombre_empresa, 'success', @precio_anterior, @precio_nuevo, @variacion, NULL);

                SET @exitosos = @exitosos + 1;
            END

            FETCH NEXT FROM precio_cursor INTO @id_empresa, @precio_nuevo;
        END;

        CLOSE precio_cursor;
        DEALLOCATE precio_cursor;

        -- Registrar en auditoría
        INSERT INTO auditoria (
            id_user,
            user_alias,
            user_role,
            accion,
            entidad_afectada,
            descripcion,
            fecha_hora
        )
        VALUES (
            @id_admin,
            @admin_alias,
            @admin_role,
            'PRECIO_UPDATE_API',
            'precios',
            CONCAT('Actualización masiva: ', @exitosos, ' exitosos, ', @fallidos, ' fallidos'),
            GETDATE()
        );

        -- Retornar resultados
        SELECT 
            @exitosos AS exitosos,
            @fallidos AS fallidos,
            (SELECT * FROM #Resultados FOR JSON PATH) AS detalles_json;

    END TRY
    BEGIN CATCH
        -- En caso de error catastrófico, retornar resultado con error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        SELECT 
            0 AS exitosos,
            0 AS fallidos,
            CONCAT('[{"error":"', REPLACE(@ErrorMessage, '"', '\"'), '"}]') AS detalles_json;
    END CATCH;

    -- Limpiar tablas temporales
    IF OBJECT_ID('tempdb..#PreciosTemp') IS NOT NULL
        DROP TABLE #PreciosTemp;
    IF OBJECT_ID('tempdb..#Resultados') IS NOT NULL
        DROP TABLE #Resultados;
END;
GO
