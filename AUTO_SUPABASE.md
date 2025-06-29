# 🚀 Auto Supabase System dla Oremus

## 🎯 Cel Systemu

Auto Supabase to kompletny system automatyzacji zarządzania bazą danych Supabase dla projektu Oremus. Zastępuje wszystkie skrypty z folderu `tools/` (ponad 4000 linii kodu) jednym, eleganckim rozwiązaniem opartym na standardowych narzędziach.

## ✨ Funkcje

### 🔄 Pełna Automatyzacja

- **Migracje** - Automatyczne stosowanie zmian schematu
- **Typy TypeScript** - Generowanie i synchronizacja typów
- **Serwisy** - Aktualizacja importów i kompatybilności
- **Testy** - Walidacja integracji po każdej zmianie
- **Dokumentacja** - Auto-generowanie raportów

### 🛡️ Bezpieczeństwo

- Walidacja migracji przed wdrożeniem
- Wykrywanie breaking changes
- Backup przed krytycznymi zmianami
- Rollback w przypadku błędów

### 📊 Monitoring

- Szczegółowe raporty wdrożeń
- Metryki wydajności
- Analiza kompatybilności
- Historia zmian

## 🚀 Szybki Start

### 1. Konfiguracja GitHub Secrets

W ustawieniach repozytorium (Settings > Secrets and variables > Actions) dodaj:

```
SUPABASE_ACCESS_TOKEN=sb_xxx
SUPABASE_DB_PASSWORD=xxx
PROJECT_ID=xxx
```

### 2. Instalacja Lokalnej

```bash
# Zainstaluj Supabase CLI
npm install -g supabase

# Zainstaluj zależności
npm install

# Połącz z projektem
supabase link --project-ref YOUR_PROJECT_ID

# Uruchom pierwszy sync
npm run auto-supabase:sync
```

### 3. Pierwszy Test

```bash
# Uruchom kompletne środowisko dev
npm run dev:full

# Lub krok po kroku
npm run db:start
npm run auto-supabase:types
npm run dev
```

## 🔄 Workflow Dewelopera

### Dodawanie Nowej Funkcji z Tabelą

```bash
# 1. Uruchom lokalne środowisko
npm run db:start

# 2. Dodaj zmiany w lokalnej bazie (przez Studio lub SQL)
# http://localhost:54323

# 3. Wygeneruj migrację
npm run db:diff -- -f add_new_feature

# 4. Zatwierdź zmiany
git add .
git commit -m "feat: Add new feature with database schema"
git push
```

### Auto Supabase automatycznie:

1. ✅ Waliduje migrację
2. 🚀 Wdraża na produkcję
3. 📝 Generuje typy TypeScript
4. 🔧 Aktualizuje serwisy
5. 🧪 Uruchamia testy
6. 📊 Tworzy raport

## 📋 Dostępne Komendy

### 🤖 Auto Supabase

```bash
npm run auto-supabase:sync      # Pełna synchronizacja
npm run auto-supabase:types     # Tylko typy
npm run auto-supabase:services  # Tylko serwisy
npm run auto-supabase:report    # Raport stanu
```

### 🗄️ Baza Danych

```bash
npm run db:start               # Uruchom lokalnie
npm run db:reset              # Reset do aktualnego stanu
npm run db:diff -- -f nazwa   # Wygeneruj migrację
npm run db:push               # Wdróż migracje
```

### 📝 Typy

```bash
npm run types:generate        # Wygeneruj typy
npm run types:watch          # Obserwuj zmiany
npm run types:validate       # Sprawdź poprawność
```

### 🔧 Development

```bash
npm run dev:full             # Pełne środowisko dev
npm run dev:fresh           # Reset i fresh start
npm run validate:all        # Sprawdź wszystko
```

## 📁 Struktura Plików

```
.github/workflows/
├── auto-supabase.yml          # 🚀 Główny workflow
└── ci.yml                     # Istniejący CI

scripts/
└── auto-supabase.ts           # 🤖 Lokalny manager

supabase/
├── migrations/                # 📝 Migracje SQL
├── seed.sql                   # 🌱 Dane testowe
└── config.toml               # ⚙️ Konfiguracja

types/
├── supabase-generated.ts      # 🤖 Auto-generowane typy
└── generated/                 # 📁 Wyspecjalizowane typy
    ├── mass-types.ts
    ├── payment-types.ts
    └── academy-types.ts
```

## 🔧 Konfiguracja

### Environment Variables

```bash
# .env.local
PROJECT_ID=your-supabase-project-id
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
```

### Auto Supabase Config

```typescript
// scripts/auto-supabase.config.ts
export const config = {
  projectId: process.env.PROJECT_ID,
  features: {
    autoMigrate: true,
    autoGenerateTypes: true,
    autoUpdateServices: true,
    backupBeforeChange: true,
  },
};
```

## 🧪 Testing

### Lokalne Testy

```bash
npm run test:integration      # Testy integracji z bazą
npm run test:auth            # Testy autoryzacji
npm run test:mass-intentions # Testy intencji mszalnych
```

### CI/CD Testy

- ✅ Walidacja migracji
- ✅ Testy kompatybilności typów
- ✅ Testy integracji serwisów
- ✅ Performance checks

## 📊 Monitoring i Raporty

### Automatyczne Raporty

- `AUTO_SUPABASE_REPORT.md` - Główny raport wdrożenia
- `TYPES_REPORT.md` - Raport typów TypeScript
- `SERVICE_COMPATIBILITY_REPORT.md` - Kompatybilność serwisów

### Metryki

- Czas wdrożenia
- Liczba zmian w schemacie
- Breaking changes
- Test coverage

## 🚨 Troubleshooting

### Częste Problemy

**1. Migration failed**

```bash
# Sprawdź logs
npm run db:reset
npm run validate:migrations
```

**2. Type errors po aktualizacji**

```bash
# Przebuduj typy
npm run cleanup:types
npm run validate:types
```

**3. Service compatibility issues**

```bash
# Aktualizuj serwisy
npm run auto-supabase:services
npm run validate:services
```

### Debug Mode

```bash
# Uruchom z debugiem
DEBUG=true npm run auto-supabase:sync

# Sprawdź szczegółowe logi
npm run auto-supabase:report
```

## 🔄 Migration z Obecnych Tools

### Zastępowane Skrypty

```bash
# Stare (tools/) → Nowe (Auto Supabase)
tools/auto-database-analyzer.ts     → Wbudowane w workflow
tools/schema-extractor.ts           → supabase db diff
tools/supabase-schema-manager.ts    → GitHub Actions
tools/detect-supabase-tables.js     → Auto-generowane typy
tools/validate-migrations.ts        → supabase db reset
```

### Plan Migracji

1. ✅ Zainstaluj Auto Supabase
2. ⚡ Przetestuj na gałęzi development
3. 🚀 Wdróż na staging
4. 📦 Usuń stare skrypty z tools/
5. 📚 Zaktualizuj dokumentację

## 🤝 Współpraca z Zespołem

### Onboarding Nowego Dewelopera

```bash
# 1. Clone repo
git clone https://github.com/oremus/oremus-web.git

# 2. Setup środowiska
npm install
npm run auto-supabase:sync

# 3. Uruchom dev environment
npm run dev:full
```

### Code Review Guidelines

- ✅ Sprawdź czy migracje są w commicie
- ✅ Zweryfikuj typy TypeScript
- ✅ Sprawdź kompatybilność serwisów
- ✅ Upewnij się że testy przechodzą

## 🎯 Następne Kroki

### Planned Features

- 🔄 **Hot reload** - Real-time sync podczas devu
- 🏗️ **Schema versioning** - Wersjonowanie schematu
- 🔍 **Performance monitoring** - Monitoring wydajności zapytań
- 🤖 **AI suggestions** - AI-powered optymalizacje
- 📱 **Mobile notifications** - Powiadomienia o wdrożeniach

### Roadmap

- **Q1 2025**: Pełna integracja z istniejącymi narzędziami
- **Q2 2025**: Advanced monitoring i analytics
- **Q3 2025**: AI-powered schema optimization
- **Q4 2025**: Multi-environment management

## 📞 Support

### Dokumentacja

- 📚 [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
- 🔧 [GitHub Actions Docs](https://docs.github.com/en/actions)
- 📝 [TypeScript Docs](https://www.typescriptlang.org/docs/)

### Help & Issues

- 🐛 [Report Bug](https://github.com/oremus/issues/new?template=bug.md)
- 💡 [Feature Request](https://github.com/oremus/issues/new?template=feature.md)
- 💬 [Discord Community](https://discord.gg/oremus)

---

## 🎉 Podsumowanie

Auto Supabase System dla Oremus to kompletne rozwiązanie które:

✅ **Zastępuje** 4000+ linii niestandardowych skryptów  
✅ **Automatyzuje** cały lifecycle bazy danych  
✅ **Zwiększa** bezpieczeństwo i niezawodność  
✅ **Przyspiesza** development i deployment  
✅ **Upraszcza** pracę zespołu

**Result**: Zespół może się skupić na budowaniu funkcji zamiast zarządzania bazą danych! 🚀
