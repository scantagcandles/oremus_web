-- Create calendar_events table
CREATE TABLE calendar_events (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    start_time DATETIMEOFFSET NOT NULL,
    end_time DATETIMEOFFSET NOT NULL,
    parish_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES parishes(id) ON DELETE CASCADE,
    metadata NVARCHAR(MAX),
    status NVARCHAR(50) NOT NULL DEFAULT 'scheduled',
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Create reminders table
CREATE TABLE reminders (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    intention_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES masses(id) ON DELETE CASCADE,
    type NVARCHAR(50) NOT NULL,
    scheduled_for DATETIMEOFFSET NOT NULL,
    parish_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES parishes(id) ON DELETE CASCADE,
    metadata NVARCHAR(MAX),
    status NVARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Add indices for better query performance
CREATE INDEX idx_calendar_events_parish_id ON calendar_events(parish_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_reminders_intention_id ON reminders(intention_id);
CREATE INDEX idx_reminders_scheduled_for ON reminders(scheduled_for);
CREATE INDEX idx_reminders_status ON reminders(status);

-- Update masses table structure to match MassIntention type
ALTER TABLE masses ADD intention_for NVARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE masses ADD mass_date NVARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE masses ADD mass_time NVARCHAR(50);
ALTER TABLE masses ADD mass_type NVARCHAR(50) NOT NULL DEFAULT 'regular';
ALTER TABLE masses ADD payment_id NVARCHAR(255);
ALTER TABLE masses ADD payment_status NVARCHAR(50) DEFAULT 'pending';
ALTER TABLE masses ADD is_paid BIT DEFAULT 0;

-- Add check constraint for mass type
ALTER TABLE masses ADD CONSTRAINT CK_masses_type CHECK (mass_type IN ('regular', 'requiem', 'thanksgiving'));
