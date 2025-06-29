#!/bin/bash

# Run the TypeScript schema extractor
echo "Running schema extractor..."
npx ts-node tools/schema-extractor.ts

# Validate the generated SQL file
echo "Validating SQL schema..."
npx sql-lint supabase/migrations/00000000000000_oremus_schema.sql --config .sqllintrc

# Notify user
echo "Schema extraction complete!"
echo "Generated files:"
echo "- supabase/migrations/00000000000000_oremus_schema.sql"
echo "- docs/database-schema.md"
