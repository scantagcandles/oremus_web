# Supabase Schema Management

This documentation explains how Oremus maintains and validates the Supabase database schema.

## Overview

The Oremus application uses [Supabase](https://supabase.io/) as its backend database service. To ensure database schema consistency, we've implemented an automated system for:

1. Extracting schema definitions from TypeScript code
2. Detecting table usage across the codebase
3. Validating migrations for potential issues
4. Ensuring multi-tenant architecture compliance
5. Generating comprehensive documentation and diagrams

## Schema Management Workflow

### Automatic Updates via GitHub Actions

A GitHub Action workflow (`update-supabase-schema.yml`) runs whenever:

- Changes are made to TypeScript files that might affect the database schema
- The workflow is manually triggered

The workflow:

1. Extracts table definitions from TypeScript types
2. Generates a report of table usage in the codebase
3. Validates that all tables follow multi-tenant architecture patterns
4. Checks migrations for potential data loss or issues
5. Lints SQL files
6. Generates an ERD diagram
7. Commits any changes back to the repository

### Local Development Workflow

For local development, use the following npm scripts:

```bash
# Extract schema from TypeScript types
npm run db:schema:extract

# Detect table usage in codebase
npm run db:schema:detect

# Check multi-tenant schema compliance
npm run db:check-multi-tenant

# Validate migrations for potential issues
npm run db:validate-migrations

# Generate ERD diagram
npm run db:erd

# Run the full validation process (PowerShell)
pwsh tools/validate-and-update-migrations.ps1
```

## Multi-Tenant Architecture

Oremus uses a multi-tenant architecture where:

1. Organizations (parishes) are the primary tenant entities
2. Users are linked to organizations through memberships
3. Most data tables include an `organization_id` column to isolate tenant data
4. Row Level Security (RLS) policies enforce data isolation

### Core Multi-Tenant Tables

#### Organizations

The `organizations` table represents parishes or other tenant organizations in the system:

```sql
CREATE TABLE organizations (
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
```

#### Memberships

The `memberships` table links users to organizations with specific roles:

```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'proboszcz', 'wikariusz', 'rezydent', 'kapelan'
  permissions JSONB DEFAULT '{}'::jsonb, -- Granular permissions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);
```

### Required Structure for Multi-Tenancy

All tables (except system tables and organization-related tables) should:

1. Include an `organization_id UUID REFERENCES organizations(id)` column
2. Have an index on the `organization_id` column for performance
3. Enable Row Level Security (RLS)
4. Have RLS policies that filter by `organization_id`

Example of a properly structured multi-tenant table:

```sql
CREATE TABLE example_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_example_table_organization_id ON example_table(organization_id);

-- Enable RLS
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- Add organization isolation policy
CREATE POLICY "example_table_org_isolation" ON example_table
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );
```

### Roles and Permissions

#### Standard Roles

- **proboszcz**: Parish administrator with full access to parish data
- **wikariusz**: Associate priest with limited administrative access
- **rezydent**: Resident priest with very limited access
- **kapelan**: Chaplain with specialized access
- **parish_admin**: Non-priest administrative staff with specific permissions

#### Custom Permissions

Custom permissions can be set in the `permissions` JSONB field of the `memberships` table:

```json
{
  "manage_members": true,
  "manage_finances": true,
  "manage_masses": true,
  "manage_candles": false,
  "manage_announcements": true,
  "view_analytics": true,
  "manage_settings": false
}
```

### Access Control Flow

1. User accesses the application via:

   - Main domain (app.oremus.pl)
   - Subdomain ([parish-slug].oremus.pl)
   - Custom domain

2. Middleware:

   - Identifies the organization context from the domain
   - Sets the organization ID in request headers
   - Checks user membership in the organization

3. Data access:
   - RLS policies filter data based on organization_id
   - Additional policies may filter based on user role or permissions

## Migration Validation

Our migration validation tool (`tools/validate-migrations.ts`) checks for:

1. Potentially dangerous operations that could cause data loss
2. Missing Row Level Security on tables
3. Tables missing `organization_id` for multi-tenancy

Any issues are reported in `docs/migration-validation-report.md`.

## Super Admin Access

Super admins (specified in user.role = 'super_admin') bypass RLS restrictions to access all organizations. This is implemented in RLS policies:

```sql
CREATE POLICY "super_admins_can_do_anything"
  ON example_table
  USING (
    auth.jwt() ->> 'role' = 'super_admin'
  );
```

## Best Practices

When making database schema changes:

1. Always run `npm run db:validate-migrations` before committing changes
2. Add `organization_id` to any new tables (unless they're system or organization-related)
3. Enable Row Level Security for all tables
4. Create appropriate RLS policies based on the multi-tenant architecture
5. Use `IF EXISTS` when dropping tables or columns to ensure idempotence
6. Be cautious with operations that could potentially cause data loss
7. Add foreign key constraints to maintain data integrity
8. Document any significant schema changes in migration files with comments

## Related Files

- **Database Schema**: `supabase/migrations/20250621000001_multi_tenant_schema.sql`
- **Migration Helper**: `supabase/migrations/20250621000002_migrate_to_multi_tenant.sql`
- **TypeScript Types**: `types/multi-tenant.ts`
- **Organization Service**: `services/organizationService.ts`
- **React Hook**: `hooks/useTenant.tsx`
- **Server Helpers**: `lib/multi-tenant.ts`
- **Middleware**: `middleware.ts`
- **Validation Tools**:
  - `tools/check-multi-tenant-schema.ts`
  - `tools/validate-migrations.ts`
  - `tools/schema-extractor.ts`
  - `tools/validate-and-update-migrations.ps1`

## Troubleshooting

If you encounter issues with the schema validation process:

1. Make sure your TypeScript types match the actual database schema
2. Check that table names in TypeScript match the actual table names in Supabase
3. Verify that all tables have the necessary multi-tenant columns and constraints
4. Review any warnings in the migration validation report
5. For RLS policy issues, test with different user roles to ensure proper isolation
6. If middleware issues occur, check domain routing and organization context
