# Skrypt automatyzujący zarządzanie schematem Supabase
# Działa w oparciu o wykrywanie tabel w kodzie oraz typy z TypeScript

# Krok 1: Wykryj tabele używane w kodzie
Write-Host "Krok 1: Wykrywanie tabel Supabase używanych w kodzie..." -ForegroundColor Green
npm run db:detect-tables

# Krok 2: Przeprowadź analizę typów z types/supabase.ts
Write-Host "Krok 2: Analiza typów z TypeScript..." -ForegroundColor Green
Write-Host "Ten krok wymaga poprawnego działania narzędzia schema-extractor.ts" -ForegroundColor Yellow
Write-Host "Obecnie pomijamy ten krok ze względu na problemy z konfiguracją TypeScript" -ForegroundColor Yellow

# Krok 3: Wyświetl podsumowanie
Write-Host "Krok 3: Podsumowanie analizy bazy danych:" -ForegroundColor Green
$tableCount = (Get-Content "docs\supabase-tables-report.md" | Select-String "Total tables detected:" | ForEach-Object { $_ -replace "Total tables detected: ", "" }).Trim()
Write-Host "Wykryto $tableCount tabel w kodzie" -ForegroundColor Cyan

# Krok 4: Opcje dla użytkownika
Write-Host "Krok 4: Co chcesz zrobić dalej?" -ForegroundColor Green
Write-Host "1. Zastosuj migracje lokalnie (wymaga działającego Supabase CLI)" -ForegroundColor White
Write-Host "2. Zastosuj migracje do produkcji (wymaga działającego Supabase CLI)" -ForegroundColor White
Write-Host "3. Wygeneruj diagram ERD (wymaga działającego Supabase CLI)" -ForegroundColor White
Write-Host "4. Zakończ" -ForegroundColor White

$option = Read-Host "Wybierz opcję (1-4)"

switch ($option) {
    "1" { 
        Write-Host "Zastosowanie migracji lokalnie..." -ForegroundColor Cyan
        Write-Host "Komenda: supabase db reset" -ForegroundColor Yellow
        Write-Host "Aby wykonać tę komendę, uruchom: npm run db:migrate" -ForegroundColor White
    }
    "2" { 
        Write-Host "Zastosowanie migracji do produkcji..." -ForegroundColor Cyan
        Write-Host "Komenda: supabase db push" -ForegroundColor Yellow
        Write-Host "Ta operacja wymaga odpowiedniej konfiguracji Supabase CLI" -ForegroundColor White
    }
    "3" { 
        Write-Host "Generowanie diagramu ERD..." -ForegroundColor Cyan
        Write-Host "Komenda: supabase db diagram -o docs/database-erd.png" -ForegroundColor Yellow
        Write-Host "Aby wykonać tę komendę, uruchom: npm run db:erd" -ForegroundColor White
    }
    "4" { 
        Write-Host "Zakończono proces zarządzania schematem." -ForegroundColor Green
    }
    default { 
        Write-Host "Nieprawidłowa opcja. Zakończono proces." -ForegroundColor Red
    }
}

Write-Host "Wygenerowane pliki:" -ForegroundColor Cyan
Write-Host "- supabase/migrations/00000000000000_detected_tables.sql" -ForegroundColor White
Write-Host "- docs/supabase-tables-report.md" -ForegroundColor White

Write-Host "Gotowe!" -ForegroundColor Green
