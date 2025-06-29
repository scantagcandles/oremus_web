// tools/auto-database-analyzer.ts
import fs from "fs";
import path from "path";
import { glob } from "glob";

interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  relationships: RelationshipDefinition[];
  indexes: IndexDefinition[];
  policies: PolicyDefinition[];
  sourceFiles: string[];
}

interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  unique?: boolean;
  references?: string;
  sourceFile: string;
  lineNumber: number;
}

interface RelationshipDefinition {
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
  onDelete?: "CASCADE" | "SET NULL" | "RESTRICT";
  onUpdate?: "CASCADE" | "SET NULL" | "RESTRICT";
}

interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
  type?: "btree" | "gin" | "gist";
}

interface PolicyDefinition {
  name: string;
  type: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
  using?: string;
  withCheck?: string;
}

export class DatabaseAnalyzer {
  private tables: Map<string, TableDefinition> = new Map();
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  // Główna funkcja analizy całego projektu
  async analyzeProject(): Promise<TableDefinition[]> {
    console.log("🔍 Rozpoczynam analizę projektu OREMUS...");

    // 1. Znajdź wszystkie pliki TypeScript/JavaScript
    const files = await this.findRelevantFiles();
    console.log(`📁 Znaleziono ${files.length} plików do analizy`);

    // 2. Analizuj każdy plik
    for (const file of files) {
      await this.analyzeFile(file);
    }

    // 3. Analizuj istniejące typy i interfejsy
    await this.analyzeTypeDefinitions();

    // 4. Analizuj zapytania Supabase
    await this.analyzeSupabaseQueries();

    // 5. Analizuj komponenty React
    await this.analyzeReactComponents();

    console.log(`✅ Analiza zakończona. Znaleziono ${this.tables.size} tabel`);
    return Array.from(this.tables.values());
  }

  private async findRelevantFiles(): Promise<string[]> {
    const patterns = [
      "types/**/*.ts",
      "services/**/*.ts",
      "hooks/**/*.ts",
      "lib/**/*.ts",
      "app/**/*.tsx",
      "app/**/*.ts",
      "components/**/*.tsx",
      "components/**/*.ts",
      "__tests__/**/*.ts",
      "__tests__/**/*.tsx",
      "supabase/**/*.ts",
      "tools/**/*.ts",
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: this.projectRoot });
      files.push(...matches.map((f) => path.join(this.projectRoot, f)));
    }

    return files.filter((file) => fs.existsSync(file));
  }

  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const relativePath = path.relative(this.projectRoot, filePath);

      // Analizuj różne wzorce w kodzie
      this.extractFromSupabaseQueries(content, relativePath);
      this.extractFromTypes(content, relativePath);
      this.extractFromInterfaces(content, relativePath);
      this.extractFromSchemas(content, relativePath);
      this.extractFromTableReferences(content, relativePath);
      this.extractFromFormValidation(content, relativePath);
    } catch (error) {
      console.warn(`⚠️ Błąd podczas analizy ${filePath}:`, error);
    }
  }

  private extractFromSupabaseQueries(content: string, filePath: string): void {
    const patterns = [
      // supabase.from('table_name')
      /supabase\.from\(['"`]([^'"`]+)['"`]\)/g,
      // .select(), .insert(), .update(), .delete()
      /\.from\(['"`]([^'"`]+)['"`]\)\.(?:select|insert|update|delete)/g,
      // JOIN patterns
      /\.select\([^)]*\)\.(?:leftJoin|rightJoin|innerJoin)\(['"`]([^'"`]+)['"`]/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const tableName = this.normalizeTableName(match[1]);
        this.ensureTable(tableName, filePath);
      }
    });

    // Analizuj SELECT queries for columns
    this.extractColumnsFromQueries(content, filePath);
  }

  private extractColumnsFromQueries(content: string, filePath: string): void {
    // Pattern: .select('col1, col2, relation(*)')
    const selectPattern = /\.select\(['"`]([^'"`]+)['"`]\)/g;
    let match;

    while ((match = selectPattern.exec(content)) !== null) {
      const selectClause = match[1];

      // Find table name before this select
      const beforeSelect = content.substring(0, match.index);
      const tableMatch = beforeSelect.match(/\.from\(['"`]([^'"`]+)['"`]\)/g);

      if (tableMatch && tableMatch.length > 0) {
        const lastTable = tableMatch[tableMatch.length - 1];
        const tableName = lastTable.match(/['"`]([^'"`]+)['"`]/)?.[1];

        if (tableName) {
          this.parseSelectColumns(
            this.normalizeTableName(tableName),
            selectClause,
            filePath
          );
        }
      }
    }
  }

  private parseSelectColumns(
    tableName: string,
    selectClause: string,
    filePath: string
  ): void {
    const table = this.ensureTable(tableName, filePath);

    // Split by comma and clean
    const columns = selectClause.split(",").map((col) => col.trim());

    columns.forEach((col) => {
      // Handle relations: table:other_table(*)
      if (col.includes(":")) {
        const [localCol, relation] = col.split(":");
        this.addColumn(tableName, localCol.trim(), "uuid", false, filePath, 0);

        // Extract referenced table
        const referencedTable = relation.match(/([^(]+)/)?.[1];
        if (referencedTable) {
          this.addRelationship(
            tableName,
            localCol.trim(),
            referencedTable,
            "id"
          );
        }
      } else if (col.includes("(")) {
        // Handle function calls: COUNT(*), etc.
        // Skip for now
      } else if (col === "*") {
        // Wildcard - can't extract specific columns
      } else {
        // Regular column
        this.addColumn(tableName, col, "unknown", true, filePath, 0);
      }
    });
  }

  private extractFromTypes(content: string, filePath: string): void {
    // TypeScript interface patterns
    const interfacePattern = /interface\s+(\w+)\s*{([^}]+)}/g;
    let match;

    while ((match = interfacePattern.exec(content)) !== null) {
      const interfaceName = match[1];
      const interfaceBody = match[2];

      // Convert interface name to table name
      const tableName = this.interfaceToTableName(interfaceName);
      const table = this.ensureTable(tableName, filePath);

      this.parseInterfaceProperties(tableName, interfaceBody, filePath);
    }

    // Type alias patterns
    const typePattern = /type\s+(\w+)\s*=\s*{([^}]+)}/g;
    while ((match = typePattern.exec(content)) !== null) {
      const typeName = match[1];
      const typeBody = match[2];

      const tableName = this.interfaceToTableName(typeName);
      this.ensureTable(tableName, filePath);
      this.parseInterfaceProperties(tableName, typeBody, filePath);
    }
  }

  private parseInterfaceProperties(
    tableName: string,
    propertiesString: string,
    filePath: string
  ): void {
    const lines = propertiesString.split("\n");

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*"))
        return;

      // Property pattern: propertyName?: Type;
      const propMatch = trimmed.match(/(\w+)(\?)?:\s*([^;,\n]+)/);
      if (propMatch) {
        const [, propName, optional, type] = propMatch;
        const nullable = !!optional;
        const sqlType = this.typescriptToSqlType(type.trim());

        this.addColumn(tableName, propName, sqlType, nullable, filePath, index);

        // Check for foreign key patterns
        if (propName.endsWith("_id") || propName.endsWith("Id")) {
          const referencedTable = propName.replace(/_?[iI]d$/, "");
          if (referencedTable !== tableName) {
            this.addRelationship(
              tableName,
              propName,
              this.pluralize(referencedTable),
              "id"
            );
          }
        }
      }
    });
  }

  private extractFromSchemas(content: string, filePath: string): void {
    // Zod schemas
    const zodPattern = /(\w+)Schema\s*=\s*z\.object\({([^}]+)}\)/g;
    let match;

    while ((match = zodPattern.exec(content)) !== null) {
      const schemaName = match[1];
      const schemaBody = match[2];

      const tableName = this.schemaToTableName(schemaName);
      this.ensureTable(tableName, filePath);
      this.parseZodSchema(tableName, schemaBody, filePath);
    }
  }

  private parseZodSchema(
    tableName: string,
    schemaBody: string,
    filePath: string
  ): void {
    const lines = schemaBody.split("\n");

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Zod property pattern: propertyName: z.string()
      const propMatch = trimmed.match(/(\w+):\s*z\.(\w+)\(\)/);
      if (propMatch) {
        const [, propName, zodType] = propMatch;
        const nullable = !trimmed.includes(".required()");
        const sqlType = this.zodToSqlType(zodType);

        this.addColumn(tableName, propName, sqlType, nullable, filePath, index);
      }
    });
  }

  private extractFromTableReferences(content: string, filePath: string): void {
    // Direct table references in comments or strings
    const tableRefPattern = /(?:table|TABLE)['"`\s]+([a-z_]+)['"`\s]/g;
    let match;

    while ((match = tableRefPattern.exec(content)) !== null) {
      const tableName = this.normalizeTableName(match[1]);
      this.ensureTable(tableName, filePath);
    }
  }

  private extractFromFormValidation(content: string, filePath: string): void {
    // React Hook Form patterns
    const formFieldPattern = /register\(['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = formFieldPattern.exec(content)) !== null) {
      const fieldName = match[1];

      // Try to determine table from component name or file path
      const tableName = this.inferTableFromPath(filePath);
      if (tableName) {
        this.addColumn(tableName, fieldName, "text", true, filePath, 0);
      }
    }
  }

  private async analyzeTypeDefinitions(): Promise<void> {
    console.log("🔍 Analizuję definicje typów...");

    const typeFiles = await glob("types/**/*.ts", { cwd: this.projectRoot });

    for (const typeFile of typeFiles) {
      const fullPath = path.join(this.projectRoot, typeFile);
      const content = fs.readFileSync(fullPath, "utf-8");

      // Analiza Database types (np. z Supabase CLI)
      this.extractSupabaseGeneratedTypes(content, typeFile);
    }
  }

  private extractSupabaseGeneratedTypes(
    content: string,
    filePath: string
  ): void {
    // Supabase generated types pattern
    const tablesPattern = /Tables:\s*{([^}]+)}/g;
    const match = tablesPattern.exec(content);

    if (match) {
      const tablesSection = match[1];
      const tablePattern = /(\w+):\s*{[^}]*Row:\s*{([^}]+)}/g;
      let tableMatch;

      while ((tableMatch = tablePattern.exec(tablesSection)) !== null) {
        const tableName = tableMatch[1];
        const rowDefinition = tableMatch[2];

        this.ensureTable(tableName, filePath);
        this.parseRowDefinition(tableName, rowDefinition, filePath);
      }
    }
  }

  private parseRowDefinition(
    tableName: string,
    rowDef: string,
    filePath: string
  ): void {
    const lines = rowDef.split("\n");

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const propMatch = trimmed.match(/(\w+):\s*([^|;\n]+)(?:\s*\|\s*null)?/);
      if (propMatch) {
        const [, propName, type] = propMatch;
        const nullable = trimmed.includes("| null");
        const sqlType = this.typescriptToSqlType(type.trim());

        this.addColumn(tableName, propName, sqlType, nullable, filePath, index);
      }
    });
  }

  private async analyzeSupabaseQueries(): Promise<void> {
    console.log("🔍 Analizuję zapytania Supabase...");

    // Dodatkowa analiza specyficznych wzorców Supabase
    const serviceFiles = await glob("services/**/*.ts", {
      cwd: this.projectRoot,
    });

    serviceFiles.forEach((serviceFile) => {
      const content = fs.readFileSync(
        path.join(this.projectRoot, serviceFile),
        "utf-8"
      );
      this.extractAdvancedSupabasePatterns(content, serviceFile);
    });
  }

  private extractAdvancedSupabasePatterns(
    content: string,
    filePath: string
  ): void {
    // Insert patterns
    const insertPattern = /\.insert\(\s*{([^}]+)}\s*\)/g;
    let match;

    while ((match = insertPattern.exec(content)) !== null) {
      const insertBody = match[1];

      // Find table name
      const beforeInsert = content.substring(0, match.index);
      const tableMatch = beforeInsert.match(/\.from\(['"`]([^'"`]+)['"`]\)/g);

      if (tableMatch && tableMatch.length > 0) {
        const lastTable = tableMatch[tableMatch.length - 1];
        const tableName = lastTable.match(/['"`]([^'"`]+)['"`]/)?.[1];

        if (tableName) {
          this.parseInsertFields(
            this.normalizeTableName(tableName),
            insertBody,
            filePath
          );
        }
      }
    }

    // Update patterns
    const updatePattern = /\.update\(\s*{([^}]+)}\s*\)/g;
    while ((match = updatePattern.exec(content)) !== null) {
      const updateBody = match[1];

      const beforeUpdate = content.substring(0, match.index);
      const tableMatch = beforeUpdate.match(/\.from\(['"`]([^'"`]+)['"`]\)/g);

      if (tableMatch && tableMatch.length > 0) {
        const lastTable = tableMatch[tableMatch.length - 1];
        const tableName = lastTable.match(/['"`]([^'"`]+)['"`]/)?.[1];

        if (tableName) {
          this.parseInsertFields(
            this.normalizeTableName(tableName),
            updateBody,
            filePath
          );
        }
      }
    }
  }

  private parseInsertFields(
    tableName: string,
    fieldsString: string,
    filePath: string
  ): void {
    const lines = fieldsString.split("\n");

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//")) return;

      // Field pattern: fieldName: value,
      const fieldMatch = trimmed.match(/(\w+):\s*[^,\n]+/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        this.addColumn(tableName, fieldName, "unknown", true, filePath, index);
      }
    });
  }

  private async analyzeReactComponents(): Promise<void> {
    console.log("🔍 Analizuję komponenty React...");

    const componentFiles = await glob("components/**/*.tsx", {
      cwd: this.projectRoot,
    });

    componentFiles.forEach((componentFile) => {
      const content = fs.readFileSync(
        path.join(this.projectRoot, componentFile),
        "utf-8"
      );
      this.extractFromReactForms(content, componentFile);
    });
  }

  private extractFromReactForms(content: string, filePath: string): void {
    // useState with object patterns
    const statePattern = /useState\s*\(\s*{([^}]+)}\s*\)/g;
    let match;

    while ((match = statePattern.exec(content)) !== null) {
      const stateBody = match[1];
      const tableName = this.inferTableFromPath(filePath);

      if (tableName) {
        this.parseStateObject(tableName, stateBody, filePath);
      }
    }
  }

  private parseStateObject(
    tableName: string,
    stateBody: string,
    filePath: string
  ): void {
    const lines = stateBody.split("\n");

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//")) return;

      const fieldMatch = trimmed.match(/(\w+):\s*[^,\n]+/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        this.addColumn(tableName, fieldName, "text", true, filePath, index);
      }
    });
  }

  // Helper methods
  private ensureTable(tableName: string, sourceFile: string): TableDefinition {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, {
        name: tableName,
        columns: [],
        relationships: [],
        indexes: [],
        policies: [],
        sourceFiles: [],
      });
    }

    const table = this.tables.get(tableName)!;
    if (!table.sourceFiles.includes(sourceFile)) {
      table.sourceFiles.push(sourceFile);
    }

    return table;
  }

  private addColumn(
    tableName: string,
    columnName: string,
    type: string,
    nullable: boolean,
    sourceFile: string,
    lineNumber: number
  ): void {
    const table = this.ensureTable(tableName, sourceFile);

    // Check if column already exists
    const existingColumn = table.columns.find((col) => col.name === columnName);
    if (existingColumn) {
      // Update type if it's more specific
      if (existingColumn.type === "unknown" && type !== "unknown") {
        existingColumn.type = type;
      }
      return;
    }

    table.columns.push({
      name: columnName,
      type,
      nullable,
      sourceFile,
      lineNumber,
    });

    // Add common columns if not exist
    this.addCommonColumns(tableName, sourceFile);
  }

  private addCommonColumns(tableName: string, sourceFile: string): void {
    const table = this.tables.get(tableName)!;
    const hasId = table.columns.some((col) => col.name === "id");
    const hasCreatedAt = table.columns.some((col) => col.name === "created_at");
    const hasUpdatedAt = table.columns.some((col) => col.name === "updated_at");

    if (!hasId) {
      table.columns.unshift({
        name: "id",
        type: "uuid",
        nullable: false,
        default: "uuid_generate_v4()",
        sourceFile,
        lineNumber: 0,
      });
    }

    if (!hasCreatedAt) {
      table.columns.push({
        name: "created_at",
        type: "timestamp",
        nullable: false,
        default: "now()",
        sourceFile,
        lineNumber: 0,
      });
    }

    if (!hasUpdatedAt) {
      table.columns.push({
        name: "updated_at",
        type: "timestamp",
        nullable: false,
        default: "now()",
        sourceFile,
        lineNumber: 0,
      });
    }
  }

  private addRelationship(
    fromTable: string,
    fromColumn: string,
    toTable: string,
    toColumn: string,
    onDelete: "CASCADE" | "SET NULL" | "RESTRICT" = "CASCADE"
  ): void {
    const table = this.tables.get(fromTable);
    if (!table) return;

    // Check if relationship already exists
    const existingRel = table.relationships.find(
      (rel) => rel.column === fromColumn && rel.referencedTable === toTable
    );

    if (!existingRel) {
      table.relationships.push({
        table: fromTable,
        column: fromColumn,
        referencedTable: toTable,
        referencedColumn: toColumn,
        onDelete,
      });
    }
  }

  // Type conversion methods
  private typescriptToSqlType(tsType: string): string {
    const typeMap: Record<string, string> = {
      string: "text",
      number: "integer",
      boolean: "boolean",
      Date: "timestamp",
      "string[]": "text[]",
      "number[]": "integer[]",
      any: "jsonb",
      object: "jsonb",
      "Record<string, any>": "jsonb",
      JSON: "jsonb",
      Buffer: "bytea",
      bigint: "bigint",
      float: "real",
      double: "double precision",
    };

    // Handle union types
    if (tsType.includes("|")) {
      const types = tsType.split("|").map((t) => t.trim());
      const nonNullTypes = types.filter((t) => t !== "null");
      if (nonNullTypes.length === 1) {
        return this.typescriptToSqlType(nonNullTypes[0]);
      }
      return "text"; // fallback for complex unions
    }

    return typeMap[tsType] || "text";
  }

  private zodToSqlType(zodType: string): string {
    const zodMap: Record<string, string> = {
      string: "text",
      number: "integer",
      boolean: "boolean",
      date: "timestamp",
      array: "jsonb",
      object: "jsonb",
      literal: "text",
      enum: "text",
      uuid: "uuid",
      email: "text",
      url: "text",
    };

    return zodMap[zodType] || "text";
  }

  private normalizeTableName(name: string): string {
    return name
      .toLowerCase()
      .replace(/([A-Z])/g, "_$1")
      .replace(/^_/, "")
      .replace(/__+/g, "_");
  }

  private interfaceToTableName(interfaceName: string): string {
    // Remove common suffixes
    const cleaned = interfaceName
      .replace(/Interface$/, "")
      .replace(/Type$/, "")
      .replace(/Model$/, "")
      .replace(/Entity$/, "");

    return this.pluralize(this.normalizeTableName(cleaned));
  }

  private schemaToTableName(schemaName: string): string {
    const cleaned = schemaName.replace(/Schema$/, "");
    return this.pluralize(this.normalizeTableName(cleaned));
  }

  private inferTableFromPath(filePath: string): string | null {
    const segments = filePath.split(/[/\\]/);

    // Look for table hints in path
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];

      if (segment.includes("Mass") || segment.includes("mass")) return "masses";
      if (segment.includes("User") || segment.includes("user")) return "users";
      if (segment.includes("Payment") || segment.includes("payment"))
        return "payments";
      if (segment.includes("Candle") || segment.includes("candle"))
        return "candles";
      if (segment.includes("Prayer") || segment.includes("prayer"))
        return "prayers";
      if (segment.includes("Church") || segment.includes("church"))
        return "churches";
      if (segment.includes("Parish") || segment.includes("parish"))
        return "parishes";
      if (segment.includes("Priest") || segment.includes("priest"))
        return "priests";
    }

    return null;
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

  // SQL Generation methods
  generateMigrationSQL(tables: TableDefinition[]): string {
    const sql: string[] = [];

    sql.push("-- OREMUS Database Schema");
    sql.push("-- Generated automatically from code analysis");
    sql.push(`-- Generated at: ${new Date().toISOString()}`);
    sql.push("");

    // Enable extensions
    sql.push("-- Enable required extensions");
    sql.push('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    sql.push('CREATE EXTENSION IF NOT EXISTS "postgis";');
    sql.push("");

    // Create tables
    sql.push("-- Create tables");
    tables.forEach((table) => {
      sql.push(this.generateCreateTableSQL(table));
      sql.push("");
    });

    // Add relationships
    sql.push("-- Add foreign key constraints");
    tables.forEach((table) => {
      table.relationships.forEach((rel) => {
        sql.push(this.generateForeignKeySQL(rel));
      });
    });
    sql.push("");

    // Add indexes
    sql.push("-- Add indexes");
    tables.forEach((table) => {
      sql.push(...this.generateIndexesSQL(table));
    });
    sql.push("");

    // Enable RLS
    sql.push("-- Enable Row Level Security");
    tables.forEach((table) => {
      sql.push(`ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;`);
    });
    sql.push("");

    // Add policies
    sql.push("-- Add RLS policies");
    tables.forEach((table) => {
      sql.push(...this.generatePoliciesSQL(table));
    });

    return sql.join("\n");
  }

  private generateCreateTableSQL(table: TableDefinition): string {
    const sql: string[] = [];

    sql.push(`CREATE TABLE IF NOT EXISTS ${table.name} (`);

    const columnDefs = table.columns.map((col) => {
      let def = `  ${col.name} ${col.type.toUpperCase()}`;

      if (!col.nullable) def += " NOT NULL";
      if (col.default) def += ` DEFAULT ${col.default}`;
      if (col.unique) def += " UNIQUE";

      return def;
    });

    sql.push(columnDefs.join(",\n"));
    sql.push(`);`);

    // Add comment with source files
    sql.push(
      `COMMENT ON TABLE ${
        table.name
      } IS 'Generated from: ${table.sourceFiles.join(", ")}';`
    );

    return sql.join("\n");
  }

  private generateForeignKeySQL(rel: RelationshipDefinition): string {
    const constraintName = `fk_${rel.table}_${rel.column}`;
    return (
      `ALTER TABLE ${rel.table} ADD CONSTRAINT ${constraintName} ` +
      `FOREIGN KEY (${rel.column}) REFERENCES ${rel.referencedTable}(${rel.referencedColumn}) ` +
      `ON DELETE ${rel.onDelete || "CASCADE"};`
    );
  }

  private generateIndexesSQL(table: TableDefinition): string[] {
    const indexes: string[] = [];

    // Add primary key if not exists
    const hasIdColumn = table.columns.some((col) => col.name === "id");
    if (hasIdColumn) {
      indexes.push(`ALTER TABLE ${table.name} ADD PRIMARY KEY (id);`);
    }

    // Add indexes for foreign keys
    table.relationships.forEach((rel) => {
      indexes.push(
        `CREATE INDEX IF NOT EXISTS idx_${table.name}_${rel.column} ON ${table.name}(${rel.column});`
      );
    });

    // Add common indexes
    if (table.columns.some((col) => col.name === "created_at")) {
      indexes.push(
        `CREATE INDEX IF NOT EXISTS idx_${table.name}_created_at ON ${table.name}(created_at);`
      );
    }

    return indexes;
  }

  private generatePoliciesSQL(table: TableDefinition): string[] {
    const policies: string[] = [];

    // Basic RLS policies for multi-tenant tables
    if (table.columns.some((col) => col.name === "organization_id")) {
      // Multi-tenant table
      policies.push(
        `CREATE POLICY "Users can only access their organization data" ON ${table.name} ` +
          `FOR ALL USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));`
      );
    } else if (table.columns.some((col) => col.name === "user_id")) {
      // User-specific table
      policies.push(
        `CREATE POLICY "Users can only access their own data" ON ${table.name} ` +
          `FOR ALL USING (user_id = auth.uid());`
      );
    } else if (table.name === "users") {
      // Users table
      policies.push(
        `CREATE POLICY "Users can view their own profile" ON ${table.name} ` +
          `FOR SELECT USING (id = auth.uid());`
      );
      policies.push(
        `CREATE POLICY "Users can update their own profile" ON ${table.name} ` +
          `FOR UPDATE USING (id = auth.uid());`
      );
    } else if (table.name === "organizations") {
      // Organizations table
      policies.push(
        `CREATE POLICY "Users can view their organizations" ON ${table.name} ` +
          `FOR SELECT USING (id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));`
      );
    }

    return policies;
  }

  // Analysis report generation
  generateAnalysisReport(tables: TableDefinition[]): string {
    const report: string[] = [];

    report.push("# OREMUS Database Analysis Report");
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push("");

    // Summary
    report.push("## Summary");
    report.push(`- **Total Tables:** ${tables.length}`);
    report.push(
      `- **Total Columns:** ${tables.reduce(
        (sum, t) => sum + t.columns.length,
        0
      )}`
    );
    report.push(
      `- **Total Relationships:** ${tables.reduce(
        (sum, t) => sum + t.relationships.length,
        0
      )}`
    );
    report.push("");

    // Tables overview
    report.push("## Tables Overview");
    report.push("");
    tables.forEach((table) => {
      report.push(`### ${table.name}`);
      report.push(
        `**Columns:** ${table.columns.length} | **Relations:** ${table.relationships.length}`
      );
      report.push(`**Source Files:** ${table.sourceFiles.join(", ")}`);
      report.push("");

      // Columns
      if (table.columns.length > 0) {
        report.push("**Columns:**");
        table.columns.forEach((col) => {
          const nullable = col.nullable ? "NULL" : "NOT NULL";
          const def = col.default ? ` DEFAULT ${col.default}` : "";
          report.push(
            `- \`${col.name}\` ${col.type.toUpperCase()} ${nullable}${def}`
          );
        });
        report.push("");
      }

      // Relationships
      if (table.relationships.length > 0) {
        report.push("**Relationships:**");
        table.relationships.forEach((rel) => {
          report.push(
            `- \`${rel.column}\` → \`${rel.referencedTable}.${rel.referencedColumn}\``
          );
        });
        report.push("");
      }
    });

    // Missing tables detection
    report.push("## Potential Missing Tables");
    const missingTables = this.detectMissingTables(tables);
    if (missingTables.length > 0) {
      missingTables.forEach((missing) => {
        report.push(`- **${missing.name}**: ${missing.reason}`);
      });
    } else {
      report.push("No missing tables detected.");
    }
    report.push("");

    // Recommendations
    report.push("## Recommendations");
    const recommendations = this.generateRecommendations(tables);
    recommendations.forEach((rec) => {
      report.push(`- ${rec}`);
    });

    return report.join("\n");
  }

  private detectMissingTables(
    tables: TableDefinition[]
  ): Array<{ name: string; reason: string }> {
    const missing: Array<{ name: string; reason: string }> = [];
    const tableNames = new Set(tables.map((t) => t.name));

    // Expected tables based on project analysis
    const expectedTables = [
      { name: "users", reason: "Authentication system requires users table" },
      {
        name: "organizations",
        reason: "Multi-tenant architecture requires organizations",
      },
      {
        name: "memberships",
        reason: "Multi-tenant requires user-organization relationships",
      },
      { name: "masses", reason: "Core functionality - mass scheduling" },
      {
        name: "mass_intentions",
        reason: "Core functionality - mass intentions",
      },
      { name: "payments", reason: "Payment system integration" },
      { name: "candles", reason: "Virtual candles functionality" },
      { name: "prayers", reason: "Prayer library functionality" },
      { name: "churches", reason: "Church location system" },
      { name: "courses", reason: "OBD education system" },
      { name: "user_progress", reason: "Course progress tracking" },
      { name: "notifications", reason: "Notification system" },
    ];

    expectedTables.forEach((expected) => {
      if (!tableNames.has(expected.name)) {
        missing.push(expected);
      }
    });

    return missing;
  }

  private generateRecommendations(tables: TableDefinition[]): string[] {
    const recommendations: string[] = [];

    tables.forEach((table) => {
      // Check for missing timestamps
      const hasCreatedAt = table.columns.some(
        (col) => col.name === "created_at"
      );
      const hasUpdatedAt = table.columns.some(
        (col) => col.name === "updated_at"
      );

      if (!hasCreatedAt) {
        recommendations.push(`Add created_at timestamp to ${table.name} table`);
      }
      if (!hasUpdatedAt) {
        recommendations.push(`Add updated_at timestamp to ${table.name} table`);
      }

      // Check for missing primary key
      const hasPrimaryKey = table.columns.some((col) => col.name === "id");
      if (!hasPrimaryKey) {
        recommendations.push(`Add primary key (id) to ${table.name} table`);
      }

      // Check for multi-tenant compatibility
      const hasOrgId = table.columns.some(
        (col) => col.name === "organization_id"
      );
      const hasUserId = table.columns.some((col) => col.name === "user_id");

      if (
        !hasOrgId &&
        !hasUserId &&
        table.name !== "users" &&
        table.name !== "organizations"
      ) {
        recommendations.push(
          `Consider adding organization_id or user_id to ${table.name} for multi-tenancy`
        );
      }

      // Check for indexes on foreign keys
      table.relationships.forEach((rel) => {
        recommendations.push(
          `Ensure index exists on ${table.name}.${rel.column} for performance`
        );
      });
    });

    return recommendations;
  }

  // Save results
  async saveResults(
    tables: TableDefinition[],
    outputDir: string = "./database"
  ): Promise<void> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save migration SQL
    const migrationSQL = this.generateMigrationSQL(tables);
    fs.writeFileSync(
      path.join(outputDir, `migration_${Date.now()}.sql`),
      migrationSQL
    );

    // Save analysis report
    const report = this.generateAnalysisReport(tables);
    fs.writeFileSync(path.join(outputDir, "analysis_report.md"), report);

    // Save JSON data for further processing
    const jsonData = {
      generated: new Date().toISOString(),
      tables: tables.map((table) => ({
        ...table,
        columnsCount: table.columns.length,
        relationshipsCount: table.relationships.length,
      })),
    };

    fs.writeFileSync(
      path.join(outputDir, "database_schema.json"),
      JSON.stringify(jsonData, null, 2)
    );

    console.log(`✅ Results saved to ${outputDir}/`);
    console.log(`📄 Files generated:`);
    console.log(`   - migration_${Date.now()}.sql`);
    console.log(`   - analysis_report.md`);
    console.log(`   - database_schema.json`);
  }
}

// Main execution function
export async function analyzeDatabaseAndGenerate(): Promise<void> {
  const analyzer = new DatabaseAnalyzer();

  try {
    console.log("🚀 Starting OREMUS database analysis...");

    const tables = await analyzer.analyzeProject();

    console.log("💾 Saving results...");
    await analyzer.saveResults(tables);

    console.log("✅ Analysis complete!");
    console.log(`📊 Summary: ${tables.length} tables detected`);

    // Print quick summary
    tables.forEach((table) => {
      console.log(
        `   📋 ${table.name}: ${table.columns.length} columns, ${table.relationships.length} relations`
      );
    });
  } catch (error) {
    console.error("❌ Analysis failed:", error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  analyzeDatabaseAndGenerate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
