-- Multi-Tenant Schema for Oremus
-- This migration adds organizations and memberships tables
-- and modifies existing tables to support multi-tenancy

-- Organizations (Parishes or other tenant organizations)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- For subdomains: [slug].oremus.pl
  custom_domain TEXT UNIQUE, -- Optional custom domain
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  plan TEXT DEFAULT 'basic', -- 'basic', 'premium', 'enterprise'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb -- Customization settings
);

-- Memberships (Links users to organizations with roles)
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'proboszcz', 'wikariusz', 'rezydent', 'kapelan'
  permissions JSONB DEFAULT '{}'::jsonb, -- Granular permissions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Add organization_id to existing tables
-- Mass intentions are linked to a specific parish
ALTER TABLE mass_intentions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Payments should be linked to an organization for financial tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Candles should be linked to an organization
ALTER TABLE candles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Announcements should be linked to an organization
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Calendar events should be linked to an organization
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON organizations(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_mass_intentions_organization_id ON mass_intentions(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_organization_id ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_candles_organization_id ON candles(organization_id);
CREATE INDEX IF NOT EXISTS idx_announcements_organization_id ON announcements(organization_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_organization_id ON calendar_events(organization_id);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mass_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security Policies

-- Super Admin can access everything
CREATE POLICY "Super admins can do anything to organizations" 
ON organizations FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins can do anything to memberships" 
ON memberships FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'super_admin');

-- Organization access policies

-- Users can see active organizations
CREATE POLICY "Users can view active organizations" 
ON organizations FOR SELECT 
TO authenticated 
USING (status = 'active');

-- Members can view their organizations' details
CREATE POLICY "Members can view their organizations" 
ON organizations FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
  )
);

-- Organization admins can update their organization
CREATE POLICY "Organization admins can update their organization" 
ON organizations FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid() 
    AND role IN ('proboszcz', 'parish_admin')
  )
);

-- Membership access policies

-- Users can view memberships they belong to
CREATE POLICY "Users can view their own memberships" 
ON memberships FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Organization admins can view all memberships in their organization
CREATE POLICY "Organization admins can view all memberships in their organization" 
ON memberships FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships AS admin_membership
    WHERE admin_membership.organization_id = memberships.organization_id 
    AND admin_membership.user_id = auth.uid() 
    AND admin_membership.role IN ('proboszcz', 'parish_admin')
  )
);

-- Organization admins can manage memberships in their organization
CREATE POLICY "Organization admins can manage memberships in their organization" 
ON memberships FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships AS admin_membership
    WHERE admin_membership.organization_id = memberships.organization_id 
    AND admin_membership.user_id = auth.uid() 
    AND admin_membership.role IN ('proboszcz', 'parish_admin')
  )
);

-- Mass Intentions policies

-- Users can view mass intentions in organizations they belong to
CREATE POLICY "Users can view mass intentions in their organizations" 
ON mass_intentions FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.organization_id = mass_intentions.organization_id 
    AND memberships.user_id = auth.uid()
  )
);

-- Users can insert their own mass intentions
CREATE POLICY "Users can insert their own mass intentions" 
ON mass_intentions FOR INSERT 
TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Users can update/delete their own mass intentions
CREATE POLICY "Users can update/delete their own mass intentions" 
ON mass_intentions FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid());

-- Organization admins can manage all mass intentions in their organization
CREATE POLICY "Organization admins can manage all mass intentions in their organization" 
ON mass_intentions FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.organization_id = mass_intentions.organization_id 
    AND memberships.user_id = auth.uid() 
    AND memberships.role IN ('proboszcz', 'wikariusz', 'parish_admin')
  )
);

-- Similar policies for payments, candles, announcements, and calendar events
-- Payments policies
CREATE POLICY "Users can view their own payments" 
ON payments FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Organization admins can view all payments in their organization" 
ON payments FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.organization_id = payments.organization_id 
    AND memberships.user_id = auth.uid() 
    AND memberships.role IN ('proboszcz', 'parish_admin')
  )
);

-- Candles policies
CREATE POLICY "Anyone can view public candles" 
ON candles FOR SELECT 
TO authenticated 
USING (is_public = true);

CREATE POLICY "Users can view their own candles" 
ON candles FOR SELECT 
TO authenticated 
USING (created_by = auth.uid());

CREATE POLICY "Users can manage their own candles" 
ON candles FOR ALL 
TO authenticated 
USING (created_by = auth.uid());

CREATE POLICY "Organization members can view all candles in their organization" 
ON candles FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.organization_id = candles.organization_id 
    AND memberships.user_id = auth.uid()
  )
);

-- Announcements policies
CREATE POLICY "Anyone can view published announcements" 
ON announcements FOR SELECT 
TO authenticated 
USING (status = 'published');

CREATE POLICY "Organization admins can manage announcements in their organization" 
ON announcements FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.organization_id = announcements.organization_id 
    AND memberships.user_id = auth.uid() 
    AND memberships.role IN ('proboszcz', 'wikariusz', 'parish_admin')
  )
);

-- Calendar events policies
CREATE POLICY "Anyone can view public calendar events" 
ON calendar_events FOR SELECT 
TO authenticated 
USING (is_public = true);

CREATE POLICY "Organization members can view all calendar events in their organization" 
ON calendar_events FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.organization_id = calendar_events.organization_id 
    AND memberships.user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can manage calendar events in their organization" 
ON calendar_events FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.organization_id = calendar_events.organization_id 
    AND memberships.user_id = auth.uid() 
    AND memberships.role IN ('proboszcz', 'wikariusz', 'parish_admin')
  )
);
CREATE INDEX IF NOT EXISTS idx_mass_intentions_organization_id ON mass_intentions(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_organization_id ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_candles_organization_id ON candles(organization_id);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
-- Users can view organizations they are members of
CREATE POLICY "users_can_view_their_organizations" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- Only super admins can create organizations
CREATE POLICY "super_admins_can_manage_organizations" ON organizations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for memberships
-- Users can view their own memberships
CREATE POLICY "users_can_view_their_memberships" ON memberships
  FOR SELECT USING (user_id = auth.uid());

-- Organization admins can manage memberships for their organization
CREATE POLICY "admins_can_manage_organization_memberships" ON memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE user_id = auth.uid() 
      AND organization_id = memberships.organization_id
      AND (role = 'proboszcz' OR permissions->>'manage_members' = 'true')
    )
  );

-- Update RLS policies for tables with organization_id
-- Mass intentions are isolated by organization
CREATE POLICY "mass_intentions_organization_isolation" ON mass_intentions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Payments are isolated by organization
CREATE POLICY "payments_organization_isolation" ON payments
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Candles are isolated by organization
CREATE POLICY "candles_organization_isolation" ON candles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at when a record is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
