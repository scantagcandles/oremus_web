-- Enable Row Level Security
ALTER TABLE mass_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Mass intentions policies
CREATE POLICY "Mass intentions are viewable by everyone" 
ON mass_intentions FOR SELECT USING (true);

CREATE POLICY "Users can create their own mass intentions" 
ON mass_intentions FOR INSERT 
WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update their own mass intentions" 
ON mass_intentions FOR UPDATE 
USING (auth.uid() = user_id::uuid)
WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Admins and priests can update any mass intention" 
ON mass_intentions FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE auth_id = auth.uid() 
        AND role IN ('admin', 'priest')
    )
);

-- Payment policies
CREATE POLICY "Users can view their own payments" 
ON payments FOR SELECT 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Admins can view all payments" 
ON payments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE auth_id = auth.uid() 
        AND role = 'admin'
    )
);

CREATE POLICY "Users can create payments" 
ON payments FOR INSERT 
WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Only admins can update payments" 
ON payments FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE auth_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Church policies
CREATE POLICY "Churches are viewable by everyone" 
ON churches FOR SELECT USING (true);

CREATE POLICY "Only admins can manage churches" 
ON churches FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE auth_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Notification preferences policies
CREATE POLICY "Users can manage their own notification preferences" 
ON notification_preferences 
FOR ALL USING (auth.uid() = user_id::uuid);

-- Push tokens policies
CREATE POLICY "Users can manage their own push tokens" 
ON push_tokens 
FOR ALL USING (auth.uid() = user_id::uuid);
