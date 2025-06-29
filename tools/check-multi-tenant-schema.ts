// check-multi-tenant-schema.ts
// Script to verify and recommend multi-tenant schema additions

import * as fs from "fs";
import * as path from "path";

interface MissingTable {
  name: string;
  description: string;
  columns: { name: string; type: string; description: string }[];
  relationships: { table: string; column: string; description: string }[];
}

// Define expected multi-tenant tables
const expectedTables: MissingTable[] = [
  {
    name: "organizations",
    description:
      "Represents parishes or other tenant organizations in the system",
    columns: [
      {
        name: "id",
        type: "UUID PRIMARY KEY DEFAULT uuid_generate_v4()",
        description: "Unique identifier",
      },
      { name: "name", type: "TEXT NOT NULL", description: "Organization name" },
      {
        name: "slug",
        type: "TEXT UNIQUE NOT NULL",
        description: "URL-friendly name for subdomains",
      },
      {
        name: "custom_domain",
        type: "TEXT UNIQUE",
        description: "Optional custom domain",
      },
      {
        name: "status",
        type: "TEXT DEFAULT 'pending'",
        description: "Status (pending, active, suspended)",
      },
      {
        name: "plan",
        type: "TEXT DEFAULT 'basic'",
        description: "Subscription plan",
      },
      {
        name: "created_at",
        type: "TIMESTAMPTZ DEFAULT NOW()",
        description: "Creation timestamp",
      },
      {
        name: "settings",
        type: "JSONB DEFAULT '{}'",
        description: "Organization settings",
      },
    ],
    relationships: [],
  },
  {
    name: "memberships",
    description: "Links users to organizations with specific roles",
    columns: [
      {
        name: "id",
        type: "UUID PRIMARY KEY DEFAULT uuid_generate_v4()",
        description: "Unique identifier",
      },
      {
        name: "user_id",
        type: "UUID REFERENCES users(id) ON DELETE CASCADE",
        description: "Reference to user",
      },
      {
        name: "organization_id",
        type: "UUID REFERENCES organizations(id) ON DELETE CASCADE",
        description: "Reference to organization",
      },
      {
        name: "role",
        type: "TEXT NOT NULL",
        description: "Role in organization (proboszcz, wikariusz, etc.)",
      },
      {
        name: "permissions",
        type: "JSONB DEFAULT '{}'",
        description: "Custom permissions",
      },
      {
        name: "created_at",
        type: "TIMESTAMPTZ DEFAULT NOW()",
        description: "Creation timestamp",
      },
    ],
    relationships: [
      {
        table: "users",
        column: "id",
        description: "User who belongs to organization",
      },
      {
        table: "organizations",
        column: "id",
        description: "Organization the user belongs to",
      },
    ],
  },
];

// Tables that should have organization_id column for multi-tenancy
const tablesThatNeedOrganizationId = [
  {
    name: "mass_intentions",
    description: "Mass intentions should be linked to an organization (parish)",
  },
  {
    name: "payments",
    description: "Payments should be linked to an organization for reporting",
  },
  {
    name: "candles",
    description: "Candles should be linked to an organization",
  },
];

// Function to check for missing tables
function checkMissingTables(schemaFile: string): MissingTable[] {
  const missingTables: MissingTable[] = [];

  for (const table of expectedTables) {
    if (!schemaFile.includes(`CREATE TABLE IF NOT EXISTS ${table.name}`)) {
      missingTables.push(table);
    }
  }

  return missingTables;
}

// Function to check for missing organization_id in tables
function checkMissingOrganizationId(schemaFile: string): string[] {
  const missingOrgId: string[] = [];

  for (const table of tablesThatNeedOrganizationId) {
    if (
      schemaFile.includes(`CREATE TABLE IF NOT EXISTS ${table.name}`) &&
      !schemaFile.includes(`${table.name} (`) &&
      !schemaFile.includes(`organization_id UUID`)
    ) {
      missingOrgId.push(table.name);
    }
  }

  return missingOrgId;
}

// Function to generate SQL for missing tables
function generateMissingTableSQL(table: MissingTable): string {
  let sql = `-- ${table.description}\n`;
  sql += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;

  const columnDefinitions = table.columns.map((col) => {
    return `  ${col.name} ${col.type} -- ${col.description}`;
  });

  if (table.name === "memberships") {
    columnDefinitions.push("  UNIQUE(user_id, organization_id)");
  }

  sql += columnDefinitions.join(",\n");
  sql += "\n);\n\n";

  // Add indexes
  sql += `-- Indexes for ${table.name}\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_${table.name}_id ON ${table.name} (id);\n`;

  if (table.name === "memberships") {
    sql += `CREATE INDEX IF NOT EXISTS idx_${table.name}_user_id ON ${table.name} (user_id);\n`;
    sql += `CREATE INDEX IF NOT EXISTS idx_${table.name}_organization_id ON ${table.name} (organization_id);\n`;
  }

  // Enable RLS
  sql += `\n-- Enable RLS on ${table.name}\n`;
  sql += `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n`;

  // Add basic RLS policies
  if (table.name === "organizations") {
    sql += `\n-- RLS policies for ${table.name}\n`;
    sql += `CREATE POLICY "${table.name}_users_can_view_their_orgs" ON ${table.name}\n`;
    sql += `  FOR SELECT USING (\n`;
    sql += `    id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())\n`;
    sql += `  );\n`;
  } else if (table.name === "memberships") {
    sql += `\n-- RLS policies for ${table.name}\n`;
    sql += `CREATE POLICY "${table.name}_users_can_view_their_memberships" ON ${table.name}\n`;
    sql += `  FOR SELECT USING (user_id = auth.uid());\n`;
  }

  return sql;
}

// Function to generate SQL for adding organization_id to existing tables
function generateAddOrganizationIdSQL(tableName: string): string {
  let sql = `-- Add organization_id to ${tableName} for multi-tenancy\n`;
  sql += `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_${tableName}_organization_id ON ${tableName} (organization_id);\n\n`;

  // Add RLS policy for organization isolation
  sql += `-- Update RLS policy for ${tableName} to include organization isolation\n`;
  sql += `CREATE POLICY "${tableName}_org_isolation" ON ${tableName}\n`;
  sql += `  FOR ALL USING (\n`;
  sql += `    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())\n`;
  sql += `  );\n\n`;

  return sql;
}

// Main function
function checkMultiTenantSchema() {
  console.log("Checking for multi-tenant schema elements...");

  try {
    const schemaPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "00000000000000_oremus_schema.sql"
    );
    if (!fs.existsSync(schemaPath)) {
      console.error("Schema file not found: " + schemaPath);
      return;
    }

    const schemaFile = fs.readFileSync(schemaPath, "utf-8");
    const missingTables = checkMissingTables(schemaFile);
    const missingOrgId = checkMissingOrganizationId(schemaFile);

    // Generate report file
    let report = "# Multi-Tenant Schema Analysis\n\n";
    report += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    // Add missing tables section
    report += "## Missing Multi-Tenant Tables\n\n";
    if (missingTables.length === 0) {
      report += "✅ All required multi-tenant tables are present.\n\n";
    } else {
      report += `⚠️ Missing ${missingTables.length} required tables for multi-tenancy:\n\n`;
      missingTables.forEach((table) => {
        report += `### ${table.name}\n\n`;
        report += `${table.description}\n\n`;
      });
    }

    // Add missing organization_id section
    report += "## Tables Needing organization_id\n\n";
    if (missingOrgId.length === 0) {
      report +=
        "✅ All relevant tables have organization_id for multi-tenancy.\n\n";
    } else {
      report += `⚠️ ${missingOrgId.length} tables need organization_id for multi-tenancy:\n\n`;
      missingOrgId.forEach((table) => {
        const tableInfo = tablesThatNeedOrganizationId.find(
          (t) => t.name === table
        );
        report += `- **${table}**: ${
          tableInfo?.description || "Should be linked to an organization"
        }\n`;
      });
      report += "\n";
    }

    // Add SQL to implement multi-tenancy if needed
    if (missingTables.length > 0 || missingOrgId.length > 0) {
      report += "## SQL to Implement Multi-Tenancy\n\n";
      report += "```sql\n";

      // Add missing tables
      missingTables.forEach((table) => {
        report += generateMissingTableSQL(table);
      });

      // Add organization_id to existing tables
      missingOrgId.forEach((table) => {
        report += generateAddOrganizationIdSQL(table);
      });

      report += "```\n";
    }

    // Save report
    const reportPath = path.join(
      process.cwd(),
      "docs",
      "multi-tenant-analysis.md"
    );
    fs.writeFileSync(reportPath, report);

    console.log(`Generated report at docs/multi-tenant-analysis.md`);
    console.log(`Missing tables: ${missingTables.length}`);
    console.log(`Tables needing organization_id: ${missingOrgId.length}`);
  } catch (error) {
    console.error("Error analyzing schema:", error);
  }
}

// Run when executed directly
if (require.main === module) {
  checkMultiTenantSchema();
}

export { checkMultiTenantSchema };
