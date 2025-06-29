-- Migration for transitioning from single-tenant to multi-tenant model
-- This migration helps migrate existing data to the new multi-tenant architecture

-- First, create a default organization for existing data
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Create default organization if it doesn't exist
  INSERT INTO organizations (name, slug, status, plan)
  VALUES ('Oremus Default Parish', 'default', 'active', 'enterprise')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO default_org_id;
  
  -- If we didn't get an ID (due to ON CONFLICT), select it
  IF default_org_id IS NULL THEN
    SELECT id INTO default_org_id FROM organizations WHERE slug = 'default';
  END IF;
  
  -- Migrate existing parishes to organizations if needed
  INSERT INTO organizations (id, name, slug, status, plan, created_at, updated_at)
  SELECT 
    p.id, 
    p.name, 
    LOWER(REGEXP_REPLACE(p.name, '[^a-zA-Z0-9]', '-', 'g')), -- Convert name to slug
    'active', 
    'basic',
    p.created_at,
    p.updated_at
  FROM parishes p
  LEFT JOIN organizations o ON o.id = p.id
  WHERE o.id IS NULL;
  
  -- Migrate existing users to memberships
  INSERT INTO memberships (user_id, organization_id, role, created_at, updated_at)
  SELECT 
    u.id, 
    COALESCE(u.parish_id, default_org_id), 
    CASE 
      WHEN u.role = 'admin' THEN 'proboszcz'
      WHEN u.role = 'priest' THEN 'wikariusz'
      WHEN u.role = 'parish_admin' THEN 'parish_admin'
      ELSE 'user'
    END,
    u.created_at,
    u.updated_at
  FROM users u
  LEFT JOIN memberships m ON m.user_id = u.id AND m.organization_id = COALESCE(u.parish_id, default_org_id)
  WHERE m.id IS NULL;
  
  -- Update existing tables with organization_id where it's NULL
  
  -- Mass intentions
  UPDATE mass_intentions
  SET organization_id = COALESCE(
    (SELECT parish_id FROM users WHERE id = mass_intentions.created_by),
    default_org_id
  )
  WHERE organization_id IS NULL;
  
  -- Payments
  UPDATE payments
  SET organization_id = COALESCE(
    (SELECT parish_id FROM users WHERE id = payments.user_id),
    default_org_id
  )
  WHERE organization_id IS NULL;
  
  -- Candles
  UPDATE candles
  SET organization_id = COALESCE(
    (SELECT parish_id FROM users WHERE id = candles.created_by),
    default_org_id
  )
  WHERE organization_id IS NULL;
  
  -- Announcements
  UPDATE announcements
  SET organization_id = COALESCE(
    (SELECT parish_id FROM users WHERE id = announcements.created_by),
    default_org_id
  )
  WHERE organization_id IS NULL;
  
  -- Calendar events
  UPDATE calendar_events
  SET organization_id = COALESCE(
    (SELECT parish_id FROM users WHERE id = calendar_events.created_by),
    default_org_id
  )
  WHERE organization_id IS NULL;
  
  -- Now make organization_id NOT NULL on all these tables
  ALTER TABLE mass_intentions ALTER COLUMN organization_id SET NOT NULL;
  ALTER TABLE payments ALTER COLUMN organization_id SET NOT NULL;
  ALTER TABLE candles ALTER COLUMN organization_id SET NOT NULL;
  ALTER TABLE announcements ALTER COLUMN organization_id SET NOT NULL;
  ALTER TABLE calendar_events ALTER COLUMN organization_id SET NOT NULL;
  
  RAISE NOTICE 'Migration to multi-tenant model complete. Default organization ID: %', default_org_id;
END $$;
