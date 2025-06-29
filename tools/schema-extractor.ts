import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

interface TableField {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
  uniqueConstraint?: boolean;
  description?: string;
}

interface Table {
  name: string;
  fields: TableField[];
  relationships: {
    name: string;
    foreignKey: string;
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
  }[];
  description?: string;
}

interface Enum {
  name: string;
  values: string[];
  description?: string;
}

interface SchemaInfo {
  tables: Table[];
  enums: Enum[];
}

function extractTypesFromTypeNode(node: ts.TypeNode): string[] {
  if (ts.isLiteralTypeNode(node)) {
    const literal = node.literal;
    if (ts.isStringLiteral(literal)) {
      return [literal.text];
    }
  } else if (ts.isUnionTypeNode(node)) {
    return node.types.flatMap(extractTypesFromTypeNode);
  }
  return [];
}

function findDatabaseTables(sourceFile: ts.SourceFile): SchemaInfo {
  const tables: Table[] = [];
  const enums: Enum[] = [];

  function visit(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === "Database") {
      const tableTypesNode = node.type;
      if (ts.isTypeLiteralNode(tableTypesNode)) {
        for (const member of tableTypesNode.members) {
          if (
            ts.isPropertySignature(member) &&
            member.name &&
            ts.isIdentifier(member.name) &&
            member.name.text === "public"
          ) {
            if (member.type && ts.isTypeLiteralNode(member.type)) {
              for (const publicMember of member.type.members) {
                if (
                  ts.isPropertySignature(publicMember) &&
                  publicMember.name &&
                  ts.isIdentifier(publicMember.name) &&
                  publicMember.name.text === "Tables"
                ) {
                  if (
                    publicMember.type &&
                    ts.isTypeLiteralNode(publicMember.type)
                  ) {
                    // Extract tables
                    for (const tableMember of publicMember.type.members) {
                      if (
                        ts.isPropertySignature(tableMember) &&
                        tableMember.name &&
                        ts.isIdentifier(tableMember.name)
                      ) {
                        const tableName = tableMember.name.text;
                        const tableFields: TableField[] = [];
                        const relationships: any[] = [];

                        if (
                          tableMember.type &&
                          ts.isTypeLiteralNode(tableMember.type)
                        ) {
                          for (const tableProperty of tableMember.type
                            .members) {
                            if (
                              ts.isPropertySignature(tableProperty) &&
                              tableProperty.name &&
                              ts.isIdentifier(tableProperty.name)
                            ) {
                              if (
                                tableProperty.name.text === "Row" &&
                                tableProperty.type &&
                                ts.isTypeLiteralNode(tableProperty.type)
                              ) {
                                // Extract fields from Row type
                                for (const field of tableProperty.type
                                  .members) {
                                  if (
                                    ts.isPropertySignature(field) &&
                                    field.name &&
                                    ts.isIdentifier(field.name)
                                  ) {
                                    const fieldName = field.name.text;
                                    let fieldType = "unknown";
                                    let nullable = false;

                                    if (field.type) {
                                      fieldType =
                                        field.type.getText(sourceFile);
                                      nullable = fieldType.includes("null");
                                    }

                                    tableFields.push({
                                      name: fieldName,
                                      type: fieldType.replace(/ \| null$/, ""),
                                      nullable,
                                      primaryKey: fieldName === "id",
                                    });
                                  }
                                }
                              } else if (
                                tableProperty.name.text === "Relationships" &&
                                tableProperty.type &&
                                ts.isArrayTypeNode(tableProperty.type) &&
                                tableProperty.type.elementType &&
                                ts.isTypeLiteralNode(
                                  tableProperty.type.elementType
                                )
                              ) {
                                // Extract relationships
                                const relationshipMembers =
                                  tableProperty.type.elementType.members;
                                let relationship: any = {};

                                for (const relField of relationshipMembers) {
                                  if (
                                    ts.isPropertySignature(relField) &&
                                    relField.name &&
                                    ts.isIdentifier(relField.name)
                                  ) {
                                    const fieldName = relField.name.text;

                                    if (relField.type) {
                                      if (fieldName === "foreignKeyName") {
                                        relationship.name = fieldName;
                                      } else if (fieldName === "columns") {
                                        relationship.columns = ["id"]; // Default to id column
                                      } else if (
                                        fieldName === "referencedRelation"
                                      ) {
                                        relationship.referencedTable =
                                          "referenced_table";
                                      } else if (
                                        fieldName === "referencedColumns"
                                      ) {
                                        relationship.referencedColumns = ["id"]; // Default to id column
                                      }
                                    }
                                  }
                                }

                                if (relationship.name) {
                                  relationships.push(relationship);

                                  // Update foreign key info in fields
                                  if (
                                    relationship.columns &&
                                    relationship.columns.length > 0
                                  ) {
                                    const foreignKeyField = tableFields.find(
                                      (f) => f.name === relationship.columns[0]
                                    );
                                    if (foreignKeyField) {
                                      foreignKeyField.foreignKey = {
                                        table: relationship.referencedTable,
                                        column:
                                          relationship.referencedColumns[0],
                                      };
                                    }
                                  }
                                }

                                relationship = {};
                              }
                            }
                          }
                        }

                        tables.push({
                          name: tableName,
                          fields: tableFields,
                          relationships,
                        });
                      }
                    }
                  }
                } else if (
                  ts.isPropertySignature(publicMember) &&
                  publicMember.name &&
                  ts.isIdentifier(publicMember.name) &&
                  publicMember.name.text === "Enums"
                ) {
                  // Extract enums
                  if (
                    publicMember.type &&
                    ts.isTypeLiteralNode(publicMember.type)
                  ) {
                    for (const enumMember of publicMember.type.members) {
                      if (
                        ts.isPropertySignature(enumMember) &&
                        enumMember.name &&
                        ts.isIdentifier(enumMember.name) &&
                        enumMember.type
                      ) {
                        const enumName = enumMember.name.text;
                        const enumValues = extractTypesFromTypeNode(
                          enumMember.type
                        );

                        if (enumValues.length > 0) {
                          enums.push({
                            name: enumName,
                            values: enumValues,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { tables, enums };
}

function generateSqlSchema(schemaInfo: SchemaInfo): string {
  let sql = `-- Oremus Database Schema
-- Auto-generated on ${new Date().toISOString()}
-- DO NOT EDIT DIRECTLY

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

`;

  // Generate ENUMs
  sql += `-- ENUMS\n`;
  for (const enumDef of schemaInfo.enums) {
    sql += `CREATE TYPE ${enumDef.name} AS ENUM (${enumDef.values
      .map((v) => `'${v}'`)
      .join(", ")});\n\n`;
  }

  // Generate Tables
  sql += `-- TABLES\n`;
  for (const table of schemaInfo.tables) {
    sql += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;

    const fieldDefinitions = table.fields.map((field) => {
      let definition = `    ${field.name} `;

      // Map TypeScript types to SQL types
      let sqlType: string;
      if (field.type.includes("string")) {
        if (
          field.name.includes("content") ||
          field.name.includes("description")
        ) {
          sqlType = "TEXT";
        } else {
          sqlType = "VARCHAR(255)";
        }
      } else if (field.type.includes("number")) {
        if (field.name.includes("price") || field.name.includes("amount")) {
          sqlType = "DECIMAL(10, 2)";
        } else {
          sqlType = "INTEGER";
        }
      } else if (field.type.includes("boolean")) {
        sqlType = "BOOLEAN";
      } else if (field.type.includes("Date") || field.type.includes("date")) {
        sqlType = "TIMESTAMP WITH TIME ZONE";
      } else if (field.type.includes("[]") || field.type.includes("Array")) {
        sqlType = "JSONB";
      } else if (
        field.type.includes("Record") ||
        field.type.includes("object")
      ) {
        sqlType = "JSONB";
      } else {
        // Check if it's an enum type
        const matchingEnum = schemaInfo.enums.find((e) =>
          field.type.includes(e.name)
        );
        if (matchingEnum) {
          sqlType = matchingEnum.name;
        } else {
          sqlType = "TEXT";
        }
      }

      definition += sqlType;

      // Add constraints
      if (field.primaryKey) {
        definition += " PRIMARY KEY";
        if (field.type.includes("string")) {
          definition += " DEFAULT uuid_generate_v4()";
        }
      }

      if (!field.nullable && !field.primaryKey) {
        definition += " NOT NULL";
      }

      if (field.name === "created_at" && field.type.includes("string")) {
        definition += " DEFAULT CURRENT_TIMESTAMP";
      }

      if (field.name === "updated_at" && field.type.includes("string")) {
        definition += " DEFAULT CURRENT_TIMESTAMP";
      }

      return definition;
    });

    // Add foreign key constraints
    for (const field of table.fields) {
      if (field.foreignKey) {
        fieldDefinitions.push(
          `    FOREIGN KEY (${field.name}) REFERENCES ${field.foreignKey.table}(${field.foreignKey.column}) ON DELETE CASCADE`
        );
      }
    }

    sql += fieldDefinitions.join(",\n");
    sql += `\n);\n\n`;

    // Add indexes
    sql += `-- Indexes for ${table.name}\n`;
    sql += `CREATE INDEX IF NOT EXISTS idx_${table.name}_id ON ${table.name} (id);\n`;

    for (const field of table.fields) {
      if (field.foreignKey) {
        sql += `CREATE INDEX IF NOT EXISTS idx_${table.name}_${field.name} ON ${table.name} (${field.name});\n`;
      }
    }

    sql += "\n";
  }

  // Generate RLS Policies
  sql += `-- RLS Policies\n`;
  sql += `-- Enable Row Level Security\n`;
  for (const table of schemaInfo.tables) {
    sql += `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n`;
  }

  sql += `\n-- Basic Policies\n`;
  for (const table of schemaInfo.tables) {
    if (table.fields.some((f) => f.name === "user_id")) {
      sql += `CREATE POLICY ${table.name}_user_isolation ON ${table.name} 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);\n\n`;
    }
  }

  // Add triggers for updated_at
  sql += `-- Add trigger for updated_at columns\n`;
  sql += `CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';\n\n`;

  for (const table of schemaInfo.tables) {
    if (table.fields.some((f) => f.name === "updated_at")) {
      sql += `CREATE TRIGGER update_${table.name}_updated_at
    BEFORE UPDATE ON ${table.name}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();\n\n`;
    }
  }

  return sql;
}

function generateMarkdownDocs(schemaInfo: SchemaInfo): string {
  let markdown = `# Oremus Database Schema Documentation

Generated on: ${new Date().toLocaleDateString()}

## Tables

`;

  for (const table of schemaInfo.tables) {
    markdown += `### ${table.name}\n\n`;

    if (table.description) {
      markdown += `${table.description}\n\n`;
    }

    markdown += `| Column | Type | Nullable | Constraints | Description |\n`;
    markdown += `|--------|------|----------|-------------|-------------|\n`;

    for (const field of table.fields) {
      let constraints = [];
      if (field.primaryKey) constraints.push("PK");
      if (field.foreignKey)
        constraints.push(
          `FK -> ${field.foreignKey.table}.${field.foreignKey.column}`
        );
      if (field.uniqueConstraint) constraints.push("UNIQUE");

      markdown += `| ${field.name} | ${field.type} | ${
        field.nullable ? "Yes" : "No"
      } | ${constraints.join(", ")} | ${field.description || ""} |\n`;
    }

    markdown += "\n";

    if (table.relationships && table.relationships.length > 0) {
      markdown += `**Relationships:**\n\n`;
      for (const rel of table.relationships) {
        markdown += `- ${rel.name}: ${table.name}.${rel.columns.join(
          ", "
        )} -> ${rel.referencedTable}.${rel.referencedColumns.join(", ")}\n`;
      }
      markdown += "\n";
    }
  }

  markdown += `## Enums\n\n`;

  for (const enumDef of schemaInfo.enums) {
    markdown += `### ${enumDef.name}\n\n`;

    if (enumDef.description) {
      markdown += `${enumDef.description}\n\n`;
    }

    markdown += `Possible values: ${enumDef.values
      .map((v) => `\`${v}\``)
      .join(", ")}\n\n`;
  }

  return markdown;
}

function extractSchemaFromTypeScript(filePath: string): SchemaInfo {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    path.basename(filePath),
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  return findDatabaseTables(sourceFile);
}

function extractTablesFromCodebase() {
  // Extract from main type definition
  console.log("Extracting schema from types/supabase.ts...");
  const schema = extractSchemaFromTypeScript("types/supabase.ts");

  // Generate SQL file
  console.log("Generating SQL schema...");
  const sqlSchema = generateSqlSchema(schema);
  fs.writeFileSync(
    "supabase/migrations/00000000000000_oremus_schema.sql",
    sqlSchema
  );

  // Generate Markdown docs
  console.log("Generating Markdown documentation...");
  const markdownDocs = generateMarkdownDocs(schema);
  fs.writeFileSync("docs/database-schema.md", markdownDocs);

  console.log("Schema extraction complete!");
}

// Run when executed directly
if (require.main === module) {
  extractTablesFromCodebase();
}

export { extractTablesFromCodebase };
export type { SchemaInfo, Table, Enum };
