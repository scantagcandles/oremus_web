# Supabase Table Usage Report

Generated on: June 21, 2025

## Tables Used in Codebase

### users

**Operations:** select, insert, update

**Files:**

- `contexts/AuthContext.tsx`
- `app/auth/register/page.tsx`
- `services/notifications/NotificationService.ts`
- `services/notifications/NotificationTaskService.ts`

### candles

**Operations:** select, insert, update, delete

**Files:**

- `services/candleService.ts`
- `supabase/functions/send-candle-notification/index.ts`
- `supabase/functions/process-nfc/index.ts`
- `hooks/useCandleNotifications.ts`

### masses

**Operations:** select, insert, update

**Files:**

- `services/massService.ts`
- `app/api/webhooks/stripe/route.ts`
- `services/notificationService.ts`
- `src/components/test/SupabaseTest.jsx`

### audio_tracks

**Operations:** select

**Files:**

- `services/audioService.ts`
- `hooks/useProgress.ts`

### user_progress

**Operations:** select, insert, update

**Files:**

- `hooks/useProgress.ts`
- `services/audioService.ts`

### user_favorites

**Operations:** select, insert, delete

**Files:**

- `services/favoriteService.ts`
- `hooks/useFavorites.ts`

### mass_intentions

**Operations:** select, insert, update

**Files:**

- `hooks/useMassIntentions.ts`
- `src/features/mass-ordering/service.ts`
- `services/massIntentionService.ts`

### churches

**Operations:** select

**Files:**

- `src/features/mass-ordering/service.ts`
- `components/mass/ChurchSelector.tsx`

### analytics_events

**Operations:** insert, select

**Files:**

- `services/analyticsService.ts`
- `services/analytics/AnalyticsService.ts`

### feature_flags

**Operations:** select

**Files:**

- `src/services/featureFlagService.ts`

### courses

**Operations:** select, insert, update

**Files:**

- `app/api/academy/courses/route.ts`
- `app/api/academy/courses/[id]/route.ts`

## Summary

Total tables detected: 20
