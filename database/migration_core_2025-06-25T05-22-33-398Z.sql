-- OREMUS Complete Database Schema
-- Generated from project analysis
-- Generated at: 2025-06-25T05:22:33.412Z
-- Total tables: 3

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CORE TABLES

-- Table: organizations (core)
-- Source files: project-analysis, multi-tenant.ts, organizationService.ts
CREATE TABLE organizations (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  plan TEXT NOT NULL DEFAULT 'basic',
  contact_email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  nip TEXT,
  regon TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  branding JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE organizations IS 'Category: core. Sources: project-analysis, multi-tenant.ts, organizationService.ts';

-- Table: memberships (core)
-- Source files: project-analysis, multi-tenant.ts
CREATE TABLE memberships (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  invited_by UUID,
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE memberships IS 'Category: core. Sources: project-analysis, multi-tenant.ts';

-- Table: churches (core)
-- Source files: project-analysis, church.ts, mass.ts, MassService.ts
CREATE TABLE churches (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'Poland',
  latitude DECIMAL,
  longitude DECIMAL,
  phone TEXT,
  email TEXT,
  website TEXT,
  masses_schedule JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE churches IS 'Category: core. Sources: project-analysis, church.ts, mass.ts, MassService.ts';

-- FOREIGN KEY CONSTRAINTS

ALTER TABLE memberships ADD CONSTRAINT fk_memberships_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE memberships ADD CONSTRAINT fk_memberships_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE memberships ADD CONSTRAINT fk_memberships_invited_by
  FOREIGN KEY (invited_by) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE churches ADD CONSTRAINT fk_churches_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

-- INDEXES

ALTER TABLE organizations ADD PRIMARY KEY (id);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);

ALTER TABLE memberships ADD PRIMARY KEY (id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX idx_memberships_invited_by ON memberships(invited_by);
CREATE INDEX idx_memberships_created_at ON memberships(created_at);
CREATE INDEX idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);

ALTER TABLE churches ADD PRIMARY KEY (id);
CREATE INDEX idx_churches_organization_id ON churches(organization_id);
CREATE INDEX idx_churches_created_at ON churches(created_at);
CREATE INDEX idx_churches_organization_id ON churches(organization_id);

-- ROW LEVEL SECURITY

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations" ON organizations

  FOR SELECT USING (id IN (

    SELECT organization_id FROM memberships WHERE user_id = auth.uid()

  ));

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memberships" ON memberships

  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access organization data" ON churches

  FOR ALL USING (

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

-- TRIGGERS

-- Function to automatically update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_organizations
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_churches
  BEFORE UPDATE ON churches
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
