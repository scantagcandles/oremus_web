# Oremus Web

System zarządzania intencjami mszalnymi dla parafii.

## Funkcje

- 🔒 Rejestracja i logowanie (Oremus, Google, Facebook, SSO)
- 📅 Intuicyjne zamawianie mszy (mapa, kalendarz, formularz intencji)
- 💳 Płatności online (Stripe, Przelewy24, BLIK, PayPal)
- 📱 Powiadomienia (email, SMS, push)
- 📊 Panel administratora z analityką
- 🔄 Śledzenie statusu w czasie rzeczywistym
- 📈 Zaawansowane monitorowanie

## Technologie

- Frontend: Next.js, React, TailwindCSS
- Backend: Supabase (PostgreSQL)
- Płatności: Stripe / Przelewy24 / BLIK / PayPal
- Auth: Supabase Auth
- Email: Nodemailer
- Testing: Jest, React Testing Library

## Wymagania

- Node.js 20+
- NPM 9+
- Git

## Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/twoj-org/oremus-web.git
cd oremus-web
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe:
```bash
cp .env.example .env.local
```

4. Uzupełnij `.env.local` o wymagane wartości:
```env
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
EMAIL_HOST=xxx
EMAIL_PORT=xxx
EMAIL_USER=xxx
EMAIL_PASSWORD=xxx
EMAIL_FROM=xxx
```

5. Uruchom migracje bazy danych:
```bash
npm run db:migrate
```

6. Uruchom serwer deweloperski:
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

## Dokumentacja

### Struktura projektu

```
oremus-web/
├── app/                     # Routing i strony Next.js
├── components/             # Komponenty React
├── hooks/                  # Custom hooks
├── lib/                    # Biblioteki i konfiguracja
├── public/                 # Statyczne zasoby
├── services/              # Serwisy biznesowe
├── styles/                # Style globalne
├── types/                 # TypeScript types
└── utils/                 # Narzędzia pomocnicze
```

### Główne moduły

#### Zamawianie mszy

System umożliwia:
- Wybór kościoła na mapie
- Przeglądanie kalendarza dostępności
- Wypełnienie formularza intencji
- Płatność online
- Otrzymanie potwierdzenia

#### Panel administratora

Administratorzy mogą:
- Zarządzać intencjami
- Przeglądać płatności
- Analizować statystyki
- Monitorować system

### API

Dokumentacja API jest dostępna po uruchomieniu projektu pod:
`http://localhost:3000/api/docs`

## Testy

```bash
# Uruchom wszystkie testy
npm test

# Uruchom testy w trybie watch
npm run test:watch

# Sprawdź pokrycie kodu testami
npm run test:coverage
```

## CI/CD

Projekt używa GitHub Actions do:
- Sprawdzania typów TypeScript
- Lintowania kodu
- Uruchamiania testów
- Automatycznego deploymentu na Vercel

## Licencja

Copyright (c) 2025
