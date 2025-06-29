// scripts/auto-supabase.ts
// 🤖 Lokalny skrypt pomocniczy dla Auto Supabase

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface AutoSupabaseConfig {
  projectId: string;
  environment: "development" | "staging" | "production";
  features: {
    autoMigrate: boolean;
    autoGenerateTypes: boolean;
    autoUpdateServices: boolean;
    backupBeforeChange: boolean;
  };
}

class AutoSupabaseManager {
  private config: AutoSupabaseConfig;

  constructor(config: AutoSupabaseConfig) {
    this.config = config;
  }

  // 🚀 Uruchom pełną synchronizację
  async fullSync() {
    console.log("🚀 Starting Auto Supabase Full Sync...");

    try {
      await this.checkEnvironment();
      await this.generateMigration();
      await this.validateMigrations();
      await this.generateTypes();
      await this.updateServices();

      console.log("✅ Auto Supabase sync completed successfully!");
    } catch (error) {
      console.error("❌ Auto Supabase sync failed:", error);
      process.exit(1);
    }
  }

  // 🔍 Sprawdź środowisko
  private async checkEnvironment() {
    console.log("🔍 Checking environment...");

    // Sprawdź czy Supabase CLI jest zainstalowane
    try {
      execSync("supabase --version", { stdio: "pipe" });
    } catch {
      throw new Error(
        "Supabase CLI is not installed. Run: npm install -g supabase"
      );
    }

    // Sprawdź czy projekt jest połączony
    try {
      execSync("supabase status", { stdio: "pipe" });
    } catch {
      console.log("🔗 Linking to Supabase project...");
      execSync(`supabase link --project-ref ${this.config.projectId}`);
    }

    console.log("✅ Environment check passed");
  }

  // 📝 Wygeneruj migrację z lokalnych zmian
  private async generateMigration() {
    if (!this.config.features.autoMigrate) return;

    console.log("📝 Generating migration from local changes...");

    try {
      // Sprawdź czy są lokalne zmiany w bazie
      const diff = execSync("supabase db diff --use-migra", {
        encoding: "utf8",
      });

      if (diff.trim()) {
        const timestamp = new Date()
          .toISOString()
          .replace(/[:-]/g, "")
          .slice(0, 15);
        const filename = `${timestamp}_auto_generated_changes.sql`;

        execSync(`supabase db diff --use-migra -f ${filename}`);
        console.log(`📄 Generated migration: ${filename}`);
      } else {
        console.log("ℹ️ No schema changes detected");
      }
    } catch (error) {
      console.warn("⚠️ Could not generate migration:", error);
    }
  }

  // ✅ Waliduj migracje
  private async validateMigrations() {
    console.log("✅ Validating migrations...");

    try {
      execSync("supabase db reset", { stdio: "inherit" });
      console.log("✅ Migrations validated successfully");
    } catch (error) {
      throw new Error(`Migration validation failed: ${error}`);
    }
  }

  // 📝 Generuj typy TypeScript
  private async generateTypes() {
    if (!this.config.features.autoGenerateTypes) return;

    console.log("📝 Generating TypeScript types...");

    try {
      // Wygeneruj główne typy
      execSync(
        `supabase gen types typescript --project-id ${this.config.projectId} > types/supabase-generated.ts`,
        { stdio: "inherit" }
      );

      // Wygeneruj wyspecjalizowane typy
      await this.generateSpecializedTypes();

      console.log("✅ Types generated successfully");
    } catch (error) {
      throw new Error(`Type generation failed: ${error}`);
    }
  }

  // 🔧 Generuj wyspecjalizowane typy
  private async generateSpecializedTypes() {
    const typesDir = "types/generated";

    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    // Typy dla Mass Intentions
    const massTypes = `import { Database } from '../supabase-generated'

export type MassIntention = Database['public']['Tables']['mass_intentions']['Row']
export type MassIntentionInsert = Database['public']['Tables']['mass_intentions']['Insert']
export type MassIntentionUpdate = Database['public']['Tables']['mass_intentions']['Update']

export type Parish = Database['public']['Tables']['parishes']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

// Helper types
export type MassIntentionWithParish = MassIntention & {
  parish: Parish
}

export type MassIntentionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
`;

    // Typy dla Payment System
    const paymentTypes = `import { Database } from '../supabase-generated'

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'card' | 'bank_transfer' | 'blik' | 'apple_pay' | 'google_pay'

// Stripe integration types
export interface StripePaymentIntent {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  client_secret: string
}
`;

    // Typy dla Academy
    const academyTypes = `import { Database } from '../supabase-generated'

export type Course = Database['public']['Tables']['courses']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']

export type CourseWithLessons = Course & {
  lessons: Lesson[]
}

export type UserProgressWithCourse = UserProgress & {
  course: Course
}

export type CourseStatus = 'draft' | 'published' | 'archived'
export type LessonType = 'video' | 'text' | 'quiz' | 'interactive'
`;

    // Zapisz pliki
    fs.writeFileSync(path.join(typesDir, "mass-types.ts"), massTypes);
    fs.writeFileSync(path.join(typesDir, "payment-types.ts"), paymentTypes);
    fs.writeFileSync(path.join(typesDir, "academy-types.ts"), academyTypes);

    // Wygeneruj index file
    const indexFile = `// Auto-generated type exports
export * from './mass-types'
export * from './payment-types'
export * from './academy-types'
`;
    fs.writeFileSync(path.join(typesDir, "index.ts"), indexFile);
  }

  // 🔧 Aktualizuj serwisy
  private async updateServices() {
    if (!this.config.features.autoUpdateServices) return;

    console.log("🔧 Updating services with new types...");

    try {
      // Znajdź pliki do aktualizacji
      const servicesToUpdate = this.findFilesWithSupabaseTypes();

      for (const file of servicesToUpdate) {
        await this.updateFileImports(file);
      }

      // Sprawdź czy TypeScript się kompiluje
      execSync("npx tsc --noEmit --skipLibCheck", { stdio: "inherit" });

      console.log("✅ Services updated successfully");
    } catch (error) {
      console.warn("⚠️ Service update had issues:", error);
    }
  }

  // 🔍 Znajdź pliki używające typów Supabase
  private findFilesWithSupabaseTypes(): string[] {
    const files: string[] = [];

    const searchPatterns = [
      "services/**/*.ts",
      "components/**/*.ts",
      "components/**/*.tsx",
      "hooks/**/*.ts",
      "lib/**/*.ts",
    ];

    for (const pattern of searchPatterns) {
      try {
        const result = execSync(`grep -l "Database\\|supabase" ${pattern}`, {
          encoding: "utf8",
        });
        files.push(
          ...result
            .trim()
            .split("\n")
            .filter((f) => f)
        );
      } catch {
        // Ignoruj błędy - mogą nie być pliki pasujące do wzorca
      }
    }

    return [...new Set(files)]; // Usuń duplikaty
  }

  // 📝 Aktualizuj importy w pliku
  private async updateFileImports(filePath: string) {
    try {
      let content = fs.readFileSync(filePath, "utf8");

      // Aktualizuj ścieżki importów
      content = content.replace(
        /from ['"]\.\.\/.*supabase-generated['"]/g,
        "from '@/types/supabase-generated'"
      );

      // Dodaj importy wyspecjalizowanych typów jeśli potrzebne
      if (filePath.includes("mass") || filePath.includes("intention")) {
        if (!content.includes("@/types/generated/mass-types")) {
          content = `import type { MassIntention, Parish } from '@/types/generated/mass-types'\n${content}`;
        }
      }

      if (filePath.includes("payment")) {
        if (!content.includes("@/types/generated/payment-types")) {
          content = `import type { Payment, PaymentStatus } from '@/types/generated/payment-types'\n${content}`;
        }
      }

      fs.writeFileSync(filePath, content);
    } catch (error) {
      console.warn(`⚠️ Could not update ${filePath}:`, error);
    }
  }

  // 📊 Wygeneruj raport
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      projectId: this.config.projectId,
      environment: this.config.environment,
      features: this.config.features,
      migrations: this.getMigrationFiles(),
      types: this.getTypeFiles(),
      services: this.findFilesWithSupabaseTypes(),
    };

    fs.writeFileSync(
      "auto-supabase-report.json",
      JSON.stringify(report, null, 2)
    );
    console.log("📊 Report generated: auto-supabase-report.json");
  }

  private getMigrationFiles(): string[] {
    try {
      return fs
        .readdirSync("supabase/migrations")
        .filter((f) => f.endsWith(".sql"));
    } catch {
      return [];
    }
  }

  private getTypeFiles(): string[] {
    try {
      const files = ["types/supabase-generated.ts"];
      if (fs.existsSync("types/generated")) {
        files.push(
          ...fs
            .readdirSync("types/generated")
            .map((f) => `types/generated/${f}`)
        );
      }
      return files;
    } catch {
      return [];
    }
  }
}

// 🚀 CLI Interface
export async function runAutoSupabase() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  // Wczytaj konfigurację
  const config: AutoSupabaseConfig = {
    projectId: process.env.PROJECT_ID || "your-project-id",
    environment: (process.env.NODE_ENV as any) || "development",
    features: {
      autoMigrate: true,
      autoGenerateTypes: true,
      autoUpdateServices: true,
      backupBeforeChange: true,
    },
  };

  const manager = new AutoSupabaseManager(config);

  switch (command) {
    case "sync":
      await manager.fullSync();
      break;
    case "types":
      await manager.generateTypes();
      break;
    case "services":
      await manager.updateServices();
      break;
    case "report":
      await manager.generateReport();
      break;
    case "help":
      console.log(`
🤖 Auto Supabase Manager

Commands:
  sync     - Full synchronization (migrations + types + services)
  types    - Generate TypeScript types only
  services - Update services with new types only
  report   - Generate status report
  help     - Show this help

Environment Variables:
  PROJECT_ID - Your Supabase project ID
  NODE_ENV   - Environment (development/staging/production)

Examples:
  npm run auto-supabase sync
  npm run auto-supabase types
  npm run auto-supabase report
      `);
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

// Uruchom jeśli wywołane bezpośrednio
if (require.main === module) {
  runAutoSupabase().catch((error) => {
    console.error("❌ Auto Supabase failed:", error);
    process.exit(1);
  });
}
