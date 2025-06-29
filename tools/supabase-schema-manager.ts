import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { SchemaInfo, extractTablesFromCodebase } from "./schema-extractor";
import { generateTableUsageReport } from "./detect-table-usage";

/**
 * Automated Supabase Schema Management System
 *
 * This script:
 * 1. Extracts type definitions from the TypeScript code
 * 2. Detects actual table usage in the codebase
 * 3. Generates a comprehensive SQL migration file
 * 4. Creates documentation in Markdown format
 * 5. Offers a CLI to apply migrations to Supabase
 */

// Ensure directories exist
function ensureDirectoriesExist() {
  const dirs = ["./docs", "./supabase/migrations"];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Run Supabase CLI command
async function runSupabaseCommand(args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`Running: supabase ${args.join(" ")}`);

    const child = spawn("supabase", args, { stdio: "inherit" });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(
          `Command supabase ${args.join(" ")} completed successfully`
        );
        resolve(true);
      } else {
        console.error(
          `Command supabase ${args.join(" ")} failed with code ${code}`
        );
        resolve(false);
      }
    });
  });
}

// Apply migrations to local development
async function applyMigrations() {
  return runSupabaseCommand(["db", "reset"]);
}

// Push migrations to production
async function pushMigrations() {
  return runSupabaseCommand(["db", "push"]);
}

// Generate ERD diagram using Supabase CLI
async function generateERD() {
  return runSupabaseCommand(["db", "diagram"]);
}

// Main function
async function main() {
  console.log("Starting Supabase Schema Automation...");

  // Ensure directories exist
  ensureDirectoriesExist();

  // Step 1: Extract schema from TypeScript definitions
  console.log("\n--- Step 1: Extracting schema from TypeScript ---");
  extractTablesFromCodebase();

  // Step 2: Generate report of actual table usage
  console.log("\n--- Step 2: Analyzing actual table usage ---");
  generateTableUsageReport();

  // Ask user what to do next
  console.log("\n--- Schema generation complete ---");
  console.log("What would you like to do next?");
  console.log("1. Apply migrations to local development");
  console.log("2. Push migrations to production");
  console.log("3. Generate ERD diagram");
  console.log("4. Exit");

  // In a real implementation, you'd get user input here
  // For now, just exit
  console.log("\nExiting. You can run these commands manually:");
  console.log("- Apply migrations locally: `supabase db reset`");
  console.log("- Push to production: `supabase db push`");
  console.log("- Generate ERD: `supabase db diagram`");
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { applyMigrations, pushMigrations, generateERD };
