// detect-supabase-tables.js
const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Function to extract table names from Supabase .from() calls
function detectSupabaseTables() {
  console.log("Detecting Supabase tables...");

  // Find all TypeScript and JavaScript files
  const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
    ignore: ["node_modules/**", "dist/**", ".next/**", "tools/**"],
  });

  console.log(`Found ${files.length} files to scan.`);

  // Regular expression to match .from('table_name')
  const fromRegex = /\.from\(['"]([^'"]+)['"]\)/g;

  const tables = new Map();

  files.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf-8");
      let match;

      while ((match = fromRegex.exec(content)) !== null) {
        const tableName = match[1];

        if (!tables.has(tableName)) {
          tables.set(tableName, { name: tableName, files: [] });
        }

        const tableInfo = tables.get(tableName);
        if (!tableInfo.files.includes(file)) {
          tableInfo.files.push(file);
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  });

  console.log(`Detected ${tables.size} Supabase tables in the codebase.`);

  // Generate SQL for each table
  let sql = `-- Supabase Tables Detected in Codebase
-- Generated on ${new Date().toISOString()}

`;

  for (const [tableName, tableInfo] of tables.entries()) {
    sql += `-- Table: ${tableName}
-- Referenced in ${tableInfo.files.length} files
CREATE TABLE IF NOT EXISTS ${tableName} (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

`;
  }

  // Generate markdown report
  let markdown = `# Supabase Tables Report

Generated on: ${new Date().toLocaleDateString()}

## Tables Detected in Codebase

`;

  for (const [tableName, tableInfo] of tables.entries()) {
    markdown += `### ${tableName}\n\n`;
    markdown += `**Referenced in ${tableInfo.files.length} files:**\n\n`;

    tableInfo.files.forEach((file) => {
      markdown += `- \`${file}\`\n`;
    });

    markdown += "\n";
  }

  markdown += `## Summary\n\n`;
  markdown += `Total tables detected: ${tables.size}\n`;

  // Create directories if they don't exist
  if (!fs.existsSync("supabase/migrations")) {
    fs.mkdirSync("supabase/migrations", { recursive: true });
  }

  if (!fs.existsSync("docs")) {
    fs.mkdirSync("docs", { recursive: true });
  }

  // Write output files
  fs.writeFileSync(
    "supabase/migrations/00000000000000_detected_tables.sql",
    sql
  );
  fs.writeFileSync("docs/supabase-tables-report.md", markdown);

  console.log("Generated files:");
  console.log("- supabase/migrations/00000000000000_detected_tables.sql");
  console.log("- docs/supabase-tables-report.md");

  return Array.from(tables.values());
}

// Execute if run directly
if (require.main === module) {
  detectSupabaseTables();
}

module.exports = { detectSupabaseTables };
