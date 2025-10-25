
-- Stored Procedure: usp_CreateWalletForTrader
-- Descripción: Crea automáticamente un wallet para un usuario TRADER
-- Parámetros de entrada:
-- @id_user: ID del usuario trader al que se le creará el wallet
-- @categoria: Categoría del wallet (JUNIOR, MID, SENIOR) - default: JUNIOR


CREATE OR ALTER PROCEDURE usp_CreateWalletForTrader
    @id_user INT,
    @categoria VARCHAR(10) = 'JUNIOR'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Variables para límites según categoría
    DECLARE @limite_diario DECIMAL(15, 2);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 1. VALIDAR QUE EL USUARIO EXISTE Y ES TRADER
        IF NOT EXISTS (
            SELECT 1 
            FROM usuarios u
            INNER JOIN roles r ON u.id_role = r.id_role
            WHERE u.id_user = @id_user 
            AND r.role_name = 'TRADER'
        )
        BEGIN
            -- Si el usuario no existe o no es trader, lanzar error
            RAISERROR('El usuario no existe o no es un TRADER', 16, 1);
            RETURN;
        END
        
  
        -- 2. VALIDAR QUE NO TENGA WALLET YA CREADO
        IF EXISTS (SELECT 1 FROM wallets WHERE id_user = @id_user)
        BEGIN
            -- Si ya tiene wallet, no hacer nada (no es error, solo retornar)
            PRINT 'El usuario ya tiene un wallet creado';
            COMMIT TRANSACTION;
            RETURN;
        END
        

        -- 3. DEFINIR LÍMITE DIARIO SEGÚN CATEGORÍA
        -- Según requerimientos del proyecto:
        -- JUNIOR: Límite bajo ($1,000 USD/día)
        -- MID: Límite medio ($5,000 USD/día)
        -- SENIOR: Límite alto ($10,000 USD/día)
        
        SET @limite_diario = CASE @categoria
            WHEN 'JUNIOR' THEN 5000.00   --dolares
            WHEN 'MID' THEN 10000.00      --dolares
            WHEN 'SENIOR' THEN 50000.00   --dolares
            ELSE 5000.00 -- Default: JUNIOR
        END;
        
        -- =============================================
        -- 4. CREAR EL WALLET CON VALORES INICIALES
        -- =============================================
        INSERT INTO wallets (
            id_user,
            saldo,
            categoria,
            limite_diario,
            consumo_dia,
            fecha_ultima_recarga
        )
        VALUES (
            @id_user,
            0.00,                   -- Saldo inicial: $0
            @categoria,             -- Categoría asignada
            @limite_diario,         -- Límite según categoría
            0.00,                   -- Sin consumo inicial
            NULL                    -- Sin recargas aún
        );
        
        -- 5. CONFIRMAR TRANSACCIÓN
        COMMIT TRANSACTION;
        
        -- Mensaje de éxito
        PRINT 'Wallet creado exitosamente para el usuario ' + CAST(@id_user AS VARCHAR);
        
    END TRY
    BEGIN CATCH

        -- MANEJO DE ERRORES
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Re-lanzar el error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- EJEMPLO DE USO:
-- EXEC usp_CreateWalletForTrader @id_user = 5, @categoria = 'JUNIOR';
-- EXEC usp_CreateWalletForTrader @id_user = 6, @categoria = 'MID';
-- EXEC usp_CreateWalletForTrader @id_user = 7, @categoria = 'SENIOR';
