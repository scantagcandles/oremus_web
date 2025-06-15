-- Mass Schedule Table
CREATE TABLE mass_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID REFERENCES churches(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    max_intentions INTEGER DEFAULT 1,
    is_collective BOOLEAN DEFAULT false,
    celebrant_id UUID REFERENCES priests(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Recurring Schedule Table
CREATE TABLE recurring_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID REFERENCES churches(id),
    day_of_week INTEGER NOT NULL,
    time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster queries
CREATE INDEX idx_mass_schedules_church_date 
ON mass_schedules(church_id, date);