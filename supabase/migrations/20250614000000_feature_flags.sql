CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    rollout_percentage SMALLINT CHECK (rollout_percentage BETWEEN 0 AND 100),
    variant VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default feature flags
INSERT INTO feature_flags (name, description, is_active, rollout_percentage) 
VALUES 
    ('mass-ordering', 'Online mass ordering system', true, 100),
    ('odb-player', 'ODB Player Premium feature', true, 50),
    ('academy', 'Educational platform', false, 25),
    ('digital-library', 'Digital library with religious materials', false, 25),
    ('modern-design', 'Modern UI with glassmorphism', true, 100),
    ('glassmorphism', 'Glassmorphism design system', true, 100)
ON CONFLICT (name) DO NOTHING;

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    component VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    value FLOAT NOT NULL,
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user preferences table for feature opt-in/out
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID REFERENCES auth.users(id),
    feature_preferences JSONB DEFAULT '{}',
    design_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);
