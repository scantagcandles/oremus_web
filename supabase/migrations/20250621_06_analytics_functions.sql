-- Function to increment webhook retry count
CREATE OR ALTER FUNCTION increment_retry_count(
    @webhook_id UNIQUEIDENTIFIER
)
RETURNS INT
AS
BEGIN
    DECLARE @retry_count INT;
    
    UPDATE webhook_events
    SET retry_count = retry_count + 1,
        @retry_count = retry_count + 1
    WHERE id = @webhook_id;
    
    RETURN @retry_count;
END;
GO

-- Function to get webhook metrics
CREATE OR ALTER FUNCTION get_webhook_metrics(
    @time_period NVARCHAR(10)
)
RETURNS TABLE
AS
RETURN (
    SELECT 
        provider,
        status,
        COUNT(*) as count,
        AVG(CAST(retry_count as FLOAT)) as avg_retries,
        MAX(retry_count) as max_retries
    FROM webhook_events
    WHERE 
        created_at >= CASE @time_period
            WHEN 'day' THEN DATEADD(day, -1, GETUTCDATE())
            WHEN 'week' THEN DATEADD(week, -1, GETUTCDATE())
            WHEN 'month' THEN DATEADD(month, -1, GETUTCDATE())
            ELSE GETUTCDATE()
        END
    GROUP BY provider, status
);
GO

-- Function to get event metrics
CREATE OR ALTER FUNCTION get_event_metrics(
    @time_period NVARCHAR(10)
)
RETURNS TABLE
AS
RETURN (
    SELECT 
        event_type,
        entity_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
    FROM analytics_events
    WHERE 
        created_at >= CASE @time_period
            WHEN 'day' THEN DATEADD(day, -1, GETUTCDATE())
            WHEN 'week' THEN DATEADD(week, -1, GETUTCDATE())
            WHEN 'month' THEN DATEADD(month, -1, GETUTCDATE())
            ELSE GETUTCDATE()
        END
    GROUP BY event_type, entity_type
);
GO
