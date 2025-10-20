USE BrokerTEC;
GO

-- Stored Procedure 1: Realiza una compra atomica [WALLET -= CASH], [CARTERA_TRADER += SHARES], [EMPRESA_INVENTARIO -= SHARES]
CREATE PROCEDURE stp_Comprar_Acciones
    @UserID UNIQUEIDENTIFIER,
    @CompanyID INT,
    @Cantidad INT,
    @PrecioActual DECIMAL(10, 2)
AS 
BEGIN
   SET NOCOUNT ON;
    
    -- Declaración de variables (TODAS DECLARADAS AL INICIO DEL BLOQUE)
    DECLARE @WalletID INT;
    DECLARE @SaldoActual DECIMAL(10, 2);
    DECLARE @AccionesDisponibles BIGINT; 
    DECLARE @CostoTotal DECIMAL(10, 2) = @Cantidad * @PrecioActual;

    -- Inicio de Transaccion Atomica
    BEGIN TRANSACTION;

    BEGIN TRY 
        -- Bloqueo y Validacion de Fondos e Inventario

    SELECT @WalletID = id_wallet, @SaldoActual = saldo
    FROM wallet WITH (UPDLOCK, HOLDLOCK)
        WHERE id_user = @UserID;

        IF @WalletID IS NULL
        BEGIN
            RAISERROR('El usuario no tiene una wallet activa.', 16, 1);
        END

        IF @SaldoActual < @CostoTotal
        BEGIN
            RAISERROR('Saldo insuficiente en la wallet.', 16, 1);
        END

    SELECT @AccionesDisponibles = acciones_disponibles
    FROM empresa WITH (UPDLOCK, HOLDLOCK)
        WHERE id_empresa = @CompanyID;

        IF @AccionesDisponibles < @Cantidad
        BEGIN
            RAISERROR('Inventario insuficiente de acciones en Tesorería.', 16, 1);
        END

        -- Actualizacion de Estados

        -- 1. Actualizar Wallet 
        UPDATE wallet
        SET saldo = saldo - @CostoTotal
        WHERE id_user = @UserID;

        -- 2. Actualizar Inventario de la Empresa
        UPDATE empresa
        SET acciones_disponibles = acciones_disponibles - @Cantidad
        WHERE id_empresa = @CompanyID;

        -- 3. Actualizar Cartera del Trader (INSERT o UPDATE)
        -- Si ya tiene acciones de esta empresa, actualiza la cantidad y costo promedio
        IF EXISTS (SELECT 1 FROM cartera_trader WHERE id_user = @UserID AND id_empresa = @CompanyID)
        BEGIN
            UPDATE cartera_trader
            SET 
                -- Fórmula de actualización de costo promedio
                costo_promedio = ((costo_promedio * cantidad_acciones) + @CostoTotal) / (cantidad_acciones + @Cantidad),
                cantidad_acciones = cantidad_acciones + @Cantidad
            WHERE 
                id_user = @UserID AND id_empresa = @CompanyID;
        END
        ELSE
        BEGIN
            -- Si es la primera vez que compra, insertar nueva posición
            INSERT INTO cartera_trader (id_user, id_empresa, cantidad_acciones, costo_promedio)
            VALUES (@UserID, @CompanyID, @Cantidad, @PrecioActual);
        END 

        -- 4. Registrar la Transaccion
        INSERT INTO transaccion (id_user, id_empresa, tipo, cantidad, precio, fecha_hora)
        VALUES (@UserID, @CompanyID, 'Buy', @Cantidad, @PrecioActual, GETDATE());

        -- Commit si todo fue bien
        COMMIT TRANSACTION;
        SELECT 'Compra Exitosa' AS Resultado, @CostoTotal AS Monto;

    END TRY
    BEGIN CATCH
        -- Rollback si algo falló
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Lanza la excepción para que el cliente la maneje.
        THROW; 
        RETURN -1;
    END CATCH
END
GO
PRINT 'Stored Procedure stp_Comprar_Acciones creado.';
GO