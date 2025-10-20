USE BrokerTEC;
GO

-- View 1: Calcula el precio actual, la variacion y la capitalizacion de mercado.
CREATE VIEW vw_Empresas_Capitalizacion AS
WITH PreciosRankeados AS (
    SELECT
        PH.id_empresa,
        PH.precio AS PrecioActual,
        PH.fecha_hora AS FechaActual,
        ROW_NUMBER() OVER (PARTITION BY PH.id_empresa ORDER BY PH.fecha_hora DESC) AS rn_actual,
        LEAD(PH.precio, 1) OVER (PARTITION BY PH.id_empresa ORDER BY PH.fecha_hora DESC) AS PrecioAnterior
    FROM
        precio_historico AS PH
)

SELECT
    E.id_empresa,
    E.nombre AS Empresa_Nombre,
    M.nombre AS Mercado_Nombre,
    E.estado AS Estado,
    PR.PrecioActual,
    E.acciones_totales,
    E.acciones_disponibles AS Inventario_Tesoreria,
    (PR.PrecioActual * E.acciones_totales) AS Capitalizacion_Calculada,
    (PR.PrecioActual - PrecioAnterior) / PrecioAnterior * 100 AS Variacion_Pct
FROM
    empresa AS E
JOIN
    mercado AS M ON E.id_mercado = M.id_mercado
JOIN
    PreciosRankeados AS PR ON E.id_empresa = PR.id_empresa
WHERE
    PR.rn_actual = 1;
GO
PRINT 'Vista vw_Empresas_Capitalizacion creada.';
GO

