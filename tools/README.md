# Oremus Database Schema Management

This directory contains tools for automatically managing the Supabase database schema for the Oremus project.

## Overview

The schema management system provides the following features:

1. **Automatic Schema Extraction**: Extracts database schema from TypeScript type definitions
2. **Table Usage Detection**: Analyzes the codebase to find all Supabase table references
3. **SQL Migration Generation**: Creates SQL migration files for Supabase
4. **Documentation Generation**: Creates Markdown documentation and ERD diagrams
5. **Continuous Integration**: GitHub Actions workflow to keep schema in sync with code

## Available Commands

Add these scripts to your workflow to manage the Supabase schema:

```bash
# Extract schema from TypeScript types
npm run db:schema:extract

# Detect table usage in the codebase
npm run db:schema:detect

# Run the complete schema management process
npm run db:schema:update

# Generate ERD diagram
npm run db:erd

# Apply migrations to local Supabase instance
npm run db:migrate
```

## How It Works

1. **Schema Extraction**: The `schema-extractor.ts` script analyzes the TypeScript type definitions in `types/supabase.ts` to identify tables, fields, relationships, and enums.

2. **Table Usage Detection**: The `detect-table-usage.ts` script scans the entire codebase to find all instances of Supabase table operations (e.g., `.from('table_name').select()`).

3. **SQL Generation**: The extracted schema is used to generate a comprehensive SQL migration file at `supabase/migrations/00000000000000_oremus_schema.sql`.

4. **Documentation**: Markdown documentation is generated at `docs/database-schema.md` and `docs/supabase-usage-report.md`.

## Adding New Tables

The system automatically detects new tables in two ways:

1. **From TypeScript Types**: Add new tables to the `Database` type in `types/supabase.ts`.

2. **From Code Usage**: When you use a new table in your code (e.g., `supabase.from('new_table')`), the table usage detector will identify it.

After adding new tables, run `npm run db:schema:update` to update the schema and documentation.

## Continuous Integration

The GitHub Actions workflow in `.github/workflows/update-supabase-schema.yml` automatically updates the schema and documentation when changes are made to relevant files.

## Troubleshooting

- **SQL Lint Errors**: The SQL linter may report errors for PostgreSQL-specific syntax. These can be ignored by adding them to the `.sqllintrc` configuration.

- **Table Not Found**: If a table is used in code but not defined in the types, the schema extractor will warn about it. Add the table definition to `types/supabase.ts`.

- **Migration Errors**: If you encounter errors when applying migrations, check the SQL syntax and ensure that tables are created in the correct order (to satisfy foreign key constraints).

## Contributing

When adding new features that require database changes:

1. Update the types in `types/supabase.ts` to reflect the new tables or fields
2. Run `npm run db:schema:update` to update the schema and documentation
3. Commit the updated files to your pull request
