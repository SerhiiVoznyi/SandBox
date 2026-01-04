BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
    -- INSERT YOUR UPDATE TEMPLATE HERE ...
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();
        
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            PRINT '[ROLLBACK TRANSACTION]'+' '+CONVERT(varchar, GETDATE(), 114)+' '+@ErrorMessage;
        THROW;
    END CATCH;

    IF @@TRANCOUNT > 0
        COMMIT TRANSACTION;
        PRINT '[TRANSACTION COMPLETE]'
END