import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";

interface TableUsage {
  table: string;
  operations: string[];
  files: string[];
}

function findSupabaseTableUsage(): TableUsage[] {
  const tableUsages: Map<string, TableUsage> = new Map();

  // Find all .ts, .tsx, and .js files in the project
  const files = glob.sync("**/*.{ts,tsx,js}", {
    ignore: ["node_modules/**", "dist/**", ".next/**"],
  });

  // Regular expressions to detect Supabase operations
  const fromRegex = /\.from\(['"]([\w_]+)['"]\)/g;
  const insertRegex = /\.from\(['"]([\w_]+)['"]\)\.insert/g;
  const selectRegex = /\.from\(['"]([\w_]+)['"]\)\.select/g;
  const updateRegex = /\.from\(['"]([\w_]+)['"]\)\.update/g;
  const deleteRegex = /\.from\(['"]([\w_]+)['"]\)\.delete/g;

  files.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf-8");

      // Extract table names from .from() calls
      let match;
      while ((match = fromRegex.exec(content)) !== null) {
        const tableName = match[1];
        if (!tableUsages.has(tableName)) {
          tableUsages.set(tableName, {
            table: tableName,
            operations: [],
            files: [],
          });
        }

        const usage = tableUsages.get(tableName)!;
        if (!usage.files.includes(file)) {
          usage.files.push(file);
        }
      }

      // Check for insert operations
      let insertMatch;
      while ((insertMatch = insertRegex.exec(content)) !== null) {
        const tableName = insertMatch[1];
        if (!tableUsages.has(tableName)) {
          tableUsages.set(tableName, {
            table: tableName,
            operations: [],
            files: [],
          });
        }

        const usage = tableUsages.get(tableName)!;
        if (!usage.operations.includes("insert")) {
          usage.operations.push("insert");
        }
      }

      // Check for select operations
      let selectMatch;
      while ((selectMatch = selectRegex.exec(content)) !== null) {
        const tableName = selectMatch[1];
        if (!tableUsages.has(tableName)) {
          tableUsages.set(tableName, {
            table: tableName,
            operations: [],
            files: [],
          });
        }

        const usage = tableUsages.get(tableName)!;
        if (!usage.operations.includes("select")) {
          usage.operations.push("select");
        }
      }

      // Check for update operations
      let updateMatch;
      while ((updateMatch = updateRegex.exec(content)) !== null) {
        const tableName = updateMatch[1];
        if (!tableUsages.has(tableName)) {
          tableUsages.set(tableName, {
            table: tableName,
            operations: [],
            files: [],
          });
        }

        const usage = tableUsages.get(tableName)!;
        if (!usage.operations.includes("update")) {
          usage.operations.push("update");
        }
      }

      // Check for delete operations
      let deleteMatch;
      while ((deleteMatch = deleteRegex.exec(content)) !== null) {
        const tableName = deleteMatch[1];
        if (!tableUsages.has(tableName)) {
          tableUsages.set(tableName, {
            table: tableName,
            operations: [],
            files: [],
          });
        }

        const usage = tableUsages.get(tableName)!;
        if (!usage.operations.includes("delete")) {
          usage.operations.push("delete");
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  });

  return Array.from(tableUsages.values());
}

function generateTableUsageReport() {
  console.log("Analyzing Supabase table usage...");
  const tableUsages = findSupabaseTableUsage();

  const markdownReport = `# Supabase Table Usage Report

Generated on: ${new Date().toLocaleDateString()}

## Tables Used in Codebase

${tableUsages
  .map(
    (usage) => `
### ${usage.table}

**Operations:** ${
      usage.operations.length > 0 ? usage.operations.join(", ") : "read-only"
    }

**Files:**
${usage.files.map((file) => `- \`${file}\``).join("\n")}
`
  )
  .join("\n")}

## Summary

Total tables detected: ${tableUsages.length}
`;

  fs.writeFileSync("docs/supabase-usage-report.md", markdownReport);
  console.log(
    `Generated report at docs/supabase-usage-report.md with ${tableUsages.length} tables`
  );

  return tableUsages;
}

// Run when executed directly
if (require.main === module) {
  generateTableUsageReport();
}

export { findSupabaseTableUsage, generateTableUsageReport };
