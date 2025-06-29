# Update-Schema-With-ERD.ps1
# Script to update database schema and generate ERD

Write-Host "🚀 Oremus DB Schema Update & ERD Generator" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Create docs/diagrams directory if it doesn't exist
if (-not (Test-Path -Path "docs/diagrams")) {
    Write-Host "Creating docs/diagrams directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "docs/diagrams" -Force | Out-Null
}

# Step 1: Extract Schema from TypeScript Types
Write-Host "Step 1: Extracting schema from TypeScript types..." -ForegroundColor Green
npx ts-node tools/schema-extractor.ts

# Step 2: Detect Table Usage
Write-Host "Step 2: Detecting table usage in code..." -ForegroundColor Green
npx ts-node tools/detect-table-usage.ts

# Step 3: Generate ERD
Write-Host "Step 3: Attempting to generate ERD..." -ForegroundColor Green
if (Get-Command "supabase" -ErrorAction SilentlyContinue) {
    Write-Host "Supabase CLI found, generating ERD..." -ForegroundColor Yellow
    supabase db diagram -o docs/diagrams/database-erd.png
    if (Test-Path -Path "docs/diagrams/database-erd.png") {
        Write-Host "ERD generated successfully at docs/diagrams/database-erd.png" -ForegroundColor Green
    } else {
        Write-Host "ERD generation failed. Check Supabase CLI configuration." -ForegroundColor Red
    }
} else {
    Write-Host "Supabase CLI not found. Install it with 'npm install -g supabase'" -ForegroundColor Red
    Write-Host "Then run 'supabase login' to authenticate" -ForegroundColor Yellow
}

# Step 4: Check for Multi-Tenant Schema
Write-Host "Step 4: Checking for Multi-Tenant Tables..." -ForegroundColor Green
$schemaFile = Get-Content "supabase/migrations/00000000000000_oremus_schema.sql" -Raw
$hasOrganizations = $schemaFile -match "CREATE TABLE IF NOT EXISTS organizations"
$hasMemberships = $schemaFile -match "CREATE TABLE IF NOT EXISTS memberships"

if ($hasOrganizations -and $hasMemberships) {
    Write-Host "✅ Multi-tenant schema detected." -ForegroundColor Green
} else {
    Write-Host "❌ Multi-tenant schema not detected." -ForegroundColor Yellow
    Write-Host "Consider adding organizations and memberships tables for multi-tenancy." -ForegroundColor Yellow
    Write-Host "See the roadmap in 'biblia oremus na teraz 2106g1800.txt' for details." -ForegroundColor Yellow
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Schema update complete! Files generated:" -ForegroundColor Cyan
Write-Host "- supabase/migrations/00000000000000_oremus_schema.sql" -ForegroundColor White
Write-Host "- docs/database-schema.md" -ForegroundColor White
Write-Host "- docs/supabase-usage-report.md" -ForegroundColor White
if (Test-Path -Path "docs/diagrams/database-erd.png") {
    Write-Host "- docs/diagrams/database-erd.png" -ForegroundColor White
}
