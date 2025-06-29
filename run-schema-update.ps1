# Run the Supabase Schema Manager
Write-Host "Running Supabase Schema Manager" -ForegroundColor Green

# Install required dependencies if needed
npm install --no-save glob ts-node sql-lint

# Extract schema from TypeScript types
Write-Host "Extracting schema from TypeScript types..." -ForegroundColor Cyan
npx ts-node tools/schema-extractor.ts

# Detect table usage in codebase
Write-Host "Detecting table usage in codebase..." -ForegroundColor Cyan
npx ts-node tools/detect-table-usage.ts

Write-Host "Schema management complete!" -ForegroundColor Green
Write-Host "Generated files:" -ForegroundColor Yellow
Write-Host "- supabase/migrations/00000000000000_oremus_schema.sql" -ForegroundColor White
Write-Host "- docs/database-schema.md" -ForegroundColor White
Write-Host "- docs/supabase-usage-report.md" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Magenta
Write-Host "1. Review the generated schema files" -ForegroundColor White
Write-Host "2. Apply migrations with: npm run db:migrate" -ForegroundColor White
Write-Host "3. Generate ERD with: npm run db:erd" -ForegroundColor White
