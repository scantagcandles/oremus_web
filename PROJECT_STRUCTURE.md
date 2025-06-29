# Oremus Web Application Structure

## Core Features

1. Authentication & Authorization
   - User registration (individual & parish)
   - Login/Logout
   - Role-based access control
   - Multi-tenant support

2. Prayer Features
   - Virtual Candles
   - Prayer Player
   - Prayer Map
   - Rosary
   - Novena
   - Adoration

3. Mass Intentions
   - Mass Order Form
   - Intention Dashboard
   - Schedule Management
   - Payment Integration

4. Parish Management
   - Parish Dashboard
   - Priest Management
   - Announcement System
   - Analytics & Reports

5. E-commerce
   - Shop
   - Payment Processing
   - Order Management
   - Refunds

## Directory Structure

```
oremus-web/
├── app/                      # Next.js 13+ App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (main)/              # Main application routes
│   │   ├── academy/
│   │   ├── candle/
│   │   ├── library/
│   │   ├── mass/
│   │   └── prayer/
│   ├── admin/               # Admin panel routes
│   │   ├── dashboard/
│   │   ├── intentions/
│   │   └── monitoring/
│   ├── api/                 # API routes
│   │   ├── payments/
│   │   ├── notifications/
│   │   └── webhooks/
│   └── layout.tsx           # Root layout

├── components/              # React Components
│   ├── admin/              # Admin components
│   │   ├── Dashboard.tsx
│   │   └── analytics/
│   ├── common/             # Shared components
│   │   ├── Logo.tsx
│   │   └── ui/
│   ├── features/           # Feature-specific components
│   │   ├── candle/
│   │   ├── mass/
│   │   └── prayer/
│   ├── glass/              # Glassmorphic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── layout/             # Layout components
│       └── Navigation.tsx

├── configs/                # Configuration files
│   └── supabase.ts        # Supabase configuration

├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useTenant.ts
│   └── usePayment.ts

├── lib/                    # Utility libraries
│   ├── constants.ts
│   ├── utils.ts
│   └── validators.ts

├── services/              # Business logic services
│   ├── audioService.ts
│   ├── candleService.ts
│   ├── massService.ts
│   ├── notificationService.ts
│   └── paymentService.ts

├── styles/               # Global styles
│   └── globals.css

├── types/                # TypeScript type definitions
│   ├── api.ts
│   ├── models.ts
│   └── supabase.ts

└── public/              # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

## Key Technologies

- Next.js 13+ (App Router)
- TypeScript
- Supabase (Authentication & Database)
- TailwindCSS
- Framer Motion
- Stripe (Payments)

## Main Components

1. `Navigation.tsx`
   - Complete navigation system
   - Role-based menu items
   - Responsive design

2. `Logo.tsx`
   - Customizable logo component
   - Multiple variants and sizes
   - Animation support

3. Glass UI Components
   - `GlassButton.tsx`
   - `GlassCard.tsx`
   - `GlassInput.tsx`
   - Modern, glassmorphic design

4. Feature Components
   - `VirtualCandle.tsx`
   - `PrayerPlayer.tsx`
   - `MassOrderForm.tsx`
   - `IntentionDashboard.tsx`

## Services

1. Authentication Service
   - User management
   - Session handling
   - Multi-tenant support

2. Payment Service
   - Stripe integration
   - Payment processing
   - Refund handling

3. Notification Service
   - Real-time notifications
   - Email notifications
   - Push notifications

4. Mass Intention Service
   - Intention management
   - Scheduling
   - Priest assignment

## Database Schema

1. Users Table
   - Basic user information
   - Authentication details
   - Role management

2. Parishes Table
   - Parish information
   - Priest assignments
   - Location data

3. Mass Intentions Table
   - Intention details
   - Scheduling information
   - Payment status

4. Virtual Candles Table
   - Candle status
   - Duration
   - User association

## API Routes

1. Authentication
   - `/api/auth/*`
   - Login/Register endpoints
   - Session management

2. Payments
   - `/api/payments/*`
   - Payment processing
   - Webhook handlers

3. Mass Intentions
   - `/api/intentions/*`
   - CRUD operations
   - Scheduling endpoints

4. Notifications
   - `/api/notifications/*`
   - Push notification endpoints
   - Email notification handlers

## Testing

- Jest for unit tests
- React Testing Library for component tests
- Integration tests for critical flows
- E2E tests with Cypress (planned)

## Deployment

- Vercel for frontend
- Supabase for backend
- CloudFlare for CDN
- Monitoring with custom dashboard

## Security Features

1. Authentication
   - JWT tokens
   - Role-based access
   - Session management

2. Data Protection
   - Input validation
   - XSS protection
   - CSRF protection

3. API Security
   - Rate limiting
   - Request validation
   - Error handling

## Performance Optimizations

1. Frontend
   - Code splitting
   - Image optimization
   - Lazy loading

2. Backend
   - Caching
   - Database optimization
   - CDN integration
