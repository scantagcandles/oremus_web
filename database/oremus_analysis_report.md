# OREMUS Database Analysis Report
Generated: 2025-06-25T05:22:33.406Z

## Executive Summary
- **Total Tables:** 15
- **Total Columns:** 166
- **Total Relationships:** 25
- **Multi-tenant Ready:** 7 tables

## Tables by Category
### AUTH (1 tables)
- **users**: 11 columns, 0 relations

### CORE (3 tables)
- **organizations**: 17 columns, 0 relations
- **memberships**: 10 columns, 3 relations
- **churches**: 15 columns, 1 relations

### BUSINESS (3 tables)
- **payments**: 12 columns, 2 relations
- **mass_intentions**: 12 columns, 5 relations
- **oremus_candles**: 11 columns, 2 relations

### CONTENT (5 tables)
- **prayers**: 12 columns, 1 relations
- **courses**: 13 columns, 1 relations
- **quizzes**: 7 columns, 1 relations
- **community_posts**: 11 columns, 2 relations
- **prayer_requests**: 9 columns, 2 relations

### ANALYTICS (2 tables)
- **user_prayers**: 7 columns, 2 relations
- **user_progress**: 10 columns, 2 relations

### SYSTEM (1 tables)
- **notifications**: 9 columns, 1 relations

## Detailed Table Analysis

### users
**Category:** auth
**Source Files:** project-analysis, parish.ts, AuthService.ts

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `email`: TEXT NOT NULL UNIQUE
- `password_hash`: TEXT NULL
- `first_name`: TEXT NULL
- `last_name`: TEXT NULL
- `role`: TEXT NOT NULL DEFAULT 'user'
- `email_verified`: BOOLEAN NOT NULL DEFAULT false
- `two_factor_enabled`: BOOLEAN NOT NULL DEFAULT false
- `last_login`: TIMESTAMP NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMP NOT NULL DEFAULT now()

### organizations
**Category:** core
**Source Files:** project-analysis, multi-tenant.ts, organizationService.ts

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `name`: TEXT NOT NULL
- `slug`: TEXT NOT NULL UNIQUE
- `custom_domain`: TEXT NULL UNIQUE
- `status`: TEXT NOT NULL DEFAULT 'pending'
- `plan`: TEXT NOT NULL DEFAULT 'basic'
- `contact_email`: TEXT NOT NULL
- `phone`: TEXT NULL
- `address`: TEXT NULL
- `city`: TEXT NULL
- `postal_code`: TEXT NULL
- `nip`: TEXT NULL
- `regon`: TEXT NULL
- `settings`: JSONB NOT NULL DEFAULT '{}'
- `branding`: JSONB NOT NULL DEFAULT '{}'
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMP NOT NULL DEFAULT now()

### memberships
**Category:** core
**Source Files:** project-analysis, multi-tenant.ts

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `user_id`: UUID NOT NULL → users.id
- `organization_id`: UUID NOT NULL → organizations.id
- `role`: TEXT NOT NULL
- `permissions`: JSONB NOT NULL DEFAULT '{}'
- `status`: TEXT NOT NULL DEFAULT 'active'
- `invited_by`: UUID NULL → users.id
- `invited_at`: TIMESTAMP NULL
- `joined_at`: TIMESTAMP NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `organization_id` → `organizations.id` (ON DELETE CASCADE)
- `invited_by` → `users.id` (ON DELETE CASCADE)

### payments
**Category:** business
**Source Files:** project-analysis, payment.ts, PaymentService.ts, paymentService.ts, PaymentStatusService.ts

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `user_id`: UUID NOT NULL → users.id
- `organization_id`: UUID NULL → organizations.id
- `stripe_payment_id`: TEXT NULL
- `amount`: INTEGER NOT NULL
- `currency`: TEXT NOT NULL DEFAULT 'PLN'
- `status`: TEXT NOT NULL
- `type`: TEXT NOT NULL
- `description`: TEXT NULL
- `metadata`: JSONB NOT NULL DEFAULT '{}'
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `organization_id` → `organizations.id` (ON DELETE CASCADE)

### mass_intentions
**Category:** business
**Source Files:** project-analysis, mass-intention.ts, mass.ts, parish.ts, MassIntentionService.ts, useMassIntentions.ts, MassOrderingService.ts, MassService.ts, massIntentionService.ts

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `user_id`: UUID NOT NULL → users.id
- `organization_id`: UUID NOT NULL → organizations.id
- `church_id`: UUID NULL → churches.id
- `intention_text`: TEXT NOT NULL
- `mass_date`: TIMESTAMP NOT NULL
- `status`: TEXT NOT NULL DEFAULT 'pending'
- `payment_id`: UUID NULL → payments.id
- `priest_id`: UUID NULL → users.id
- `amount`: INTEGER NOT NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `organization_id` → `organizations.id` (ON DELETE CASCADE)
- `church_id` → `churches.id` (ON DELETE CASCADE)
- `payment_id` → `payments.id` (ON DELETE CASCADE)
- `priest_id` → `users.id` (ON DELETE CASCADE)

### oremus_candles
**Category:** business
**Source Files:** project-analysis, candle.ts, CandleService.ts

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `nfc_tag_id`: TEXT NULL UNIQUE
- `user_id`: UUID NOT NULL → users.id
- `organization_id`: UUID NULL → organizations.id
- `purchase_date`: TIMESTAMP NOT NULL
- `status`: TEXT NOT NULL
- `intention`: TEXT NULL
- `duration_hours`: INTEGER NOT NULL DEFAULT 24
- `lit_at`: TIMESTAMP NULL
- `extinguished_at`: TIMESTAMP NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `organization_id` → `organizations.id` (ON DELETE CASCADE)

### churches
**Category:** core
**Source Files:** project-analysis, church.ts, mass.ts, MassService.ts

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `organization_id`: UUID NOT NULL → organizations.id
- `name`: TEXT NOT NULL
- `address`: TEXT NOT NULL
- `city`: TEXT NOT NULL
- `postal_code`: TEXT NULL
- `country`: TEXT NOT NULL DEFAULT 'Poland'
- `latitude`: DECIMAL NULL
- `longitude`: DECIMAL NULL
- `phone`: TEXT NULL
- `email`: TEXT NULL
- `website`: TEXT NULL
- `masses_schedule`: JSONB NOT NULL DEFAULT '{}'
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `organization_id` → `organizations.id` (ON DELETE CASCADE)

### prayers
**Category:** content
**Source Files:** project-analysis

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `name`: TEXT NOT NULL
- `type`: TEXT NOT NULL
- `content`: TEXT NOT NULL
- `audio_url`: TEXT NULL
- `duration`: INTEGER NULL
- `category`: TEXT NOT NULL
- `language`: TEXT NOT NULL DEFAULT 'pl'
- `is_public`: BOOLEAN NOT NULL DEFAULT true
- `created_by`: UUID NULL → users.id
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `created_by` → `users.id` (ON DELETE CASCADE)

### user_prayers
**Category:** analytics
**Source Files:** project-analysis

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `user_id`: UUID NOT NULL → users.id
- `prayer_id`: UUID NOT NULL → prayers.id
- `completed_at`: TIMESTAMP NULL
- `streak_count`: INTEGER NOT NULL DEFAULT 0
- `last_prayed_at`: TIMESTAMP NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `prayer_id` → `prayers.id` (ON DELETE CASCADE)

### courses
**Category:** content
**Source Files:** project-analysis, CourseMetrics.tsx, academyService.ts

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `title`: TEXT NOT NULL
- `description`: TEXT NULL
- `category`: TEXT NOT NULL
- `lessons_count`: INTEGER NOT NULL DEFAULT 0
- `price`: INTEGER NOT NULL DEFAULT 0
- `difficulty_level`: TEXT NOT NULL DEFAULT 'beginner'
- `duration_minutes`: INTEGER NULL
- `thumbnail_url`: TEXT NULL
- `is_published`: BOOLEAN NOT NULL DEFAULT false
- `created_by`: UUID NOT NULL → users.id
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `created_by` → `users.id` (ON DELETE CASCADE)

### user_progress
**Category:** analytics
**Source Files:** project-analysis

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `user_id`: UUID NOT NULL → users.id
- `course_id`: UUID NOT NULL → courses.id
- `lesson_id`: UUID NULL
- `completed`: BOOLEAN NOT NULL DEFAULT false
- `score`: INTEGER NULL
- `time_spent_minutes`: INTEGER NOT NULL DEFAULT 0
- `last_accessed_at`: TIMESTAMP NULL
- `completed_at`: TIMESTAMP NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `course_id` → `courses.id` (ON DELETE CASCADE)

### quizzes
**Category:** content
**Source Files:** project-analysis

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `course_id`: UUID NOT NULL → courses.id
- `questions`: JSONB NOT NULL
- `correct_answers`: JSONB NOT NULL
- `passing_score`: INTEGER NOT NULL DEFAULT 70
- `time_limit_minutes`: INTEGER NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `course_id` → `courses.id` (ON DELETE CASCADE)

### community_posts
**Category:** content
**Source Files:** project-analysis

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `user_id`: UUID NOT NULL → users.id
- `organization_id`: UUID NULL → organizations.id
- `content`: TEXT NOT NULL
- `type`: TEXT NOT NULL
- `prayer_request`: BOOLEAN NOT NULL DEFAULT false
- `anonymous`: BOOLEAN NOT NULL DEFAULT false
- `is_public`: BOOLEAN NOT NULL DEFAULT true
- `likes_count`: INTEGER NOT NULL DEFAULT 0
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `organization_id` → `organizations.id` (ON DELETE CASCADE)

### prayer_requests
**Category:** content
**Source Files:** project-analysis

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `user_id`: UUID NOT NULL → users.id
- `organization_id`: UUID NULL → organizations.id
- `request_text`: TEXT NOT NULL
- `status`: TEXT NOT NULL DEFAULT 'active'
- `response_count`: INTEGER NOT NULL DEFAULT 0
- `anonymous`: BOOLEAN NOT NULL DEFAULT false
- `expires_at`: TIMESTAMP NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `organization_id` → `organizations.id` (ON DELETE CASCADE)

### notifications
**Category:** system
**Source Files:** project-analysis, notifications.ts, NotificationService.ts, NotificationTaskService.ts, notificationService.ts

**Columns:**
- `id`: UUID NOT NULL DEFAULT uuid_generate_v4()
- `user_id`: UUID NOT NULL → users.id
- `type`: TEXT NOT NULL
- `title`: TEXT NOT NULL
- `message`: TEXT NOT NULL
- `data`: JSONB NOT NULL DEFAULT '{}'
- `read_at`: TIMESTAMP NULL
- `sent_at`: TIMESTAMP NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT now()

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)

## Recommendations
- Add 'updated_at' timestamp to table 'memberships'
- Add 'updated_at' timestamp to table 'oremus_candles'
- Add 'updated_at' timestamp to table 'user_prayers'
- Add 'updated_at' timestamp to table 'user_progress'
- Add 'updated_at' timestamp to table 'quizzes'
- Add 'updated_at' timestamp to table 'prayer_requests'
