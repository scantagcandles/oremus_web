# 🤖 SZABLON ROZMOWY Z AI (CLAUDE)

## 📋 INSTRUKCJA KROK PO KROK:

### KROK 1: Skopiuj powitanie
```
Cześć Claude! Pracuję nad projektem Next.js/React/Supabase.
```

### KROK 2: Skopiuj CAŁĄ zawartość pliku PROJECT_MAP.md
**WAŻNE:** Otwórz plik `.ai-brain/PROJECT_MAP.md` i skopiuj CAŁĄ jego zawartość

### KROK 3: Dodaj swoje pytanie
```
Masz pełną mapę projektu. Przeanalizuj strukturę i pomóż mi:
[TUTAJ NAPISZ SWOJE PYTANIE]
```

---

## 💡 PRZYKŁADY PYTAŃ DOSTOSOWANYCH DO TWOJEGO PROJEKTU:

### 🚀 Dodawanie funkcji (Next.js/React):
- "Chcę dodać nową stronę do zarządzania użytkownikami - gdzie umieścić komponenty?"
- "Jak dodać nowy endpoint API do obsługi płatności masowych?"
- "Gdzie najlepiej dodać middleware do autoryzacji?"
- "Chcę stworzyć nowy hook do zarządzania stanem - gdzie go umieścić?"

### 🐛 Debugging problemów:
- "Komponent MassIntentionDashboard nie renderuje się - sprawdź zależności"
- "Błąd importu w services/massIntentionService.ts - co może być nie tak?"
- "Hook useAcademy nie działa poprawnie - przeanalizuj kod"
- "Problem z routingiem w app/(main) - gdzie szukać błędu?"

### 🔧 Refaktoring kodu:
- "Za dużo kodu w components/features - jak to uporządkować?"
- "Chcę wydzielić wspólne typy TypeScript - gdzie je umieścić?"
- "Jak zorganizować lepiej strukturę folderów services/?"
- "Które komponenty można połączyć lub uprościć?"

### 📊 Analiza architektury:
- "Przeanalizuj architekturę multi-tenant w tym projekcie"
- "Jak działa system płatności Stripe w aplikacji?"
- "Oceń jakość struktury komponentów React"
- "Zaproponuj ulepszenia dla systemu notyfikacji"

### 🧪 Testowanie:
- "Które komponenty najpilniej potrzebują testów?"
- "Jak napisać testy dla MassOrderingService?"
- "Zaproponuj strategię testowania dla hooks/"
- "Które funkcje API wymagają testów integracyjnych?"

### 📚 Dokumentacja:
- "Przygotuj dokumentację API na podstawie endpointów"
- "Stwórz przewodnik dla nowych deweloperów"
- "Opisz flow płatności w aplikacji"
- "Jak działa system akademii (kursy/lekcje)?"

---

## 🎯 DLACZEGO TA METODA DZIAŁA TAK DOBRZE?

✅ **Pełna mapa:** AI widzi każdy plik, funkcję i połączenie  
✅ **Kontekst projektu:** Rozumie architekturę Next.js/React/Supabase  
✅ **Dokładne lokalizacje:** Wskazuje konkretne pliki i linie  
✅ **Świadomość zależności:** Wie które komponenty się łączą  
✅ **Inteligentne sugestie:** Dopasowane do Twojego stylu kodu  
✅ **Unikanie duplikacji:** Nie tworzy już istniejących rozwiązań  

## 🔄 AKTUALIZACJA MAPY:

Po większych zmianach w kodzie uruchom ponownie:
```bash
python .ai-brain/universal_ai_brain.py
```

## 💎 ZAAWANSOWANE WSKAZÓWKI:

### Dla zadań związanych z Next.js:
- Wspomniej czy chodzi o App Router czy Pages Router
- Podaj czy potrzebujesz Server/Client Components
- Określ czy używasz TypeScript czy JavaScript

### Dla pracy z bazą danych:
- Wspomniej że używasz Supabase
- Podaj czy potrzebujesz RLS (Row Level Security)
- Określ czy chodzi o realtime subscriptions

### Dla komponentów UI:
- Wspomniej że używasz systemu design-system
- Podaj czy potrzebujesz glass effects
- Określ czy komponent ma być responsive

---

## 🚀 GOTOWE SZABLONY PYTAŃ:

### Quick Start:
```
Cześć! Mam pełną mapę projektu Next.js/React/Supabase.

[WKLEJ TUTAJ ZAWARTOŚĆ PROJECT_MAP.md]

Chcę [OPISZ CO CHCESZ ZROBIĆ] - gdzie dokładnie powinienem to umieścić i jak to zaimplementować?
```

### Debugging:
```
Mam problem z [NAZWA KOMPONENTY/FUNKCJI] w projekcie Next.js.

[WKLEJ TUTAJ ZAWARTOŚĆ PROJECT_MAP.md]

Błąd: [OPISZ BŁĄD]
Sprawdź zależności i zaproponuj rozwiązanie.
```

### Refactoring:
```
Chcę zrefaktorować [CZĘŚĆ KODU] w moim projekcie.

[WKLEJ TUTAJ ZAWARTOŚĆ PROJECT_MAP.md]

Jak najlepiej to zorganizować zachowując obecną architekturę?
```

---
*Wygenerowano: 2025-06-27 06:31:43 dla projektu: C:\oremus-web*
