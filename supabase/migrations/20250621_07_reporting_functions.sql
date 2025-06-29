-- Create function to execute dynamic SQL queries for reports
CREATE OR ALTER PROCEDURE execute_report_query
    @query_text NVARCHAR(MAX),
    @params NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Declare variables for parameter parsing
    DECLARE @sql NVARCHAR(MAX) = @query_text;
    DECLARE @paramName NVARCHAR(100);
    DECLARE @paramValue NVARCHAR(MAX);
    
    -- Safety measures
    -- 1. Prevent destructive SQL operations
    IF @sql LIKE '%DROP%' OR @sql LIKE '%ALTER%' OR @sql LIKE '%CREATE%' OR @sql LIKE '%INSERT%' OR 
       @sql LIKE '%UPDATE%' OR @sql LIKE '%DELETE%' OR @sql LIKE '%TRUNCATE%' OR @sql LIKE '%EXEC%'
    BEGIN
        RAISERROR('Destructive SQL operations are not allowed in report queries', 16, 1);
        RETURN;
    END;
    
    -- 2. Ensure the query is a SELECT statement
    IF @sql NOT LIKE 'SELECT %'
    BEGIN
        RAISERROR('Only SELECT statements are allowed in report queries', 16, 1);
        RETURN;
    END;
    
    -- Parse JSON parameters and replace in query
    IF @params IS NOT NULL AND JSON_VALUE(@params, '$') IS NOT NULL
    BEGIN
        DECLARE param_cursor CURSOR FOR
        SELECT [key], [value] FROM OPENJSON(@params);
        
        OPEN param_cursor;
        FETCH NEXT FROM param_cursor INTO @paramName, @paramValue;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Replace parameter placeholders in query
            SET @sql = REPLACE(@sql, '{' + @paramName + '}', @paramValue);
            
            FETCH NEXT FROM param_cursor INTO @paramName, @paramValue;
        END;
        
        CLOSE param_cursor;
        DEALLOCATE param_cursor;
    END;
    
    -- Execute the parameterized query
    EXEC sp_executesql @sql;
END;
GO

-- Create common report queries
INSERT INTO report_definitions (name, description, type, query, parameters)
VALUES 
(
    'Mass Intentions Summary', 
    'Summary of mass intentions by date range and parish',
    'payment',
    'SELECT 
        m.parish_id,
        p.name as parish_name,
        COUNT(m.id) as total_intentions,
        SUM(CASE WHEN m.status = ''paid'' THEN 1 ELSE 0 END) as paid_intentions,
        SUM(CASE WHEN m.status = ''pending'' THEN 1 ELSE 0 END) as pending_intentions,
        SUM(CASE WHEN m.status = ''cancelled'' THEN 1 ELSE 0 END) as cancelled_intentions,
        AVG(m.amount) as avg_amount,
        SUM(m.amount) as total_amount
    FROM mass_intentions m
    JOIN parishes p ON m.parish_id = p.id
    WHERE m.created_at BETWEEN ''{start_date}'' AND ''{end_date}''
    GROUP BY m.parish_id, p.name
    ORDER BY total_intentions DESC',
    JSON_OBJECT('start_date', '2025-01-01', 'end_date', '2025-12-31')
),
(
    'Course Enrollment Report', 
    'Details of course enrollments and completion rates',
    'course',
    'SELECT 
        c.id as course_id,
        c.title as course_name,
        c.category,
        c.level,
        COUNT(sc.id) as total_enrollments,
        SUM(CASE WHEN sc.status = ''completed'' THEN 1 ELSE 0 END) as completed_enrollments,
        CAST(SUM(CASE WHEN sc.status = ''completed'' THEN 1 ELSE 0 END) * 100.0 / COUNT(sc.id) as DECIMAL(5,2)) as completion_rate,
        AVG(sc.progress) as avg_progress
    FROM courses c
    LEFT JOIN student_courses sc ON c.id = sc.course_id
    WHERE c.created_at <= ''{end_date}''
    GROUP BY c.id, c.title, c.category, c.level
    ORDER BY total_enrollments DESC',
    JSON_OBJECT('end_date', '2025-12-31')
),
(
    'Payment Processing Report', 
    'Summary of payment processing and success rates',
    'payment',
    'SELECT 
        w.provider,
        COUNT(w.id) as total_webhooks,
        SUM(CASE WHEN w.status = ''processed'' THEN 1 ELSE 0 END) as successful_webhooks,
        SUM(CASE WHEN w.status = ''failed'' THEN 1 ELSE 0 END) as failed_webhooks,
        CAST(SUM(CASE WHEN w.status = ''processed'' THEN 1 ELSE 0 END) * 100.0 / COUNT(w.id) as DECIMAL(5,2)) as success_rate,
        AVG(w.retry_count) as avg_retry_count
    FROM webhook_events w
    WHERE w.created_at BETWEEN ''{start_date}'' AND ''{end_date}''
      AND w.provider = ''{provider}''
    GROUP BY w.provider',
    JSON_OBJECT('start_date', '2025-01-01', 'end_date', '2025-12-31', 'provider', 'stripe')
),
(
    'User Activity Report', 
    'Summary of user activity and engagement',
    'user',
    'SELECT 
        ae.event_type,
        ae.entity_type,
        COUNT(ae.id) as event_count,
        COUNT(DISTINCT ae.user_id) as unique_users
    FROM analytics_events ae
    WHERE ae.created_at BETWEEN ''{start_date}'' AND ''{end_date}''
    GROUP BY ae.event_type, ae.entity_type
    ORDER BY event_count DESC',
    JSON_OBJECT('start_date', '2025-01-01', 'end_date', '2025-12-31')
);
GO
