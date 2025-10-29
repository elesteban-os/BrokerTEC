-- Stored Procedure: usp_GetMayorTenedorPorEmpresa
-- Descripción: Obtiene el ranking de tenedores (holders) de una empresa específica
-- Incluye traders y la Tesorería (acciones disponibles sin vender)
-- Retorna: alias del tenedor, cantidad de acciones, porcentaje del total

CREATE OR ALTER PROCEDURE usp_GetMayorTenedorPorEmpresa
    @nombre_empresa VARCHAR(200)  -- Nombre de la empresa (ej: "Apple Inc.")
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id_empresa INT;
    DECLARE @cantidad_total_acciones INT;
    DECLARE @acciones_en_circulacion INT;
    DECLARE @acciones_disponibles_tesoreria INT;
    
    BEGIN TRY
        -- 1. VALIDAR QUE LA EMPRESA EXISTE
        SELECT 
            @id_empresa = id_empresa,
            @cantidad_total_acciones = cantidad_acciones
        FROM empresas
        WHERE nombre = @nombre_empresa
        AND habilitado = 1;
        
        IF @id_empresa IS NULL
        BEGIN
            -- Retornar error si la empresa no existe o está deshabilitada
            SELECT 
                'ERROR' AS status,
                'La empresa "' + @nombre_empresa + '" no existe o está deshabilitada' AS mensaje;
            RETURN;
        END
        
        -- 2. CALCULAR ACCIONES EN CIRCULACIÓN (poseídas por traders)
        SELECT @acciones_en_circulacion = ISNULL(SUM(cantidad), 0)
        FROM posiciones
        WHERE id_empresa = @id_empresa;
        
        -- 3. CALCULAR ACCIONES DISPONIBLES EN TESORERÍA
        SET @acciones_disponibles_tesoreria = @cantidad_total_acciones - @acciones_en_circulacion;
        
        -- 4. OBTENER RANKING DE TENEDORES
        -- Combinamos traders + Tesorería en una sola consulta
        SELECT 
            tenedor AS alias,
            cantidad_acciones,
            porcentaje_total = CAST(
                (CAST(cantidad_acciones AS DECIMAL(15,2)) / CAST(@cantidad_total_acciones AS DECIMAL(15,2))) * 100 
                AS DECIMAL(5,2)
            ),
            tipo_tenedor
        FROM (
            -- Traders que poseen acciones
            SELECT 
                u.alias AS tenedor,
                p.cantidad AS cantidad_acciones,
                'TRADER' AS tipo_tenedor
            FROM posiciones p
            INNER JOIN usuarios u ON p.id_user = u.id_user
            WHERE p.id_empresa = @id_empresa
            AND p.cantidad > 0
            
            UNION ALL
            
            -- Tesorería (administración)
            SELECT 
                'ADMINISTRACIÓN' AS tenedor,
                @acciones_disponibles_tesoreria AS cantidad_acciones,
                'TESORERIA' AS tipo_tenedor
            WHERE @acciones_disponibles_tesoreria > 0
        ) AS tenedores
        ORDER BY cantidad_acciones DESC;
        
        -- 5. RETORNAR INFORMACIÓN ADICIONAL DE LA EMPRESA
        SELECT 
            @nombre_empresa AS nombre_empresa,
            @cantidad_total_acciones AS total_acciones_empresa,
            @acciones_en_circulacion AS acciones_en_circulacion,
            @acciones_disponibles_tesoreria AS acciones_disponibles_tesoreria,
            'SUCCESS' AS status;
        
    END TRY
    BEGIN CATCH
        -- Manejo de errores
        SELECT 
            'ERROR' AS status,
            ERROR_MESSAGE() AS mensaje;
    END CATCH
END
GO
