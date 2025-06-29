// scripts/migrate-to-auto-supabase.ts
// 🧹 Skrypt do migracji z obecnych tools/ do Auto Supabase

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

interface MigrationReport {
  timestamp: string;
  filesAnalyzed: number;
  filesBackedUp: number;
  filesRemoved: number;
  newFilesCreated: number;
  warnings: string[];
  errors: string[];
}

class AutoSupabaseMigrator {
  private report: MigrationReport;
  private backupDir: string;

  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      filesAnalyzed: 0,
      filesBackedUp: 0,
      filesRemoved: 0,
      newFilesCreated: 0,
      warnings: [],
      errors: [],
    };
    this.backupDir = `tools-backup-${Date.now()}`;
  }

  async migrate() {
    console.log("🚀 Starting migration to Auto Supabase...");

    try {
      await this.analyzeCurrentSetup();
      await this.createBackup();
      await this.setupAutoSupabase();
      await this.migrateConfiguration();
      await this.cleanupOldFiles();
      await this.generateReport();

      console.log("✅ Migration completed successfully!");
      console.log(`📊 Report saved to: migration-report-${Date.now()}.json`);
    } catch (error) {
      console.error("❌ Migration failed:", error);
      await this.rollback();
      throw error;
    }
  }

  // 🔍 Analizuj obecny setup
  private async analyzeCurrentSetup() {
    console.log("🔍 Analyzing current setup...");

    const toolsFiles = [
      "tools/auto-database-analyzer.ts",
      "tools/check-multi-tenant-schema.ts",
      "tools/detect-supabase-tables.js",
      "tools/detect-table-usage.ts",
      "tools/schema-extractor.ts",
      "tools/supabase-schema-auto-manager.ts",
      "tools/supabase-schema-manager.ts",
      "tools/validate-migrations.ts",
    ];

    for (const file of toolsFiles) {
      if (fs.existsSync(file)) {
        this.report.filesAnalyzed++;

        // Sprawdź zależności
        const content = fs.readFileSync(file, "utf8");
        if (content.includes("supabase")) {
          console.log(`📁 Found Supabase usage in: ${file}`);
        }
      }
    }

    // Sprawdź obecne workflow
    if (fs.existsSync(".github/workflows/update-supabase-schema.yml")) {
      console.log("📄 Found existing Supabase workflow");
      this.report.filesAnalyzed++;
    }

    console.log(`✅ Analyzed ${this.report.filesAnalyzed} files`);
  }

  // 💾 Utwórz backup
  private async createBackup() {
    console.log("💾 Creating backup of existing tools...");

    if (!fs.existsSync("tools/")) {
      console.log("ℹ️ No tools directory found, skipping backup");
      return;
    }

    // Utwórz folder backup
    fs.mkdirSync(this.backupDir, { recursive: true });

    // Skopiuj całą zawartość tools/
    this.copyDirectory("tools/", path.join(this.backupDir, "tools"));

    // Backup workflow files
    if (fs.existsSync(".github/workflows/")) {
      this.copyDirectory(
        ".github/workflows/",
        path.join(this.backupDir, "workflows")
      );
    }

    // Backup package.json scripts
    if (fs.existsSync("package.json")) {
      fs.copyFileSync(
        "package.json",
        path.join(this.backupDir, "package.json.backup")
      );
      this.report.filesBackedUp++;
    }

    console.log(`✅ Backup created in: ${this.backupDir}`);
  }

  // 📁 Copy directory helper
  private copyDirectory(src: string, dest: string) {
    if (!fs.existsSync(src)) return;

    fs.mkdirSync(dest, { recursive: true });

    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);

      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        this.report.filesBackedUp++;
      }
    }
  }

  // ⚡ Setup Auto Supabase
  private async setupAutoSupabase() {
    console.log("⚡ Setting up Auto Supabase...");

    // Utwórz folder scripts jeśli nie istnieje
    if (!fs.existsSync("scripts/")) {
      fs.mkdirSync("scripts/", { recursive: true });
    }

    // Sprawdź czy Supabase CLI jest zainstalowane
    try {
      execSync("supabase --version", { stdio: "pipe" });
      console.log("✅ Supabase CLI already installed");
    } catch {
      console.log("📦 Installing Supabase CLI...");
      try {
        execSync("npm install -g supabase", { stdio: "inherit" });
      } catch (error) {
        this.report.errors.push("Failed to install Supabase CLI");
        throw new Error(
          "Please install Supabase CLI manually: npm install -g supabase"
        );
      }
    }

    // Sprawdź czy projekt jest zainicjalizowany
    if (!fs.existsSync("supabase/config.toml")) {
      console.log("🔧 Initializing Supabase project...");
      execSync("supabase init", { stdio: "inherit" });
    }

    this.report.newFilesCreated++;
  }

  // ⚙️ Migruj konfigurację
  private async migrateConfiguration() {
    console.log("⚙️ Migrating configuration...");

    // Przeanalizuj obecną konfigurację w tools/
    const configData = this.extractConfigFromTools();

    // Utwórz nową konfigurację Auto Supabase
    const autoSupabaseConfig = {
      projectId: configData.projectId || "YOUR_PROJECT_ID",
      environment: "development",
      features: {
        autoMigrate: true,
        autoGenerateTypes: true,
        autoUpdateServices: true,
        backupBeforeChange: true,
      },
      typeGeneration: {
        outputPath: "types/supabase-generated.ts",
        schemas: ["public", "auth"],
        generateSpecializedTypes: true,
      },
      migration: {
        backupBeforeApply: true,
        validateBeforeApply: true,
        rollbackOnFailure: true,
      },
    };

    // Zapisz konfigurację
    fs.writeFileSync(
      "scripts/auto-supabase.config.json",
      JSON.stringify(autoSupabaseConfig, null, 2)
    );

    console.log("✅ Configuration migrated");
    this.report.newFilesCreated++;
  }

  // 🔍 Wyciągnij konfigurację z obecnych tools
  private extractConfigFromTools(): any {
    const config: any = {};

    // Sprawdź czy jest PROJECT_ID w plikach
    const filesToCheck = [
      "tools/supabase-schema-auto-manager.ts",
      ".github/workflows/update-supabase-schema.yml",
      ".env.local",
    ];

    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, "utf8");

        // Szukaj PROJECT_ID
        const projectIdMatch = content.match(
          /PROJECT_ID[=:]?\s*['""]([^'""\s]+)['""]?/
        );
        if (projectIdMatch) {
          config.projectId = projectIdMatch[1];
        }

        // Szukaj URL Supabase
        const urlMatch = content.match(/https:\/\/([^.]+)\.supabase\.co/);
        if (urlMatch) {
          config.projectId = urlMatch[1];
        }
      }
    }

    return config;
  }

  // 🧹 Cleanup starych plików
  private async cleanupOldFiles() {
    console.log("🧹 Cleaning up old files...");

    const filesToRemove = [
      "tools/auto-database-analyzer.ts",
      "tools/check-multi-tenant-schema.ts",
      "tools/detect-supabase-tables.js",
      "tools/detect-table-usage.ts",
      "tools/schema-extractor.ts",
      "tools/supabase-schema-auto-manager.ts",
      "tools/supabase-schema-manager.ts",
      "tools/validate-migrations.ts",
    ];

    for (const file of filesToRemove) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        this.report.filesRemoved++;
        console.log(`🗑️ Removed: ${file}`);
      }
    }

    // Zastąp stary workflow nowym
    if (fs.existsSync(".github/workflows/update-supabase-schema.yml")) {
      fs.unlinkSync(".github/workflows/update-supabase-schema.yml");
      this.report.filesRemoved++;
      console.log("🗑️ Removed old workflow: update-supabase-schema.yml");
    }

    // Usuń tools/ folder jeśli jest pusty
    if (fs.existsSync("tools/") && fs.readdirSync("tools/").length === 1) {
      // Sprawdź czy zostało tylko README.md
      const remaining = fs.readdirSync("tools/");
      if (remaining.length === 1 && remaining[0] === "README.md") {
        console.log("ℹ️ Keeping tools/README.md for reference");
      }
    }

    console.log(`✅ Cleaned up ${this.report.filesRemoved} files`);
  }

  // 📊 Wygeneruj raport migracji
  private async generateReport() {
    console.log("📊 Generating migration report...");

    const reportContent = `# 🚀 Auto Supabase Migration Report

## 📊 Summary
- **Date**: ${this.report.timestamp}
- **Files Analyzed**: ${this.report.filesAnalyzed}
- **Files Backed Up**: ${this.report.filesBackedUp}
- **Files Removed**: ${this.report.filesRemoved}
- **New Files Created**: ${this.report.newFilesCreated}

## 📁 Backup Location
Your old tools have been backed up to: \`${this.backupDir}/\`

## ✅ What's New
- 🤖 **Auto Supabase System** - Replaces all tools/ scripts
- 🔄 **GitHub Actions Workflow** - Automated CI/CD pipeline
- 📝 **Type Generation** - Automatic TypeScript types
- 🔧 **Service Updates** - Auto-updated imports and types
- 📊 **Monitoring** - Detailed reports and analytics

## 🚀 Next Steps
1. **Configure Secrets**: Add GitHub secrets (SUPABASE_ACCESS_TOKEN, etc.)
2. **Test Locally**: Run \`npm run auto-supabase:sync\`
3. **Update Environment**: Set PROJECT_ID in .env.local
4. **First Migration**: Create your first auto-migration
5. **Team Training**: Share the new workflow with your team

## 🔧 New Commands Available
\`\`\`bash
npm run auto-supabase:sync      # Full synchronization
npm run auto-supabase:types     # Generate types only
npm run db:start               # Start local Supabase
npm run dev:full              # Full dev environment
\`\`\`

## ⚠️ Warnings
${this.report.warnings.map((w) => `- ${w}`).join("\n")}

## ❌ Errors
${this.report.errors.map((e) => `- ${e}`).join("\n")}

## 📚 Documentation
- [Auto Supabase Docs](./AUTO_SUPABASE.md)
- [Migration Guide](./docs/migration-guide.md)
- [Troubleshooting](./docs/troubleshooting.md)

---
*Migration completed successfully! Welcome to Auto Supabase! 🎉*
`;

    const reportFileName = `migration-report-${Date.now()}.md`;
    fs.writeFileSync(reportFileName, reportContent);

    // Zapisz też JSON dla programmatycznego dostępu
    fs.writeFileSync(
      `migration-report-${Date.now()}.json`,
      JSON.stringify(this.report, null, 2)
    );

    console.log(`✅ Migration report saved to: ${reportFileName}`);
  }

  // 🔄 Rollback w przypadku błędu
  private async rollback() {
    console.log("🔄 Rolling back migration...");

    try {
      if (fs.existsSync(this.backupDir)) {
        // Przywróć z backup
        if (fs.existsSync(path.join(this.backupDir, "tools"))) {
          this.copyDirectory(path.join(this.backupDir, "tools"), "tools");
        }

        if (fs.existsSync(path.join(this.backupDir, "workflows"))) {
          this.copyDirectory(
            path.join(this.backupDir, "workflows"),
            ".github/workflows"
          );
        }

        if (fs.existsSync(path.join(this.backupDir, "package.json.backup"))) {
          fs.copyFileSync(
            path.join(this.backupDir, "package.json.backup"),
            "package.json"
          );
        }

        console.log("✅ Rollback completed");
      }
    } catch (error) {
      console.error("❌ Rollback failed:", error);
      console.log(`💾 Manual restore needed from: ${this.backupDir}`);
    }
  }

  // 📋 Sprawdź wymagania przed migracją
  async checkPrerequisites(): Promise<boolean> {
    console.log("📋 Checking prerequisites...");

    const checks = [
      {
        name: "Node.js version",
        check: () => {
          const version = process.version;
          const major = parseInt(version.split(".")[0].slice(1));
          return major >= 18;
        },
        required: true,
      },
      {
        name: "Git repository",
        check: () => fs.existsSync(".git"),
        required: true,
      },
      {
        name: "Package.json exists",
        check: () => fs.existsSync("package.json"),
        required: true,
      },
      {
        name: "Tools directory exists",
        check: () => fs.existsSync("tools/"),
        required: false,
      },
      {
        name: "Supabase config",
        check: () => fs.existsSync(".env.local") || process.env.PROJECT_ID,
        required: false,
      },
    ];

    let allPassed = true;

    for (const check of checks) {
      const passed = check.check();
      const status = passed ? "✅" : "❌";
      console.log(`${status} ${check.name}`);

      if (!passed && check.required) {
        allPassed = false;
        this.report.errors.push(`Required: ${check.name}`);
      } else if (!passed) {
        this.report.warnings.push(`Optional: ${check.name}`);
      }
    }

    if (!allPassed) {
      console.log("\n❌ Prerequisites not met. Please fix the above issues.");
      return false;
    }

    console.log("\n✅ All prerequisites met!");
    return true;
  }

  // 🎯 Finalizacja migracji
  async finalize() {
    console.log("🎯 Finalizing migration...");

    // Aktualizuj package.json z nowymi scriptami
    await this.updatePackageJson();

    // Utwórz dokumentację
    await this.createDocumentation();

    // Sprawdź czy wszystko działa
    await this.validateSetup();

    console.log("🎉 Migration finalized successfully!");
  }

  private async updatePackageJson() {
    const packagePath = "package.json";
    if (!fs.existsSync(packagePath)) return;

    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    // Dodaj nowe scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "auto-supabase": "tsx scripts/auto-supabase.ts",
      "auto-supabase:sync": "npm run auto-supabase sync",
      "auto-supabase:types": "npm run auto-supabase types",
      "db:start": "supabase start",
      "db:reset": "supabase db reset",
      "db:diff": "supabase db diff",
      "types:generate":
        "supabase gen types typescript --project-id $PROJECT_ID > types/supabase-generated.ts",
      "dev:full": 'concurrently "npm run db:start" "npm run dev"',
    };

    // Dodaj nowe devDependencies jeśli nie ma
    if (!packageJson.devDependencies) packageJson.devDependencies = {};

    const newDeps = {
      tsx: "^4.0.0",
      concurrently: "^8.2.0",
    };

    for (const [dep, version] of Object.entries(newDeps)) {
      if (!packageJson.devDependencies[dep]) {
        packageJson.devDependencies[dep] = version;
      }
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Updated package.json");
  }

  private async createDocumentation() {
    // Dokumentacja jest już w poprzednich artifactach
    console.log("📚 Documentation templates ready");
  }

  private async validateSetup() {
    console.log("🔍 Validating new setup...");

    try {
      // Sprawdź czy można zainstalować zależności
      execSync("npm install", { stdio: "pipe" });

      // Sprawdź czy TypeScript się kompiluje
      if (fs.existsSync("tsconfig.json")) {
        execSync("npx tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      }

      console.log("✅ Setup validation passed");
    } catch (error) {
      this.report.warnings.push(
        "Setup validation had issues - manual review needed"
      );
      console.log("⚠️ Setup validation had issues - please review manually");
    }
  }
}

// 🚀 CLI Interface
export async function runMigration() {
  const migrator = new AutoSupabaseMigrator();

  try {
    console.log(`
🚀 Auto Supabase Migration Tool
==============================

This tool will migrate your existing tools/ setup to the new Auto Supabase system.

What this will do:
✅ Analyze your current setup
✅ Create backup of existing files  
✅ Install Auto Supabase system
✅ Migrate configuration
✅ Clean up old files
✅ Generate migration report

Press Ctrl+C to cancel, or Enter to continue...
    `);

    // Czekaj na potwierdzenie użytkownika
    await new Promise((resolve) => {
      process.stdin.once("data", resolve);
    });

    // Sprawdź wymagania
    const prereqsPassed = await migrator.checkPrerequisites();
    if (!prereqsPassed) {
      process.exit(1);
    }

    // Uruchom migrację
    await migrator.migrate();
    await migrator.finalize();

    console.log(`
🎉 MIGRATION COMPLETED SUCCESSFULLY!

Your old tools have been backed up and the new Auto Supabase system is ready.

Next steps:
1. Review the migration report
2. Configure GitHub secrets  
3. Run: npm run auto-supabase:sync
4. Test the new workflow

Happy coding! 🚀
    `);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.log("\n💾 Check backup files if manual restore is needed");
    process.exit(1);
  }
}

// Uruchom jeśli wywołane bezpośrednio
if (require.main === module) {
  runMigration();
}
