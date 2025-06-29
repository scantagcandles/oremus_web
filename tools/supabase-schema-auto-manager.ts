// tools/supabase-schema-auto-manager.ts
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import chokidar from "chokidar";
import { DatabaseAnalyzer } from "./auto-database-analyzer";

const execAsync = promisify(exec);

export interface SchemaChangeEvent {
  type:
    | "table_added"
    | "table_removed"
    | "column_added"
    | "column_removed"
    | "relationship_added";
  tableName: string;
  details: any;
  timestamp: Date;
  sourceFile: string;
}

export class SupabaseSchemaManager {
  private analyzer: DatabaseAnalyzer;
  private projectRoot: string;
  private supabaseUrl: string;
  private supabaseKey: string;
  private watcher?: chokidar.FSWatcher;
  private isWatching = false;
  private pendingChanges: SchemaChangeEvent[] = [];

  constructor(
    projectRoot: string = process.cwd(),
    supabaseUrl?: string,
    supabaseKey?: string
  ) {
    this.projectRoot = projectRoot;
    this.analyzer = new DatabaseAnalyzer(projectRoot);
    this.supabaseUrl =
      supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    this.supabaseKey =
      supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  }

  // Automatyczne uruchomienie pełnej analizy i deployment
  async deployCompleteSchema(): Promise<void> {
    console.log("🚀 Deploying complete OREMUS schema to Supabase...");

    try {
      // 1. Analizuj projekt
      const tables = await this.analyzer.analyzeProject();

      // 2. Generuj SQL
      const migrationSQL = this.analyzer.generateMigrationSQL(tables);

      // 3. Zapisz migrację
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const migrationFile = path.join(
        this.projectRoot,
        "supabase",
        "migrations",
        `${timestamp}_auto_generated.sql`
      );

      // Ensure migrations directory exists
      const migrationDir = path.dirname(migrationFile);
      if (!fs.existsSync(migrationDir)) {
        fs.mkdirSync(migrationDir, { recursive: true });
      }

      fs.writeFileSync(migrationFile, migrationSQL);
      console.log(`📄 Migration saved: ${migrationFile}`);

      // 4. Deploy do Supabase
      await this.deployToSupabase(migrationFile);

      // 5. Generate TypeScript types
      await this.generateTypes();

      console.log("✅ Schema deployed successfully!");
    } catch (error) {
      console.error("❌ Schema deployment failed:", error);
      throw error;
    }
  }

  // Deployment migracji do Supabase
  private async deployToSupabase(migrationFile: string): Promise<void> {
    console.log("📤 Deploying to Supabase...");

    try {
      // Check if Supabase CLI is available
      await execAsync("supabase --version");

      // Run migration
      const { stdout, stderr } = await execAsync("supabase db push", {
        cwd: this.projectRoot,
      });

      if (stderr && !stderr.includes("successfully")) {
        console.warn("⚠️ Supabase deployment warnings:", stderr);
      }

      console.log("✅ Migration deployed to Supabase");
    } catch (error) {
      console.error("❌ Supabase deployment failed:", error);

      // Fallback: try to execute SQL directly via REST API
      console.log("🔄 Attempting direct SQL execution...");
      await this.executeSQLDirectly(fs.readFileSync(migrationFile, "utf-8"));
    }
  }

  // Bezpośrednie wykonanie SQL przez REST API
  private async executeSQLDirectly(sql: string): Promise<void> {
    const statements = sql.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (!statement.trim()) continue;

      try {
        const response = await fetch(
          `${this.supabaseUrl}/rest/v1/rpc/exec_sql`,
          {
            method: "POST",
            headers: {
              apikey: this.supabaseKey,
              Authorization: `Bearer ${this.supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sql: statement.trim() }),
          }
        );

        if (!response.ok) {
          console.warn(
            `⚠️ Failed to execute: ${statement.substring(0, 50)}...`
          );
        }
      } catch (error) {
        console.warn(`⚠️ SQL execution error: ${error}`);
      }
    }
  }

  // Generowanie TypeScript types
  private async generateTypes(): Promise<void> {
    console.log("🔧 Generating TypeScript types...");

    try {
      const { stdout } = await execAsync(
        "supabase gen types typescript --local",
        {
          cwd: this.projectRoot,
        }
      );

      const typesFile = path.join(
        this.projectRoot,
        "types",
        "supabase-generated.ts"
      );
      fs.writeFileSync(typesFile, stdout);

      console.log(`✅ Types generated: ${typesFile}`);
    } catch (error) {
      console.warn("⚠️ Failed to generate types:", error);
    }
  }

  // Watcher do monitorowania zmian w kodzie
  startWatching(): void {
    if (this.isWatching) {
      console.log("👀 Already watching for changes");
      return;
    }

    console.log("👀 Starting file watcher for automatic schema updates...");

    const watchPaths = [
      "types/**/*.ts",
      "services/**/*.ts",
      "hooks/**/*.ts",
      "components/**/*.tsx",
      "app/**/*.tsx",
      "lib/**/*.ts",
    ];

    this.watcher = chokidar.watch(watchPaths, {
      cwd: this.projectRoot,
      ignored: ["node_modules", ".git", "dist", "build"],
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher
      .on("change", (filePath) => this.handleFileChange(filePath))
      .on("add", (filePath) => this.handleFileChange(filePath))
      .on("unlink", (filePath) => this.handleFileRemoval(filePath));

    this.isWatching = true;
    console.log("✅ File watcher started");
  }

  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.isWatching = false;
      console.log("⏹️ File watcher stopped");
    }
  }

  private async handleFileChange(filePath: string): Promise<void> {
    console.log(`📝 File changed: ${filePath}`);

    // Debounce changes
    setTimeout(async () => {
      await this.analyzeAndUpdateSchema(filePath);
    }, 1000);
  }

  private async handleFileRemoval(filePath: string): Promise<void> {
    console.log(`🗑️ File removed: ${filePath}`);
    // Handle file removal logic if needed
  }

  private async analyzeAndUpdateSchema(changedFile: string): Promise<void> {
    try {
      console.log("🔍 Analyzing schema changes...");

      // Get current schema
      const currentTables = await this.analyzer.analyzeProject();

      // Compare with previous schema (if exists)
      const changes = await this.detectChanges(currentTables, changedFile);

      if (changes.length > 0) {
        console.log(`📊 Detected ${changes.length} schema changes`);

        // Generate incremental migration
        const migrationSQL = this.generateIncrementalMigration(changes);

        if (migrationSQL) {
          // Save and deploy migration
          await this.deployIncrementalChange(migrationSQL, changedFile);
        }
      }
    } catch (error) {
      console.error("❌ Schema analysis failed:", error);
    }
  }

  private async detectChanges(
    currentTables: any[],
    changedFile: string
  ): Promise<SchemaChangeEvent[]> {
    // Load previous schema if exists
    const schemaFile = path.join(
      this.projectRoot,
      "database",
      "database_schema.json"
    );

    if (!fs.existsSync(schemaFile)) {
      // First run - no changes to detect
      await this.saveSchemSnapshot(currentTables);
      return [];
    }

    const previousSchema = JSON.parse(fs.readFileSync(schemaFile, "utf-8"));
    const previousTables = previousSchema.tables || [];

    const changes: SchemaChangeEvent[] = [];

    // Detect new tables
    const previousTableNames = new Set(previousTables.map((t: any) => t.name));
    const currentTableNames = new Set(currentTables.map((t) => t.name));

    for (const table of currentTables) {
      if (!previousTableNames.has(table.name)) {
        changes.push({
          type: "table_added",
          tableName: table.name,
          details: table,
          timestamp: new Date(),
          sourceFile: changedFile,
        });
      }
    }

    // Detect removed tables
    for (const table of previousTables) {
      if (!currentTableNames.has(table.name)) {
        changes.push({
          type: "table_removed",
          tableName: table.name,
          details: table,
          timestamp: new Date(),
          sourceFile: changedFile,
        });
      }
    }

    // Detect column changes
    for (const currentTable of currentTables) {
      const previousTable = previousTables.find(
        (t: any) => t.name === currentTable.name
      );
      if (previousTable) {
        const changes_in_table = this.detectColumnChanges(
          previousTable,
          currentTable,
          changedFile
        );
        changes.push(...changes_in_table);
      }
    }

    // Save updated schema
    await this.saveSchemSnapshot(currentTables);

    return changes;
  }

  private detectColumnChanges(
    previousTable: any,
    currentTable: any,
    sourceFile: string
  ): SchemaChangeEvent[] {
    const changes: SchemaChangeEvent[] = [];

    const previousColumns = new Set(
      previousTable.columns?.map((c: any) => c.name) || []
    );
    const currentColumns = new Set(
      currentTable.columns?.map((c: any) => c.name) || []
    );

    // New columns
    for (const column of currentTable.columns || []) {
      if (!previousColumns.has(column.name)) {
        changes.push({
          type: "column_added",
          tableName: currentTable.name,
          details: { column },
          timestamp: new Date(),
          sourceFile,
        });
      }
    }

    // Removed columns
    for (const column of previousTable.columns || []) {
      if (!currentColumns.has(column.name)) {
        changes.push({
          type: "column_removed",
          tableName: currentTable.name,
          details: { column },
          timestamp: new Date(),
          sourceFile,
        });
      }
    }

    return changes;
  }

  private generateIncrementalMigration(
    changes: SchemaChangeEvent[]
  ): string | null {
    const sql: string[] = [];

    sql.push("-- Incremental migration");
    sql.push(`-- Generated: ${new Date().toISOString()}`);
    sql.push("");

    for (const change of changes) {
      switch (change.type) {
        case "table_added":
          sql.push(`-- Add table: ${change.tableName}`);
          sql.push(this.analyzer.generateCreateTableSQL(change.details));
          sql.push("");
          break;

        case "table_removed":
          sql.push(`-- Remove table: ${change.tableName}`);
          sql.push(`DROP TABLE IF EXISTS ${change.tableName} CASCADE;`);
          sql.push("");
          break;

        case "column_added":
          sql.push(
            `-- Add column: ${change.tableName}.${change.details.column.name}`
          );
          const col = change.details.column;
          const nullable = col.nullable ? "" : "NOT NULL";
          const defaultVal = col.default ? `DEFAULT ${col.default}` : "";
          sql.push(
            `ALTER TABLE ${change.tableName} ADD COLUMN ${
              col.name
            } ${col.type.toUpperCase()} ${nullable} ${defaultVal};`
          );
          sql.push("");
          break;

        case "column_removed":
          sql.push(
            `-- Remove column: ${change.tableName}.${change.details.column.name}`
          );
          sql.push(
            `ALTER TABLE ${change.tableName} DROP COLUMN IF EXISTS ${change.details.column.name};`
          );
          sql.push("");
          break;
      }
    }

    return sql.length > 3 ? sql.join("\n") : null;
  }

  private async deployIncrementalChange(
    migrationSQL: string,
    sourceFile: string
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const migrationFile = path.join(
      this.projectRoot,
      "supabase",
      "migrations",
      `${timestamp}_incremental_from_${path.basename(sourceFile)}.sql`
    );

    fs.writeFileSync(migrationFile, migrationSQL);
    console.log(`📄 Incremental migration: ${migrationFile}`);

    // Deploy
    await this.deployToSupabase(migrationFile);
  }

  private async saveSchemSnapshot(tables: any[]): Promise<void> {
    const schemaFile = path.join(
      this.projectRoot,
      "database",
      "database_schema.json"
    );
    const schemaDir = path.dirname(schemaFile);

    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir, { recursive: true });
    }

    const snapshot = {
      generated: new Date().toISOString(),
      tables: tables,
    };

    fs.writeFileSync(schemaFile, JSON.stringify(snapshot, null, 2));
  }

  // Backup i restore
  async createBackup(): Promise<string> {
    console.log("💾 Creating database backup...");

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = path.join(
        this.projectRoot,
        "backups",
        `backup_${timestamp}.sql`
      );

      const backupDir = path.dirname(backupFile);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Use Supabase CLI to create backup
      const { stdout } = await execAsync("supabase db dump --local", {
        cwd: this.projectRoot,
      });

      fs.writeFileSync(backupFile, stdout);
      console.log(`✅ Backup created: ${backupFile}`);

      return backupFile;
    } catch (error) {
      console.error("❌ Backup failed:", error);
      throw error;
    }
  }

  async restoreFromBackup(backupFile: string): Promise<void> {
    console.log(`🔄 Restoring from backup: ${backupFile}`);

    try {
      await execAsync(`supabase db reset --local`, {
        cwd: this.projectRoot,
      });

      console.log("✅ Database restored from backup");
    } catch (error) {
      console.error("❌ Restore failed:", error);
      throw error;
    }
  }

  // Validation schematu
  async validateSchema(): Promise<boolean> {
    console.log("🔍 Validating database schema...");

    try {
      // Check if all expected tables exist
      const tables = await this.analyzer.analyzeProject();
      const missingTables = this.analyzer.detectMissingTables(tables);

      if (missingTables.length > 0) {
        console.warn("⚠️ Missing tables detected:");
        missingTables.forEach((table) => {
          console.warn(`   - ${table.name}: ${table.reason}`);
        });
        return false;
      }

      // Check relationships integrity
      for (const table of tables) {
        for (const rel of table.relationships) {
          const referencedTableExists = tables.some(
            (t) => t.name === rel.referencedTable
          );
          if (!referencedTableExists) {
            console.warn(
              `⚠️ Invalid relationship: ${table.name}.${rel.column} → ${rel.referencedTable}.${rel.referencedColumn}`
            );
            return false;
          }
        }
      }

      console.log("✅ Schema validation passed");
      return true;
    } catch (error) {
      console.error("❌ Schema validation failed:", error);
      return false;
    }
  }

  // Status i monitoring
  getStatus(): object {
    return {
      isWatching: this.isWatching,
      pendingChanges: this.pendingChanges.length,
      lastChange:
        this.pendingChanges[this.pendingChanges.length - 1]?.timestamp,
      supabaseConnected: !!this.supabaseUrl && !!this.supabaseKey,
    };
  }
}

// CLI Commands
export async function createCompleteSchema(): Promise<void> {
  const manager = new SupabaseSchemaManager();
  await manager.deployCompleteSchema();
}

export async function startSchemaWatcher(): Promise<void> {
  const manager = new SupabaseSchemaManager();

  // Deploy initial schema
  await manager.deployCompleteSchema();

  // Start watching
  manager.startWatching();

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping schema watcher...");
    manager.stopWatching();
    process.exit(0);
  });

  console.log("👀 Schema watcher running. Press Ctrl+C to stop.");
}

export async function validateCurrentSchema(): Promise<void> {
  const manager = new SupabaseSchemaManager();
  const isValid = await manager.validateSchema();

  if (!isValid) {
    console.error("❌ Schema validation failed");
    process.exit(1);
  }

  console.log("✅ Schema is valid");
}

// Package.json scripts helper
export const scripts = {
  "db:analyze": "ts-node tools/supabase-schema-auto-manager.ts analyze",
  "db:deploy": "ts-node tools/supabase-schema-auto-manager.ts deploy",
  "db:watch": "ts-node tools/supabase-schema-auto-manager.ts watch",
  "db:validate": "ts-node tools/supabase-schema-auto-manager.ts validate",
  "db:backup": "ts-node tools/supabase-schema-auto-manager.ts backup",
};

// Main CLI handler
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case "analyze":
      createCompleteSchema().catch(console.error);
      break;
    case "deploy":
      createCompleteSchema().catch(console.error);
      break;
    case "watch":
      startSchemaWatcher().catch(console.error);
      break;
    case "validate":
      validateCurrentSchema().catch(console.error);
      break;
    default:
      console.log("Usage: npm run db:[analyze|deploy|watch|validate]");
  }
}
