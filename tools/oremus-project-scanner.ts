// tools/oremus-project-scanner.ts
import fs from "fs";
import path from "path";
import { DatabaseAnalyzer } from "./auto-database-analyzer";

interface OremusTable {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    default?: string;
    unique?: boolean;
    references?: string;
  }>;
  relationships: Array<{
    column: string;
    referencedTable: string;
    referencedColumn: string;
    onDelete?: string;
  }>;
  sourceFiles: string[];
  category: "core" | "auth" | "business" | "content" | "analytics" | "system";
}

export class OremusProjectScanner {
  private projectRoot: string;
  private detectedTables: Map<string, OremusTable> = new Map();

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async scanProject(): Promise<OremusTable[]> {
    console.log("🔍 Skanowanie projektu OREMUS...");

    // 1. Skanuj na podstawie mapy projektu
    await this.scanFromProjectMap();

    // 2. Skanuj pliki TypeScript
    await this.scanTypeScriptFiles();

    // 3. Skanuj zapytania Supabase
    await this.scanSupabaseQueries();

    // 4. Skanuj komponenty React
    await this.scanReactComponents();

    // 5. Skanuj services
    await this.scanServices();

    // 6. Dodaj tabele wymagane przez multi-tenant
    this.addMultiTenantTables();

    // 7. Uzupełnij relacje
    this.completeRelationships();

    console.log(`✅ Wykryto ${this.detectedTables.size} tabel`);
    return Array.from(this.detectedTables.values());
  }

  private async scanFromProjectMap(): Promise<void> {
    console.log("📋 Analizuję mapę projektu...");

    // Na podstawie analizy struktury projektu definiujemy tabele
    const knownTables = [
      // Podstawowe tabele użytkowników i autoryzacji
      {
        name: "users",
        category: "auth" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          { name: "email", type: "text", nullable: false, unique: true },
          { name: "password_hash", type: "text", nullable: true },
          { name: "first_name", type: "text", nullable: true },
          { name: "last_name", type: "text", nullable: true },
          { name: "role", type: "text", nullable: false, default: "'user'" },
          {
            name: "email_verified",
            type: "boolean",
            nullable: false,
            default: "false",
          },
          {
            name: "two_factor_enabled",
            type: "boolean",
            nullable: false,
            default: "false",
          },
          { name: "last_login", type: "timestamp", nullable: true },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Organizacje (parafie)
      {
        name: "organizations",
        category: "core" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          { name: "name", type: "text", nullable: false },
          { name: "slug", type: "text", nullable: false, unique: true },
          { name: "custom_domain", type: "text", nullable: true, unique: true },
          {
            name: "status",
            type: "text",
            nullable: false,
            default: "'pending'",
          },
          { name: "plan", type: "text", nullable: false, default: "'basic'" },
          { name: "contact_email", type: "text", nullable: false },
          { name: "phone", type: "text", nullable: true },
          { name: "address", type: "text", nullable: true },
          { name: "city", type: "text", nullable: true },
          { name: "postal_code", type: "text", nullable: true },
          { name: "nip", type: "text", nullable: true },
          { name: "regon", type: "text", nullable: true },
          { name: "settings", type: "jsonb", nullable: false, default: "'{}'" },
          { name: "branding", type: "jsonb", nullable: false, default: "'{}'" },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Członkostwa (multi-tenant)
      {
        name: "memberships",
        category: "core" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          {
            name: "organization_id",
            type: "uuid",
            nullable: false,
            references: "organizations.id",
          },
          { name: "role", type: "text", nullable: false },
          {
            name: "permissions",
            type: "jsonb",
            nullable: false,
            default: "'{}'",
          },
          {
            name: "status",
            type: "text",
            nullable: false,
            default: "'active'",
          },
          {
            name: "invited_by",
            type: "uuid",
            nullable: true,
            references: "users.id",
          },
          { name: "invited_at", type: "timestamp", nullable: true },
          { name: "joined_at", type: "timestamp", nullable: true },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Płatności
      {
        name: "payments",
        category: "business" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          {
            name: "organization_id",
            type: "uuid",
            nullable: true,
            references: "organizations.id",
          },
          { name: "stripe_payment_id", type: "text", nullable: true },
          { name: "amount", type: "integer", nullable: false },
          { name: "currency", type: "text", nullable: false, default: "'PLN'" },
          { name: "status", type: "text", nullable: false },
          { name: "type", type: "text", nullable: false },
          { name: "description", type: "text", nullable: true },
          { name: "metadata", type: "jsonb", nullable: false, default: "'{}'" },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Intencje mszalne
      {
        name: "mass_intentions",
        category: "business" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          {
            name: "organization_id",
            type: "uuid",
            nullable: false,
            references: "organizations.id",
          },
          {
            name: "church_id",
            type: "uuid",
            nullable: true,
            references: "churches.id",
          },
          { name: "intention_text", type: "text", nullable: false },
          { name: "mass_date", type: "timestamp", nullable: false },
          {
            name: "status",
            type: "text",
            nullable: false,
            default: "'pending'",
          },
          {
            name: "payment_id",
            type: "uuid",
            nullable: true,
            references: "payments.id",
          },
          {
            name: "priest_id",
            type: "uuid",
            nullable: true,
            references: "users.id",
          },
          { name: "amount", type: "integer", nullable: false },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Świece OREMUS
      {
        name: "oremus_candles",
        category: "business" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          { name: "nfc_tag_id", type: "text", nullable: true, unique: true },
          {
            name: "user_id",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          {
            name: "organization_id",
            type: "uuid",
            nullable: true,
            references: "organizations.id",
          },
          { name: "purchase_date", type: "timestamp", nullable: false },
          { name: "status", type: "text", nullable: false },
          { name: "intention", type: "text", nullable: true },
          {
            name: "duration_hours",
            type: "integer",
            nullable: false,
            default: "24",
          },
          { name: "lit_at", type: "timestamp", nullable: true },
          { name: "extinguished_at", type: "timestamp", nullable: true },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Kościoły
      {
        name: "churches",
        category: "core" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "organization_id",
            type: "uuid",
            nullable: false,
            references: "organizations.id",
          },
          { name: "name", type: "text", nullable: false },
          { name: "address", type: "text", nullable: false },
          { name: "city", type: "text", nullable: false },
          { name: "postal_code", type: "text", nullable: true },
          {
            name: "country",
            type: "text",
            nullable: false,
            default: "'Poland'",
          },
          { name: "latitude", type: "decimal", nullable: true },
          { name: "longitude", type: "decimal", nullable: true },
          { name: "phone", type: "text", nullable: true },
          { name: "email", type: "text", nullable: true },
          { name: "website", type: "text", nullable: true },
          {
            name: "masses_schedule",
            type: "jsonb",
            nullable: false,
            default: "'{}'",
          },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Modlitwy
      {
        name: "prayers",
        category: "content" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          { name: "name", type: "text", nullable: false },
          { name: "type", type: "text", nullable: false },
          { name: "content", type: "text", nullable: false },
          { name: "audio_url", type: "text", nullable: true },
          { name: "duration", type: "integer", nullable: true },
          { name: "category", type: "text", nullable: false },
          { name: "language", type: "text", nullable: false, default: "'pl'" },
          {
            name: "is_public",
            type: "boolean",
            nullable: false,
            default: "true",
          },
          {
            name: "created_by",
            type: "uuid",
            nullable: true,
            references: "users.id",
          },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Postęp użytkownika w modlitwach
      {
        name: "user_prayers",
        category: "analytics" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          {
            name: "prayer_id",
            type: "uuid",
            nullable: false,
            references: "prayers.id",
          },
          { name: "completed_at", type: "timestamp", nullable: true },
          {
            name: "streak_count",
            type: "integer",
            nullable: false,
            default: "0",
          },
          { name: "last_prayed_at", type: "timestamp", nullable: true },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Kursy OBD
      {
        name: "courses",
        category: "content" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          { name: "title", type: "text", nullable: false },
          { name: "description", type: "text", nullable: true },
          { name: "category", type: "text", nullable: false },
          {
            name: "lessons_count",
            type: "integer",
            nullable: false,
            default: "0",
          },
          { name: "price", type: "integer", nullable: false, default: "0" },
          {
            name: "difficulty_level",
            type: "text",
            nullable: false,
            default: "'beginner'",
          },
          { name: "duration_minutes", type: "integer", nullable: true },
          { name: "thumbnail_url", type: "text", nullable: true },
          {
            name: "is_published",
            type: "boolean",
            nullable: false,
            default: "false",
          },
          {
            name: "created_by",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Postęp użytkownika w kursach
      {
        name: "user_progress",
        category: "analytics" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          {
            name: "course_id",
            type: "uuid",
            nullable: false,
            references: "courses.id",
          },
          { name: "lesson_id", type: "uuid", nullable: true },
          {
            name: "completed",
            type: "boolean",
            nullable: false,
            default: "false",
          },
          { name: "score", type: "integer", nullable: true },
          {
            name: "time_spent_minutes",
            type: "integer",
            nullable: false,
            default: "0",
          },
          { name: "last_accessed_at", type: "timestamp", nullable: true },
          { name: "completed_at", type: "timestamp", nullable: true },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Quizy
      {
        name: "quizzes",
        category: "content" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "course_id",
            type: "uuid",
            nullable: false,
            references: "courses.id",
          },
          { name: "questions", type: "jsonb", nullable: false },
          { name: "correct_answers", type: "jsonb", nullable: false },
          {
            name: "passing_score",
            type: "integer",
            nullable: false,
            default: "70",
          },
          { name: "time_limit_minutes", type: "integer", nullable: true },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Społeczność - posty
      {
        name: "community_posts",
        category: "content" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          {
            name: "organization_id",
            type: "uuid",
            nullable: true,
            references: "organizations.id",
          },
          { name: "content", type: "text", nullable: false },
          { name: "type", type: "text", nullable: false },
          {
            name: "prayer_request",
            type: "boolean",
            nullable: false,
            default: "false",
          },
          {
            name: "anonymous",
            type: "boolean",
            nullable: false,
            default: "false",
          },
          {
            name: "is_public",
            type: "boolean",
            nullable: false,
            default: "true",
          },
          {
            name: "likes_count",
            type: "integer",
            nullable: false,
            default: "0",
          },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Prośby o modlitwę
      {
        name: "prayer_requests",
        category: "content" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          {
            name: "organization_id",
            type: "uuid",
            nullable: true,
            references: "organizations.id",
          },
          { name: "request_text", type: "text", nullable: false },
          {
            name: "status",
            type: "text",
            nullable: false,
            default: "'active'",
          },
          {
            name: "response_count",
            type: "integer",
            nullable: false,
            default: "0",
          },
          {
            name: "anonymous",
            type: "boolean",
            nullable: false,
            default: "false",
          },
          { name: "expires_at", type: "timestamp", nullable: true },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },

      // Powiadomienia
      {
        name: "notifications",
        category: "system" as const,
        columns: [
          {
            name: "id",
            type: "uuid",
            nullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            nullable: false,
            references: "users.id",
          },
          { name: "type", type: "text", nullable: false },
          { name: "title", type: "text", nullable: false },
          { name: "message", type: "text", nullable: false },
          { name: "data", type: "jsonb", nullable: false, default: "'{}'" },
          { name: "read_at", type: "timestamp", nullable: true },
          { name: "sent_at", type: "timestamp", nullable: true },
          {
            name: "created_at",
            type: "timestamp",
            nullable: false,
            default: "now()",
          },
        ],
      },
    ];

    // Dodaj tabele do mapy
    knownTables.forEach((tableData) => {
      const table: OremusTable = {
        name: tableData.name,
        columns: tableData.columns,
        relationships: [],
        sourceFiles: ["project-analysis"],
        category: tableData.category,
      };

      this.detectedTables.set(tableData.name, table);
    });
  }

  private async scanTypeScriptFiles(): Promise<void> {
    console.log("📄 Skanowanie plików TypeScript...");

    const typesDir = path.join(this.projectRoot, "types");
    if (fs.existsSync(typesDir)) {
      const typeFiles = fs
        .readdirSync(typesDir)
        .filter((f) => f.endsWith(".ts"));

      for (const file of typeFiles) {
        const content = fs.readFileSync(path.join(typesDir, file), "utf-8");
        this.extractFromTypeFile(content, file);
      }
    }
  }

  private extractFromTypeFile(content: string, fileName: string): void {
    // Szukaj interfejsów i typów
    const interfaceRegex = /interface\s+(\w+)\s*{([^}]+)}/g;
    let match;

    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceName = match[1];
      const interfaceBody = match[2];

      // Konwertuj nazwę interfejsu na nazwę tabeli
      const tableName = this.interfaceToTableName(interfaceName);

      if (this.detectedTables.has(tableName)) {
        // Uzupełnij istniejącą tabelę
        const table = this.detectedTables.get(tableName)!;
        if (!table.sourceFiles.includes(fileName)) {
          table.sourceFiles.push(fileName);
        }
      }
    }
  }

  private async scanSupabaseQueries(): Promise<void> {
    console.log("🔍 Skanowanie zapytań Supabase...");

    const serviceDirs = ["services", "hooks", "lib"];

    for (const dir of serviceDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        await this.scanDirectoryForQueries(dirPath);
      }
    }
  }

  private async scanDirectoryForQueries(dirPath: string): Promise<void> {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        await this.scanDirectoryForQueries(fullPath);
      } else if (item.name.endsWith(".ts") || item.name.endsWith(".tsx")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        this.extractSupabaseQueries(content, item.name);
      }
    }
  }

  private extractSupabaseQueries(content: string, fileName: string): void {
    // Pattern: supabase.from('table_name')
    const fromPattern = /supabase\.from\(['"`]([^'"`]+)['"`]\)/g;
    let match;

    while ((match = fromPattern.exec(content)) !== null) {
      const tableName = match[1];

      if (this.detectedTables.has(tableName)) {
        const table = this.detectedTables.get(tableName)!;
        if (!table.sourceFiles.includes(fileName)) {
          table.sourceFiles.push(fileName);
        }
      }
    }
  }

  private async scanReactComponents(): Promise<void> {
    console.log("⚛️ Skanowanie komponentów React...");

    const componentDirs = ["components", "app"];

    for (const dir of componentDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        await this.scanDirectoryForComponents(dirPath);
      }
    }
  }

  private async scanDirectoryForComponents(dirPath: string): Promise<void> {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        await this.scanDirectoryForComponents(fullPath);
      } else if (item.name.endsWith(".tsx")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        this.extractFromComponent(content, item.name);
      }
    }
  }

  private extractFromComponent(content: string, fileName: string): void {
    // Szukaj formularzy i state'ów które wskazują na strukturę danych
    const statePattern = /useState\s*\(\s*{([^}]+)}\s*\)/g;
    let match;

    while ((match = statePattern.exec(content)) !== null) {
      const stateBody = match[1];

      // Próbuj określić tabelę na podstawie nazwy pliku
      const tableName = this.inferTableFromFileName(fileName);
      if (tableName && this.detectedTables.has(tableName)) {
        const table = this.detectedTables.get(tableName)!;
        if (!table.sourceFiles.includes(fileName)) {
          table.sourceFiles.push(fileName);
        }
      }
    }
  }

  private async scanServices(): Promise<void> {
    console.log("🔧 Skanowanie serwisów...");

    const servicesDir = path.join(this.projectRoot, "services");
    if (fs.existsSync(servicesDir)) {
      await this.scanDirectoryForServices(servicesDir);
    }
  }

  private async scanDirectoryForServices(dirPath: string): Promise<void> {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        await this.scanDirectoryForServices(fullPath);
      } else if (item.name.endsWith(".ts")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        this.extractFromService(content, item.name);
      }
    }
  }

  private extractFromService(content: string, fileName: string): void {
    // Szukaj metod CRUD które wskazują na tabele
    const crudPattern = /\.(insert|update|delete|select|from)\(/g;

    // Określ tabelę na podstawie nazwy serwisu
    const tableName = this.inferTableFromServiceName(fileName);
    if (tableName && this.detectedTables.has(tableName)) {
      const table = this.detectedTables.get(tableName)!;
      if (!table.sourceFiles.includes(fileName)) {
        table.sourceFiles.push(fileName);
      }
    }
  }

  private addMultiTenantTables(): void {
    console.log("🏢 Dodawanie tabel multi-tenant...");

    // Sprawdź czy wszystkie tabele mają organization_id tam gdzie powinny
    this.detectedTables.forEach((table) => {
      if (this.shouldHaveOrganizationId(table.name)) {
        const hasOrgId = table.columns.some(
          (col) => col.name === "organization_id"
        );
        if (!hasOrgId) {
          table.columns.push({
            name: "organization_id",
            type: "uuid",
            nullable: true,
            references: "organizations.id",
          });
        }
      }
    });
  }

  private shouldHaveOrganizationId(tableName: string): boolean {
    const multiTenantTables = [
      "mass_intentions",
      "oremus_candles",
      "churches",
      "community_posts",
      "prayer_requests",
      "payments",
    ];

    return multiTenantTables.includes(tableName);
  }

  private completeRelationships(): void {
    console.log("🔗 Uzupełnianie relacji...");

    this.detectedTables.forEach((table) => {
      table.columns.forEach((column) => {
        if (column.references) {
          const [refTable, refColumn] = column.references.split(".");

          table.relationships.push({
            column: column.name,
            referencedTable: refTable,
            referencedColumn: refColumn,
            onDelete: "CASCADE",
          });
        }
      });
    });
  }

  // Helper methods
  private interfaceToTableName(interfaceName: string): string {
    const cleaned = interfaceName
      .replace(/Interface$/, "")
      .replace(/Type$/, "")
      .replace(/Model$/, "");

    return this.camelToSnake(this.pluralize(cleaned));
  }

  private inferTableFromFileName(fileName: string): string | null {
    const name = fileName.toLowerCase().replace(".tsx", "").replace(".ts", "");

    if (name.includes("mass")) return "mass_intentions";
    if (name.includes("payment")) return "payments";
    if (name.includes("candle")) return "oremus_candles";
    if (name.includes("church")) return "churches";
    if (name.includes("prayer")) return "prayers";
    if (name.includes("user")) return "users";
    if (name.includes("course")) return "courses";

    return null;
  }

  private inferTableFromServiceName(fileName: string): string | null {
    const name = fileName
      .toLowerCase()
      .replace("service.ts", "")
      .replace(".ts", "");

    if (name.includes("mass")) return "mass_intentions";
    if (name.includes("payment")) return "payments";
    if (name.includes("candle")) return "oremus_candles";
    if (name.includes("church")) return "churches";
    if (name.includes("prayer")) return "prayers";
    if (name.includes("user") || name.includes("auth")) return "users";
    if (name.includes("course") || name.includes("academy")) return "courses";
    if (name.includes("organization")) return "organizations";
    if (name.includes("notification")) return "notifications";

    return null;
  }

  private camelToSnake(str: string): string {
    return str
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "");
  }

  private pluralize(word: string): string {
    if (word.endsWith("y")) {
      return word.slice(0, -1) + "ies";
    }
    if (
      word.endsWith("s") ||
      word.endsWith("x") ||
      word.endsWith("z") ||
      word.endsWith("ch") ||
      word.endsWith("sh")
    ) {
      return word + "es";
    }
    return word + "s";
  }

  // Generowanie SQL
  generateCompleteSQL(tables: OremusTable[]): string {
    const sql: string[] = [];

    sql.push("-- OREMUS Complete Database Schema");
    sql.push("-- Generated from project analysis");
    sql.push(`-- Generated at: ${new Date().toISOString()}`);
    sql.push("-- Total tables: " + tables.length);
    sql.push("");

    // Extensions
    sql.push("-- Required extensions");
    sql.push('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    sql.push('CREATE EXTENSION IF NOT EXISTS "postgis";');
    sql.push("");

    // Create tables by category
    const categories = [
      "auth",
      "core",
      "business",
      "content",
      "analytics",
      "system",
    ];

    categories.forEach((category) => {
      const categoryTables = tables.filter((t) => t.category === category);
      if (categoryTables.length > 0) {
        sql.push(`-- ${category.toUpperCase()} TABLES`);
        sql.push("");

        categoryTables.forEach((table) => {
          sql.push(this.generateTableSQL(table));
          sql.push("");
        });
      }
    });

    // Foreign key constraints
    sql.push("-- FOREIGN KEY CONSTRAINTS");
    sql.push("");
    tables.forEach((table) => {
      table.relationships.forEach((rel) => {
        const constraintName = `fk_${table.name}_${rel.column}`;
        sql.push(`ALTER TABLE ${table.name} ADD CONSTRAINT ${constraintName}`);
        sql.push(
          `  FOREIGN KEY (${rel.column}) REFERENCES ${rel.referencedTable}(${rel.referencedColumn})`
        );
        sql.push(`  ON DELETE ${rel.onDelete || "CASCADE"};`);
        sql.push("");
      });
    });

    // Indexes
    sql.push("-- INDEXES");
    sql.push("");
    tables.forEach((table) => {
      // Primary key
      sql.push(`ALTER TABLE ${table.name} ADD PRIMARY KEY (id);`);

      // Foreign key indexes
      table.relationships.forEach((rel) => {
        sql.push(
          `CREATE INDEX idx_${table.name}_${rel.column} ON ${table.name}(${rel.column});`
        );
      });

      // Common indexes
      if (table.columns.some((col) => col.name === "created_at")) {
        sql.push(
          `CREATE INDEX idx_${table.name}_created_at ON ${table.name}(created_at);`
        );
      }
      if (table.columns.some((col) => col.name === "organization_id")) {
        sql.push(
          `CREATE INDEX idx_${table.name}_organization_id ON ${table.name}(organization_id);`
        );
      }
      if (table.columns.some((col) => col.name === "user_id")) {
        sql.push(
          `CREATE INDEX idx_${table.name}_user_id ON ${table.name}(user_id);`
        );
      }

      sql.push("");
    });

    // RLS Policies
    sql.push("-- ROW LEVEL SECURITY");
    sql.push("");
    tables.forEach((table) => {
      sql.push(`ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;`);
      sql.push("");

      // Generate policies based on table structure
      const policies = this.generateRLSPolicies(table);
      policies.forEach((policy) => {
        sql.push(policy);
        sql.push("");
      });
    });

    // Functions and triggers
    sql.push("-- TRIGGERS");
    sql.push("");
    sql.push(this.generateUpdateTimestampFunction());
    sql.push("");

    tables.forEach((table) => {
      if (table.columns.some((col) => col.name === "updated_at")) {
        sql.push(`CREATE TRIGGER set_timestamp_${table.name}`);
        sql.push(`  BEFORE UPDATE ON ${table.name}`);
        sql.push(`  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();`);
        sql.push("");
      }
    });

    return sql.join("\n");
  }

  private generateTableSQL(table: OremusTable): string {
    const sql: string[] = [];

    sql.push(`-- Table: ${table.name} (${table.category})`);
    sql.push(`-- Source files: ${table.sourceFiles.join(", ")}`);
    sql.push(`CREATE TABLE ${table.name} (`);

    const columnDefs = table.columns.map((col) => {
      let def = `  ${col.name} ${col.type.toUpperCase()}`;

      if (!col.nullable) def += " NOT NULL";
      if (col.default) def += ` DEFAULT ${col.default}`;
      if (col.unique) def += " UNIQUE";

      return def;
    });

    sql.push(columnDefs.join(",\n"));
    sql.push(`);`);

    // Comments
    sql.push(
      `COMMENT ON TABLE ${table.name} IS 'Category: ${
        table.category
      }. Sources: ${table.sourceFiles.join(", ")}';`
    );

    return sql.join("\n");
  }

  private generateRLSPolicies(table: OremusTable): string[] {
    const policies: string[] = [];
    const hasOrgId = table.columns.some(
      (col) => col.name === "organization_id"
    );
    const hasUserId = table.columns.some((col) => col.name === "user_id");

    if (table.name === "users") {
      // Users can view and edit their own profile
      policies.push(
        `CREATE POLICY "Users can view own profile" ON ${table.name}`,
        `  FOR SELECT USING (id = auth.uid());`
      );
      policies.push(
        `CREATE POLICY "Users can update own profile" ON ${table.name}`,
        `  FOR UPDATE USING (id = auth.uid());`
      );
    } else if (table.name === "organizations") {
      // Users can view organizations they belong to
      policies.push(
        `CREATE POLICY "Users can view their organizations" ON ${table.name}`,
        `  FOR SELECT USING (id IN (`,
        `    SELECT organization_id FROM memberships WHERE user_id = auth.uid()`,
        `  ));`
      );
    } else if (table.name === "memberships") {
      // Users can view their own memberships
      policies.push(
        `CREATE POLICY "Users can view own memberships" ON ${table.name}`,
        `  FOR SELECT USING (user_id = auth.uid());`
      );
    } else if (hasOrgId && hasUserId) {
      // Multi-tenant table with user ownership
      policies.push(
        `CREATE POLICY "Users can access own data in organization" ON ${table.name}`,
        `  FOR ALL USING (`,
        `    user_id = auth.uid() AND`,
        `    organization_id IN (`,
        `      SELECT organization_id FROM memberships WHERE user_id = auth.uid()`,
        `    )`,
        `  );`
      );
    } else if (hasOrgId) {
      // Multi-tenant table
      policies.push(
        `CREATE POLICY "Users can access organization data" ON ${table.name}`,
        `  FOR ALL USING (`,
        `    organization_id IN (`,
        `      SELECT organization_id FROM memberships WHERE user_id = auth.uid()`,
        `    )`,
        `  );`
      );
    } else if (hasUserId) {
      // User-specific table
      policies.push(
        `CREATE POLICY "Users can access own data" ON ${table.name}`,
        `  FOR ALL USING (user_id = auth.uid());`
      );
    } else {
      // Public table
      policies.push(
        `CREATE POLICY "Authenticated users can access" ON ${table.name}`,
        `  FOR SELECT USING (auth.role() = 'authenticated');`
      );
    }

    return policies;
  }

  private generateUpdateTimestampFunction(): string {
    return `-- Function to automatically update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;`;
  }

  // Generowanie raportu analizy
  generateAnalysisReport(tables: OremusTable[]): string {
    const report: string[] = [];

    report.push("# OREMUS Database Analysis Report");
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push("");

    // Summary
    const totalColumns = tables.reduce((sum, t) => sum + t.columns.length, 0);
    const totalRelations = tables.reduce(
      (sum, t) => sum + t.relationships.length,
      0
    );

    report.push("## Executive Summary");
    report.push(`- **Total Tables:** ${tables.length}`);
    report.push(`- **Total Columns:** ${totalColumns}`);
    report.push(`- **Total Relationships:** ${totalRelations}`);
    report.push(
      `- **Multi-tenant Ready:** ${
        tables.filter((t) =>
          t.columns.some((c) => c.name === "organization_id")
        ).length
      } tables`
    );
    report.push("");

    // By category
    report.push("## Tables by Category");
    const categories = [
      "auth",
      "core",
      "business",
      "content",
      "analytics",
      "system",
    ];

    categories.forEach((category) => {
      const categoryTables = tables.filter((t) => t.category === category);
      if (categoryTables.length > 0) {
        report.push(
          `### ${category.toUpperCase()} (${categoryTables.length} tables)`
        );
        categoryTables.forEach((table) => {
          report.push(
            `- **${table.name}**: ${table.columns.length} columns, ${table.relationships.length} relations`
          );
        });
        report.push("");
      }
    });

    // Detailed table information
    report.push("## Detailed Table Analysis");
    report.push("");

    tables.forEach((table) => {
      report.push(`### ${table.name}`);
      report.push(`**Category:** ${table.category}`);
      report.push(`**Source Files:** ${table.sourceFiles.join(", ")}`);
      report.push("");

      // Columns
      report.push("**Columns:**");
      table.columns.forEach((col) => {
        const nullable = col.nullable ? "NULL" : "NOT NULL";
        const def = col.default ? ` DEFAULT ${col.default}` : "";
        const unique = col.unique ? " UNIQUE" : "";
        const ref = col.references ? ` → ${col.references}` : "";
        report.push(
          `- \`${
            col.name
          }\`: ${col.type.toUpperCase()} ${nullable}${def}${unique}${ref}`
        );
      });
      report.push("");

      // Relationships
      if (table.relationships.length > 0) {
        report.push("**Relationships:**");
        table.relationships.forEach((rel) => {
          report.push(
            `- \`${rel.column}\` → \`${rel.referencedTable}.${rel.referencedColumn}\` (ON DELETE ${rel.onDelete})`
          );
        });
        report.push("");
      }
    });

    // Recommendations
    report.push("## Recommendations");
    const recommendations = this.generateRecommendations(tables);
    if (recommendations.length > 0) {
      recommendations.forEach((rec) => {
        report.push(`- ${rec}`);
      });
    } else {
      report.push("No issues detected. Schema looks good!");
    }
    report.push("");

    return report.join("\n");
  }

  private generateRecommendations(tables: OremusTable[]): string[] {
    const recommendations: string[] = [];

    // Check for missing common columns
    tables.forEach((table) => {
      const hasCreatedAt = table.columns.some(
        (col) => col.name === "created_at"
      );
      const hasUpdatedAt = table.columns.some(
        (col) => col.name === "updated_at"
      );
      const hasId = table.columns.some((col) => col.name === "id");

      if (!hasId) {
        recommendations.push(`Add primary key 'id' to table '${table.name}'`);
      }
      if (!hasCreatedAt) {
        recommendations.push(
          `Add 'created_at' timestamp to table '${table.name}'`
        );
      }
      if (!hasUpdatedAt && table.category !== "system") {
        recommendations.push(
          `Add 'updated_at' timestamp to table '${table.name}'`
        );
      }

      // Multi-tenant recommendations
      if (this.shouldHaveOrganizationId(table.name)) {
        const hasOrgId = table.columns.some(
          (col) => col.name === "organization_id"
        );
        if (!hasOrgId) {
          recommendations.push(
            `Add 'organization_id' to table '${table.name}' for multi-tenancy`
          );
        }
      }
    });

    return recommendations;
  }

  // Save results
  async saveResults(
    tables: OremusTable[],
    outputDir: string = "./database"
  ): Promise<void> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // 1. Complete SQL migration
    const completeSQL = this.generateCompleteSQL(tables);
    fs.writeFileSync(
      path.join(outputDir, `oremus_complete_schema_${timestamp}.sql`),
      completeSQL
    );

    // 2. Analysis report
    const report = this.generateAnalysisReport(tables);
    fs.writeFileSync(path.join(outputDir, "oremus_analysis_report.md"), report);

    // 3. JSON data for processing
    const jsonData = {
      generated: new Date().toISOString(),
      project: "OREMUS",
      tablesCount: tables.length,
      columnsCount: tables.reduce((sum, t) => sum + t.columns.length, 0),
      tables: tables,
    };

    fs.writeFileSync(
      path.join(outputDir, "oremus_schema.json"),
      JSON.stringify(jsonData, null, 2)
    );

    // 4. Supabase migrations (split by category)
    const categorizedSQL = this.generateCategorizedMigrations(tables);
    Object.entries(categorizedSQL).forEach(([category, sql]) => {
      fs.writeFileSync(
        path.join(outputDir, `migration_${category}_${timestamp}.sql`),
        sql
      );
    });

    console.log(`✅ Wyniki zapisane w ${outputDir}/`);
    console.log(`📄 Wygenerowane pliki:`);
    console.log(`   - oremus_complete_schema_${timestamp}.sql`);
    console.log(`   - oremus_analysis_report.md`);
    console.log(`   - oremus_schema.json`);
    console.log(`   - migration_[category]_${timestamp}.sql`);
  }

  private generateCategorizedMigrations(
    tables: OremusTable[]
  ): Record<string, string> {
    const migrations: Record<string, string> = {};
    const categories = [
      "auth",
      "core",
      "business",
      "content",
      "analytics",
      "system",
    ];

    categories.forEach((category) => {
      const categoryTables = tables.filter((t) => t.category === category);
      if (categoryTables.length > 0) {
        migrations[category] = this.generateCompleteSQL(categoryTables);
      }
    });

    return migrations;
  }
}

// Main execution function
export async function scanOremusProject(): Promise<void> {
  const scanner = new OremusProjectScanner();

  try {
    console.log("🚀 Rozpoczynam skanowanie projektu OREMUS...");

    const tables = await scanner.scanProject();

    console.log("💾 Zapisuję wyniki...");
    await scanner.saveResults(tables);

    console.log("✅ Skanowanie zakończone!");
    console.log(`📊 Podsumowanie: ${tables.length} tabel wykrytych`);

    // Quick summary
    const categories = [
      "auth",
      "core",
      "business",
      "content",
      "analytics",
      "system",
    ];
    categories.forEach((category) => {
      const count = tables.filter((t) => t.category === category).length;
      if (count > 0) {
        console.log(`   📋 ${category.toUpperCase()}: ${count} tabel`);
      }
    });
  } catch (error) {
    console.error("❌ Skanowanie nie powiodło się:", error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  scanOremusProject()
    .then(() => {
      console.log(
        "\n🎉 Gotowe! Sprawdź folder ./database/ aby zobaczyć wygenerowane pliki"
      );
      console.log("📝 Następne kroki:");
      console.log("   1. Sprawdź plik oremus_complete_schema_*.sql");
      console.log("   2. Przejrzyj raport analizy w oremus_analysis_report.md");
      console.log("   3. Uruchom migrację: npx supabase db push");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
