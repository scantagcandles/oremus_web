# Prosty skrypt automatyzujący zarządzanie schematem Supabase

Write-Host "Uruchamiam detekcję tabel Supabase..." -ForegroundColor Green
npm run db:detect-tables

Write-Host "Wygenerowane pliki:" -ForegroundColor Cyan
Write-Host "- supabase/migrations/00000000000000_detected_tables.sql" -ForegroundColor White
Write-Host "- docs/supabase-tables-report.md" -ForegroundColor White

Write-Host "Gotowe! Tabele Supabase zostały wykryte i wygenerowano odpowiednie pliki." -ForegroundColor Green
