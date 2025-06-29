-- Create notifications table
CREATE TABLE notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    type NVARCHAR(50) NOT NULL CHECK (type IN ('payment', 'reminder', 'course', 'certificate', 'announcement', 'webhook_failure')),
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    scheduled_for DATETIMEOFFSET NOT NULL,
    sent_at DATETIMEOFFSET,
    metadata NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Create notification templates
CREATE TABLE notification_templates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    type NVARCHAR(50) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    subject NVARCHAR(255) NOT NULL,
    template NVARCHAR(MAX) NOT NULL,
    variables NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT UC_template_type_name UNIQUE (type, name)
);

-- Create analytics events table
CREATE TABLE analytics_events (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER,
    event_type NVARCHAR(50) NOT NULL,
    entity_type NVARCHAR(50) NOT NULL,
    entity_id UNIQUEIDENTIFIER,
    metadata NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Create webhook monitoring table
CREATE TABLE webhook_events (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    provider NVARCHAR(50) NOT NULL,
    event_type NVARCHAR(100) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
    payload NVARCHAR(MAX),
    error_message NVARCHAR(MAX),
    retry_count INT DEFAULT 0,
    processed_at DATETIMEOFFSET,
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Create reporting configurations table
CREATE TABLE report_configs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(50) NOT NULL CHECK (type IN ('payment', 'course', 'user', 'webhook', 'custom')),
    schedule NVARCHAR(50),
    query NVARCHAR(MAX),
    parameters NVARCHAR(MAX),
    recipients NVARCHAR(MAX),
    last_run_at DATETIMEOFFSET,
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT UC_report_name UNIQUE (name)
);

-- Create indices
CREATE INDEX IX_notifications_user_id ON notifications(user_id);
CREATE INDEX IX_notifications_status ON notifications(status);
CREATE INDEX IX_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX IX_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IX_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IX_analytics_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX IX_webhook_status ON webhook_events(status);
CREATE INDEX IX_webhook_provider ON webhook_events(provider);
