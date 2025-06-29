# validate-and-update-migrations.ps1
# This script validates all migrations and updates the schema files

# Navigate to the project root (one level up from tools directory)
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# Create docs directory if it doesn't exist
if (-not (Test-Path "docs")) {
    New-Item -ItemType Directory -Path "docs" | Out-Null
    Write-Host "Created docs directory" -ForegroundColor Green
}

if (-not (Test-Path "docs/diagrams")) {
    New-Item -ItemType Directory -Path "docs/diagrams" | Out-Null
    Write-Host "Created docs/diagrams directory" -ForegroundColor Green
}

# Run the schema extractor
Write-Host "Extracting schema from TypeScript types..." -ForegroundColor Cyan
npx ts-node tools/schema-extractor.ts
$extractorExitCode = $LASTEXITCODE

# Generate table usage report
Write-Host "Detecting table usage in codebase..." -ForegroundColor Cyan
npx ts-node tools/detect-table-usage.ts

# Check multi-tenant schema
Write-Host "Checking multi-tenant schema..." -ForegroundColor Cyan
npx ts-node tools/check-multi-tenant-schema.ts

# Validate migrations
Write-Host "Validating SQL migrations..." -ForegroundColor Cyan
npx ts-node tools/validate-migrations.ts
$validationExitCode = $LASTEXITCODE

# Lint SQL files
Write-Host "Linting SQL schema files..." -ForegroundColor Cyan
npx sql-lint --config .sql-lint.json supabase/migrations/00000000000000_oremus_schema.sql
npx sql-lint --config .sql-lint.json supabase/migrations/20250621000001_multi_tenant_schema.sql
npx sql-lint --config .sql-lint.json supabase/migrations/20250621000002_migrate_to_multi_tenant.sql

# Check if we need to update the multi-tenant schema
$reportPath = "docs/multi-tenant-analysis.md"
if (Test-Path $reportPath) {
    $report = Get-Content -Path $reportPath -Raw

    if ($report -match "Missing Multi-Tenant Tables" -and $report -match "⚠️") {
        Write-Host "`nFound missing multi-tenant tables. Do you want to update the migration file? (y/n)" -ForegroundColor Magenta
        $updateTables = Read-Host
        
        if ($updateTables -eq "y") {
            # Extract SQL from the report
            if ($report -match "```sql([\s\S]*?)```") {
                $sql = $Matches[1].Trim()
                
                # Append to multi-tenant schema migration
                $migrationPath = "supabase/migrations/20250621000001_multi_tenant_schema.sql"
                Add-Content -Path $migrationPath -Value "`n-- Added from multi-tenant-analysis.md`n$sql"
                
                Write-Host "Updated $migrationPath with missing tables and columns" -ForegroundColor Green
                
                # Re-run validation
                npx ts-node tools/check-multi-tenant-schema.ts
            }
        }
    }

    # Check if we have missing organization_id columns
    if ($report -match "Tables Needing organization_id" -and $report -match "⚠️") {
        Write-Host "`nFound tables missing organization_id. Do you want to update the migration file? (y/n)" -ForegroundColor Magenta
        $updateOrgId = Read-Host
        
        if ($updateOrgId -eq "y") {
            # Extract SQL for adding organization_id
            if ($report -match "```sql([\s\S]*?)```") {
                $sql = $Matches[1].Trim()
                
                # Extract just the organization_id additions
                $orgIdAdditions = [regex]::Matches($sql, "-- Add organization_id to.*?\n(.*?\n)+?-- Update RLS policy.*?\n(.*?\n)+?\n")
                
                if ($orgIdAdditions.Count -gt 0) {
                    $orgIdSql = $orgIdAdditions -join "`n"
                    
                    # Append to migration file
                    $migrationPath = "supabase/migrations/20250621000001_multi_tenant_schema.sql"
                    Add-Content -Path $migrationPath -Value "`n-- Added from multi-tenant-analysis.md`n$orgIdSql"
                    
                    Write-Host "Updated $migrationPath with organization_id columns" -ForegroundColor Green
                    
                    # Re-run validation
                    npx ts-node tools/check-multi-tenant-schema.ts
                }
            }
        }
    }
}

# Generate ERD if supabase CLI is available
$supabaseCommand = Get-Command supabase -ErrorAction SilentlyContinue
if ($null -ne $supabaseCommand) {
    Write-Host "Generating ERD diagram..." -ForegroundColor Cyan
    supabase db diagram -o docs/diagrams/database-erd.png
    Write-Host "ERD generated at docs/diagrams/database-erd.png" -ForegroundColor Green
} else {
    Write-Host "Supabase CLI not found. Skipping ERD generation." -ForegroundColor Yellow
    Write-Host "To install Supabase CLI: npm install -g supabase" -ForegroundColor Yellow
}

Write-Host "`nSchema validation and update completed!" -ForegroundColor Green
Write-Host "Generated files:" -ForegroundColor Cyan
Write-Host "- docs/database-schema.md" -ForegroundColor White
Write-Host "- docs/supabase-usage-report.md" -ForegroundColor White
Write-Host "- docs/multi-tenant-analysis.md" -ForegroundColor White
Write-Host "- docs/migration-validation-report.md" -ForegroundColor White
if ($null -ne $supabaseCommand) {
    Write-Host "- docs/diagrams/database-erd.png" -ForegroundColor White
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review the generated reports for any issues" -ForegroundColor White
Write-Host "2. Fix any migration validation errors" -ForegroundColor White
Write-Host "3. Add organization_id column to tables that need multi-tenant support" -ForegroundColor White
Write-Host "4. Enable Row Level Security for all tables" -ForegroundColor White

# Exit with error code if validation failed
if ($validationExitCode -ne 0 -or $extractorExitCode -ne 0) {
    Write-Host "`nThere are errors in the migrations that need to be fixed." -ForegroundColor Red
    exit 1
}
