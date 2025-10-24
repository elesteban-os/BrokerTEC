-- Este procedimiento se almacena directamente en la base de datos BrokerTEC
-- Procedimiento almacenado: elimina un usuario y sus dependencias directas
-- Uso: Ejecutar en SQL Server (SSMS) para crear/actualizar el SP en la BD BrokerTEC
-- Seguridad: operación crítica; se asume que la API valida identidad y contraseña antes de invocar

CREATE OR ALTER PROCEDURE usp_DeleteUserHard
    @p_user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRAN;
        -- 0) Desvincular auditoría (conservar registro histórico)
        UPDATE dbo.auditoria
        SET id_user = NULL
        WHERE id_user = @p_user_id;

        -- 1) Eliminar dependencias directas (teléfonos del usuario)
        DELETE FROM PhoneNumber_User WHERE id_user = @p_user_id;

        -- 2) Eliminar usuario
        DELETE FROM usuarios WHERE id_user = @p_user_id;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW; -- propaga el error al cliente
    END CATCH
END;

