-- Create courses table
CREATE TABLE courses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    category NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    duration INT NOT NULL, -- in minutes
    level NVARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    instructor NVARCHAR(255) NOT NULL,
    prerequisites NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Create lessons table
CREATE TABLE lessons (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES courses(id) ON DELETE CASCADE,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    duration INT NOT NULL, -- in minutes
    [order] INT NOT NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('video', 'text', 'quiz')),
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Create student_courses table (for enrollment)
CREATE TABLE student_courses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    course_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES courses(id) ON DELETE CASCADE,
    status NVARCHAR(20) NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
    progress INT NOT NULL DEFAULT 0,
    enrolled_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    completed_at DATETIMEOFFSET,
    last_accessed_at DATETIMEOFFSET,
    CONSTRAINT UC_student_course UNIQUE (user_id, course_id)
);

-- Create student_lessons table (for tracking progress)
CREATE TABLE student_lessons (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    lesson_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES lessons(id) ON DELETE CASCADE,
    status NVARCHAR(20) NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
    progress INT NOT NULL DEFAULT 0,
    started_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    completed_at DATETIMEOFFSET,
    last_accessed_at DATETIMEOFFSET,
    CONSTRAINT UC_student_lesson UNIQUE (user_id, lesson_id)
);

-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    lesson_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES lessons(id) ON DELETE CASCADE,
    started_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    completed_at DATETIMEOFFSET,
    score INT,
    answers NVARCHAR(MAX),
    CONSTRAINT UC_latest_quiz_attempt UNIQUE (user_id, lesson_id, started_at)
);

-- Create certificates table
CREATE TABLE certificates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    course_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES courses(id) ON DELETE CASCADE,
    title NVARCHAR(255) NOT NULL,
    recipient_name NVARCHAR(255) NOT NULL,
    instructor_name NVARCHAR(255) NOT NULL,
    grade NVARCHAR(2),
    issue_date DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    valid_until DATETIMEOFFSET,
    metadata NVARCHAR(MAX),
    CONSTRAINT UC_user_course_certificate UNIQUE (user_id, course_id)
);

-- Create analytics tables
CREATE TABLE course_analytics (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES courses(id) ON DELETE CASCADE,
    total_enrollments INT NOT NULL DEFAULT 0,
    active_students INT NOT NULL DEFAULT 0,
    completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    avg_completion_time INT, -- in minutes
    total_lesson_views INT NOT NULL DEFAULT 0,
    total_quiz_attempts INT NOT NULL DEFAULT 0,
    avg_quiz_score DECIMAL(5,2),
    recorded_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE student_activity (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    course_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES lessons(id) ON DELETE CASCADE,
    activity_type NVARCHAR(50) NOT NULL CHECK (activity_type IN (
        'lesson_view', 'quiz_attempt', 'certificate_earned',
        'course_enrolled', 'course_completed', 'course_dropped'
    )),
    metadata NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Create notification tables
CREATE TABLE notification_templates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(50) NOT NULL CHECK (type IN (
        'email', 'push', 'in_app', 'sms'
    )),
    subject NVARCHAR(255),
    content NVARCHAR(MAX) NOT NULL,
    variables NVARCHAR(MAX), -- JSON array of required variables
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE scheduled_notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    template_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES notification_templates(id),
    user_id UNIQUEIDENTIFIER NOT NULL,
    scheduled_for DATETIMEOFFSET NOT NULL,
    variables NVARCHAR(MAX), -- JSON object with variable values
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'failed', 'cancelled'
    )),
    error_message NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    sent_at DATETIMEOFFSET,
    metadata NVARCHAR(MAX)
);

CREATE TABLE notification_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    notification_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES scheduled_notifications(id),
    template_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES notification_templates(id),
    user_id UNIQUEIDENTIFIER NOT NULL,
    type NVARCHAR(50) NOT NULL,
    status NVARCHAR(20) NOT NULL,
    error_message NVARCHAR(MAX),
    sent_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    metadata NVARCHAR(MAX)
);

-- Create report_definitions table for configurable reports
CREATE TABLE report_definitions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    type NVARCHAR(50) NOT NULL CHECK (type IN (
        'course_progress', 'student_performance', 'quiz_analysis',
        'engagement_metrics', 'completion_rates', 'custom'
    )),
    query NVARCHAR(MAX) NOT NULL, -- SQL query template
    parameters NVARCHAR(MAX), -- JSON array of required parameters
    schedule NVARCHAR(100), -- CRON expression for scheduled reports
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE generated_reports (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    definition_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES report_definitions(id),
    name NVARCHAR(255) NOT NULL,
    format NVARCHAR(20) NOT NULL CHECK (format IN ('pdf', 'excel', 'csv', 'json')),
    file_path NVARCHAR(MAX) NOT NULL,
    parameters NVARCHAR(MAX), -- JSON object of used parameters
    generated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    expires_at DATETIMEOFFSET,
    metadata NVARCHAR(MAX)
);

-- Add additional indices for analytics and reporting
CREATE INDEX IX_courses_category ON courses(category);
CREATE INDEX IX_lessons_course_id ON lessons(course_id);
CREATE INDEX IX_student_courses_user_id ON student_courses(user_id);
CREATE INDEX IX_student_courses_status ON student_courses(status);
CREATE INDEX IX_student_lessons_user_id ON student_lessons(user_id);
CREATE INDEX IX_student_lessons_status ON student_lessons(status);
CREATE INDEX IX_certificates_user_id ON certificates(user_id);
CREATE INDEX IX_quiz_attempts_user_lesson ON quiz_attempts(user_id, lesson_id);
CREATE INDEX IX_course_analytics_date ON course_analytics(recorded_at);
CREATE INDEX IX_student_activity_user ON student_activity(user_id, created_at);
CREATE INDEX IX_student_activity_course ON student_activity(course_id, activity_type);
CREATE INDEX IX_scheduled_notifications_status ON scheduled_notifications(status, scheduled_for);
CREATE INDEX IX_notification_logs_date ON notification_logs(sent_at);
CREATE INDEX IX_generated_reports_definition ON generated_reports(definition_id, generated_at);
