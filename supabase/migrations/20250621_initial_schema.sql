-- Masses table
CREATE TABLE IF NOT EXISTS masses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  title VARCHAR(255) NOT NULL,
  priest VARCHAR(255),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Prayer requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_masses_date ON masses(date);
CREATE INDEX idx_prayer_requests_created_at ON prayer_requests(created_at);

-- RLS Policies
ALTER TABLE masses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- Masses: Everyone can read
CREATE POLICY "Masses are viewable by everyone" ON masses
  FOR SELECT USING (true);

-- Prayer requests: Anyone can insert, only own can view
CREATE POLICY "Anyone can create prayer requests" ON prayer_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own prayer requests" ON prayer_requests
  FOR SELECT USING (auth.uid() = user_id OR is_anonymous = false);
