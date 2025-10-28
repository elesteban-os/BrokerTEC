-- Stored Procedure: usp_GetDistribucionAccionesMercado
-- Descripción: Obtiene la distribución de acciones entre traders y administración
-- Puede agruparse por mercado o por empresa individual
-- Calcula el % de acciones en manos de traders vs. acciones disponibles en Tesorería

CREATE OR ALTER PROCEDURE usp_GetDistribucionAccionesMercado
    @id_mercado INT = NULL,           -- NULL = todos los mercados, o ID específico
    @nivel VARCHAR(10) = 'empresa'    -- 'empresa' = detalle por empresa, 'mercado' = agrupado por mercado
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- VALIDAR parámetro de nivel
        IF @nivel NOT IN ('empresa', 'mercado')
        BEGIN
            SELECT 
                'ERROR' AS status,
                'El parámetro @nivel debe ser ''empresa'' o ''mercado''' AS mensaje;
            RETURN;
        END
        
        -- ============================================
        -- OPCIÓN 1: DISTRIBUCIÓN POR EMPRESA
        -- ============================================
        IF @nivel = 'empresa'
        BEGIN
            SELECT 
                m.id_mercado,
                m.nombre AS nombre_mercado,
                e.id_empresa,
                e.nombre AS nombre_empresa,
                e.cantidad_acciones AS total_acciones_empresa,
                
                -- Acciones poseídas por traders
                ISNULL(SUM(p.cantidad), 0) AS acciones_en_traders,
                
                -- Acciones disponibles en Tesorería (no vendidas)
                (e.cantidad_acciones - ISNULL(SUM(p.cantidad), 0)) AS acciones_en_tesoreria,
                
                -- Porcentaje en traders
                CAST(
                    (CAST(ISNULL(SUM(p.cantidad), 0) AS DECIMAL(15,2)) / 
                     CAST(e.cantidad_acciones AS DECIMAL(15,2))) * 100 
                    AS DECIMAL(5,2)
                ) AS porcentaje_traders,
                
                -- Porcentaje en Tesorería (administración)
                CAST(
                    (CAST((e.cantidad_acciones - ISNULL(SUM(p.cantidad), 0)) AS DECIMAL(15,2)) / 
                     CAST(e.cantidad_acciones AS DECIMAL(15,2))) * 100 
                    AS DECIMAL(5,2)
                ) AS porcentaje_tesoreria,
                
                -- Número de traders únicos que poseen acciones de esta empresa
                COUNT(DISTINCT p.id_user) AS numero_traders_tenedores
                
            FROM empresas e
            INNER JOIN mercados m ON e.id_mercado = m.id_mercado
            LEFT JOIN posiciones p ON e.id_empresa = p.id_empresa AND p.cantidad > 0
            LEFT JOIN usuarios u ON p.id_user = u.id_user AND u.id_role = 3 -- Solo traders
            WHERE 
                e.habilitado = 1
                AND (@id_mercado IS NULL OR m.id_mercado = @id_mercado)
            GROUP BY 
                m.id_mercado,
                m.nombre,
                e.id_empresa,
                e.nombre,
                e.cantidad_acciones
            ORDER BY 
                m.nombre,
                e.nombre;
        END
        
        -- ============================================
        -- OPCIÓN 2: DISTRIBUCIÓN POR MERCADO (AGRUPADO)
        -- ============================================
        ELSE IF @nivel = 'mercado'
        BEGIN
            SELECT 
                m.id_mercado,
                m.nombre AS nombre_mercado,
                
                -- Total de acciones en el mercado (suma de todas las empresas)
                SUM(e.cantidad_acciones) AS total_acciones_mercado,
                
                -- Acciones totales en manos de traders
                SUM(ISNULL(tenencias.total_en_traders, 0)) AS acciones_en_traders,
                
                -- Acciones totales en Tesorería
                SUM(e.cantidad_acciones - ISNULL(tenencias.total_en_traders, 0)) AS acciones_en_tesoreria,
                
                -- Porcentaje en traders
                CAST(
                    (CAST(SUM(ISNULL(tenencias.total_en_traders, 0)) AS DECIMAL(15,2)) / 
                     CAST(SUM(e.cantidad_acciones) AS DECIMAL(15,2))) * 100 
                    AS DECIMAL(5,2)
                ) AS porcentaje_traders,
                
                -- Porcentaje en Tesorería
                CAST(
                    (CAST(SUM(e.cantidad_acciones - ISNULL(tenencias.total_en_traders, 0)) AS DECIMAL(15,2)) / 
                     CAST(SUM(e.cantidad_acciones) AS DECIMAL(15,2))) * 100 
                    AS DECIMAL(5,2)
                ) AS porcentaje_tesoreria,
                
                -- Número de empresas en el mercado
                COUNT(DISTINCT e.id_empresa) AS numero_empresas,
                
                -- Número de traders únicos con posiciones en este mercado
                COUNT(DISTINCT tenencias.id_user) AS numero_traders_activos
                
            FROM mercados m
            INNER JOIN empresas e ON m.id_mercado = e.id_mercado
            LEFT JOIN (
                -- Subquery: total de acciones por empresa en manos de traders
                SELECT 
                    p.id_empresa,
                    p.id_user,
                    SUM(p.cantidad) AS total_en_traders
                FROM posiciones p
                INNER JOIN usuarios u ON p.id_user = u.id_user
                WHERE u.id_role = 3 -- Solo traders
                AND p.cantidad > 0
                GROUP BY p.id_empresa, p.id_user
            ) AS tenencias ON e.id_empresa = tenencias.id_empresa
            WHERE 
                e.habilitado = 1
                AND m.habilitado = 1
                AND (@id_mercado IS NULL OR m.id_mercado = @id_mercado)
            GROUP BY 
                m.id_mercado,
                m.nombre
            ORDER BY 
                m.nombre;
        END
        
    END TRY
    BEGIN CATCH
        -- Manejo de errores
        SELECT 
            'ERROR' AS status,
            ERROR_MESSAGE() AS mensaje;
    END CATCH
END
GO
