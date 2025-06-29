// validate-migrations.ts
// Script to validate migrations and check for potential data loss risks

import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import chalk from "chalk";

interface MigrationIssue {
  type: "error" | "warning";
  message: string;
  file: string;
  line?: number;
}

// Patterns that might cause data loss or problems
const DANGEROUS_PATTERNS = [
  {
    pattern: /DROP\s+TABLE(?!\s+IF\s+EXISTS)/i,
    message:
      "Dropping a table without IF EXISTS could fail if table doesn't exist",
    type: "error" as const,
  },
  {
    pattern: /ALTER\s+TABLE\s+\w+\s+DROP\s+COLUMN(?!\s+IF\s+EXISTS)/i,
    message:
      "Dropping a column without IF EXISTS could fail if column doesn't exist",
    type: "error" as const,
  },
  {
    pattern: /ALTER\s+TABLE\s+\w+\s+ALTER\s+COLUMN\s+\w+\s+SET\s+NOT\s+NULL/i,
    message:
      "Setting column to NOT NULL might fail if table contains NULL values",
    type: "warning" as const,
  },
  {
    pattern: /ALTER\s+TABLE\s+\w+\s+ADD\s+CONSTRAINT.*\s+UNIQUE/i,
    message: "Adding UNIQUE constraint might fail if duplicate values exist",
    type: "warning" as const,
  },
  {
    pattern: /TRUNCATE\s+TABLE/i,
    message: "TRUNCATE TABLE will delete all data from the table",
    type: "error" as const,
  },
  {
    pattern: /DELETE\s+FROM\s+\w+(?!\s+WHERE)/i,
    message: "DELETE without WHERE clause will delete all data from table",
    type: "error" as const,
  },
  {
    pattern:
      /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(\w+)(?!.*organization_id)(?!.*\borganizations\b|\bmemberships\b|\busers\b|\bmigrations\b|\bcountries\b|\bcurrencies\b|\blanguages\b)/i,
    message:
      "Creating a table without organization_id column for multi-tenancy",
    type: "warning" as const,
  },
  {
    pattern:
      /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(\w+)(?!.*ENABLE\s+ROW\s+LEVEL\s+SECURITY)/i,
    message: "Creating a table without enabling Row Level Security",
    type: "warning" as const,
  },
];

// Check migrations for dangerous patterns
function validateMigrations(): MigrationIssue[] {
  const issues: MigrationIssue[] = [];
  const migrationFiles = glob.sync("supabase/migrations/*.sql");

  migrationFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith("--")) {
        return;
      }

      DANGEROUS_PATTERNS.forEach((pattern) => {
        if (pattern.pattern.test(line)) {
          issues.push({
            type: pattern.type,
            message: pattern.message,
            file: file,
            line: index + 1,
          });
        }
      });
    });
  });

  return issues;
}

// Check that tables have row level security policies
function checkRowLevelSecurity(): MigrationIssue[] {
  const issues: MigrationIssue[] = [];
  const migrationFiles = glob.sync("supabase/migrations/*.sql");
  const tablePattern = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(\w+)/i;
  const rlsPattern = /ALTER\s+TABLE\s+(\w+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i;

  const tables = new Set<string>();
  const tablesWithRLS = new Set<string>();

  migrationFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line) => {
      // Skip comments
      if (line.trim().startsWith("--")) {
        return;
      }

      const tableMatch = tablePattern.exec(line);
      if (tableMatch) {
        tables.add(tableMatch[1].toLowerCase());
      }

      const rlsMatch = rlsPattern.exec(line);
      if (rlsMatch) {
        tablesWithRLS.add(rlsMatch[1].toLowerCase());
      }
    });
  });

  // Check which tables don't have RLS enabled
  tables.forEach((table) => {
    if (!tablesWithRLS.has(table)) {
      issues.push({
        type: "warning",
        message: `Table "${table}" does not have Row Level Security enabled`,
        file: "multiple-files",
      });
    }
  });

  return issues;
}

// Check that tables have organization_id for multi-tenancy
function checkMultiTenancy(): MigrationIssue[] {
  const issues: MigrationIssue[] = [];
  const exemptTables = [
    "organizations",
    "memberships",
    "migrations",
    "schema_version",
    "users", // users are linked through memberships
  ];

  const migrationFiles = glob.sync("supabase/migrations/*.sql");
  const tablePattern = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(\w+)/i;
  const columnPattern = /organization_id\s+UUID/i;

  const tables = new Map<string, { file: string; hasOrgId: boolean }>();

  migrationFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");

    // Find all tables
    const tableMatches = content.match(new RegExp(tablePattern, "g"));
    if (tableMatches) {
      tableMatches.forEach((match) => {
        const tableName = tablePattern.exec(match)![1].toLowerCase();
        if (!exemptTables.includes(tableName)) {
          tables.set(tableName, { file, hasOrgId: false });
        }
      });
    }

    // Check for organization_id column
    tables.forEach((value, tableName) => {
      if (content.includes(`${tableName}`) && columnPattern.test(content)) {
        tables.set(tableName, { ...value, hasOrgId: true });
      }
    });
  });

  // Check which tables don't have organization_id
  tables.forEach((value, tableName) => {
    if (!value.hasOrgId) {
      issues.push({
        type: "warning",
        message: `Table "${tableName}" does not have organization_id column for multi-tenancy`,
        file: value.file,
      });
    }
  });

  return issues;
}

// Main execution function
function main() {
  const migrationIssues = validateMigrations();
  const rlsIssues = checkRowLevelSecurity();
  const multiTenancyIssues = checkMultiTenancy();

  const allIssues = [...migrationIssues, ...rlsIssues, ...multiTenancyIssues];

  // Count errors and warnings
  const errors = allIssues.filter((issue) => issue.type === "error").length;
  const warnings = allIssues.filter((issue) => issue.type === "warning").length;

  // Print issues
  console.log(chalk.bold("\n=== Supabase Migration Validation ===\n"));

  if (allIssues.length === 0) {
    console.log(chalk.green("✓ No issues found in migrations!"));
  } else {
    allIssues.forEach((issue) => {
      const prefix =
        issue.type === "error" ? chalk.red("ERROR") : chalk.yellow("WARNING");

      const location = issue.line ? `${issue.file}:${issue.line}` : issue.file;

      console.log(`${prefix}: ${chalk.cyan(location)} - ${issue.message}`);
    });

    console.log(
      chalk.bold(
        `\nFound ${errors} errors and ${warnings} warnings in migrations.`
      )
    );

    // Exit with error code if there are errors
    if (errors > 0) {
      console.log(chalk.red("\nPlease fix the errors before continuing."));
      process.exit(1);
    }
  }

  // Generate a report file
  const reportContent = `# Migration Validation Report
Generated on: ${new Date().toISOString()}

## Summary
- Errors: ${errors}
- Warnings: ${warnings}

## Details
${allIssues
  .map((issue) => {
    const location = issue.line ? `${issue.file}:${issue.line}` : issue.file;
    return `- [${issue.type.toUpperCase()}] ${location} - ${issue.message}`;
  })
  .join("\n")}
`;

  fs.writeFileSync("docs/migration-validation-report.md", reportContent);
  console.log(
    chalk.green("\nReport saved to docs/migration-validation-report.md")
  );
}

// Run the script
main();
