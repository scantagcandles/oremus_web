-- OREMUS Database Schema
-- Generated automatically from code analysis
-- Generated at: 2025-06-25T05:22:36.859Z

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create tables
CREATE TABLE IF NOT EXISTS windows (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  workbox JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE windows IS 'Generated from: types\window.d.ts';

CREATE TABLE IF NOT EXISTS databases (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  public TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  Tables TEXT NOT NULL,
  users TEXT NOT NULL,
  Row TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL
);
COMMENT ON TABLE databases IS 'Generated from: types\supabase.ts';

CREATE TABLE IF NOT EXISTS pushserviceconfigs (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  applicationServerKey TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  userVisibleOnly BOOLEAN NOT NULL
);
COMMENT ON TABLE pushserviceconfigs IS 'Generated from: types\push-notification.d.ts';

CREATE TABLE IF NOT EXISTS pushsubscriptionkeyses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  p256dh TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  auth TEXT NOT NULL
);
COMMENT ON TABLE pushsubscriptionkeyses IS 'Generated from: types\push-notification.d.ts';

CREATE TABLE IF NOT EXISTS pushsubscriptionjsons (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  expirationTime INTEGER NOT NULL,
  keys TEXT NOT NULL
);
COMMENT ON TABLE pushsubscriptionjsons IS 'Generated from: types\push-notification.d.ts';

CREATE TABLE IF NOT EXISTS pushsubscriptions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  options TEXT NOT NULL,
  name TEXT NOT NULL,
  keys TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL
);
COMMENT ON TABLE pushsubscriptions IS 'Generated from: types\push-notification.d.ts, supabase\functions\send-push-notification\index.ts, supabase\functions\send-push\index.ts';

CREATE TABLE IF NOT EXISTS pushmanagers (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  options TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE pushmanagers IS 'Generated from: types\push-notification.d.ts';

CREATE TABLE IF NOT EXISTS serviceworkerregistrations (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  pushManager TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  options TEXT
);
COMMENT ON TABLE serviceworkerregistrations IS 'Generated from: types\push-notification.d.ts';

CREATE TABLE IF NOT EXISTS serviceworkerglobalscopes (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  clients TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  registration TEXT NOT NULL,
  type TEXT NOT NULL,
  listener TEXT NOT NULL,
  options TEXT
);
COMMENT ON TABLE serviceworkerglobalscopes IS 'Generated from: types\push-notification.d.ts';

CREATE TABLE IF NOT EXISTS payments (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  method TEXT NOT NULL,
  order_id TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata TEXT,
  intentionId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  error_message UNKNOWN
);
COMMENT ON TABLE payments IS 'Generated from: types\payment.ts, services\PaymentStatusService.ts, services\paymentService.ts, components\admin\payments\PaymentDashboard.tsx';

CREATE TABLE IF NOT EXISTS paymentintents (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  client_secret TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  payment_id TEXT NOT NULL,
  redirectUrl TEXT
);
COMMENT ON TABLE paymentintents IS 'Generated from: types\payment.ts';

CREATE TABLE IF NOT EXISTS paymentsessions (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  payment_id TEXT NOT NULL,
  status TEXT NOT NULL,
  amount INTEGER NOT NULL,
  redirectUrl TEXT NOT NULL
);
COMMENT ON TABLE paymentsessions IS 'Generated from: types\payment.ts';

CREATE TABLE IF NOT EXISTS parishes (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT
);
COMMENT ON TABLE parishes IS 'Generated from: types\parish.ts, hooks\useParish.ts';

CREATE TABLE IF NOT EXISTS priests (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  parish_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  churchId TEXT NOT NULL,
  userId TEXT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  title TEXT NOT NULL,
  isPrimary BOOLEAN NOT NULL,
  isActive BOOLEAN NOT NULL,
  specializations TEXT[] NOT NULL,
  languages TEXT[] NOT NULL,
  availableDays INTEGER[] NOT NULL,
  availableHoursStart TEXT NOT NULL,
  availableHoursEnd TEXT NOT NULL,
  avatarUrl TEXT,
  bio TEXT,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL,
  church TEXT
);
COMMENT ON TABLE priests IS 'Generated from: types\parish.ts, types\church.ts, hooks\useParish.ts';

CREATE TABLE IF NOT EXISTS masses (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  parish_id TEXT NOT NULL,
  priest_id TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  language TEXT NOT NULL,
  max_intentions INTEGER NOT NULL,
  notes TEXT,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  duration INTEGER
);
COMMENT ON TABLE masses IS 'Generated from: types\parish.ts, types\mass.ts, types\mass-intention.ts, services\notificationService.ts, hooks\useParish.ts, app\api\webhooks\stripe\route.ts';

CREATE TABLE IF NOT EXISTS massintentions (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  mass_id TEXT NOT NULL,
  content TEXT NOT NULL,
  requestor_name TEXT NOT NULL,
  requestor_email TEXT,
  requestor_phone TEXT,
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_amount INTEGER,
  payment_id TEXT,
  notes TEXT,
  churchId TEXT NOT NULL,
  userId TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  time TEXT NOT NULL,
  intentionType TEXT NOT NULL,
  customIntention TEXT,
  payment TEXT NOT NULL,
  celebrant TEXT,
  isCollective BOOLEAN NOT NULL,
  parish_id TEXT NOT NULL,
  intention_for TEXT NOT NULL,
  mass_date TEXT NOT NULL,
  mass_time TEXT,
  mass_type TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL,
  email TEXT NOT NULL,
  parishes TEXT,
  name TEXT NOT NULL
);
COMMENT ON TABLE massintentions IS 'Generated from: types\parish.ts, types\mass.ts, types\mass-intention.ts';

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  parish_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_published BOOLEAN NOT NULL,
  priority TEXT NOT NULL
);
COMMENT ON TABLE announcements IS 'Generated from: types\parish.ts, hooks\useParish.ts';

CREATE TABLE IF NOT EXISTS users (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  parish_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL
);
COMMENT ON TABLE users IS 'Generated from: types\parish.ts, services\notifications\NotificationTaskService.ts, services\notifications\NotificationService.ts, lib\multi-tenant.ts';

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  scheduledFor TEXT NOT NULL,
  sentAt TEXT,
  metadata TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  user_id UNKNOWN,
  scheduled_for UNKNOWN,
  sent_at UNKNOWN
);
COMMENT ON TABLE notifications IS 'Generated from: types\notifications.ts, services\notifications\NotificationService.ts, app\api\webhooks\payment\route.ts';

CREATE TABLE IF NOT EXISTS notificationtemplates (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT NOT NULL,
  variables TEXT[],
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
COMMENT ON TABLE notificationtemplates IS 'Generated from: types\notifications.ts';

CREATE TABLE IF NOT EXISTS notificationpayloads (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  userId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduledFor TEXT NOT NULL,
  metadata TEXT,
  body TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  data TEXT,
  actions TEXT,
  action TEXT NOT NULL
);
COMMENT ON TABLE notificationpayloads IS 'Generated from: types\notifications.ts, services\notification\NotificationService.ts, supabase\functions\send-push\index.ts';

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  custom_domain TEXT NOT NULL,
  status TEXT NOT NULL,
  plan TEXT NOT NULL,
  settings TEXT NOT NULL
);
COMMENT ON TABLE organizations IS 'Generated from: types\multi-tenant.ts, services\organizationService.ts, lib\multi-tenant.ts';

CREATE TABLE IF NOT EXISTS ratelimitsettingses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  max_requests_per_minute INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  max_api_calls_per_day INTEGER,
  enabled BOOLEAN NOT NULL
);
COMMENT ON TABLE ratelimitsettingses IS 'Generated from: types\multi-tenant.ts';

CREATE TABLE IF NOT EXISTS organizationsettingses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  theme TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  primary_color TEXT,
  secondary_color TEXT,
  logo_url TEXT
);
COMMENT ON TABLE organizationsettingses IS 'Generated from: types\multi-tenant.ts';

CREATE TABLE IF NOT EXISTS memberpermissionses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  manage_members BOOLEAN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  manage_finances BOOLEAN,
  manage_masses BOOLEAN,
  manage_candles BOOLEAN,
  manage_announcements BOOLEAN,
  view_analytics BOOLEAN,
  manage_settings BOOLEAN
);
COMMENT ON TABLE memberpermissionses IS 'Generated from: types\multi-tenant.ts';

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  role TEXT NOT NULL,
  permissions TEXT NOT NULL
);
COMMENT ON TABLE memberships IS 'Generated from: types\multi-tenant.ts, lib\multi-tenant.ts';

CREATE TABLE IF NOT EXISTS churches (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location TEXT NOT NULL,
  lat INTEGER NOT NULL,
  lng INTEGER NOT NULL,
  fullName TEXT,
  shortName TEXT,
  description TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  city TEXT NOT NULL,
  postalCode TEXT,
  country TEXT NOT NULL,
  latitude INTEGER,
  longitude INTEGER,
  status TEXT NOT NULL,
  verifiedAt TIMESTAMP,
  verifiedBy TEXT,
  registrationDate TIMESTAMP NOT NULL,
  hasLiveStreaming BOOLEAN NOT NULL,
  streamingPlatform TEXT,
  streamingUrl TEXT,
  hasParking BOOLEAN NOT NULL,
  hasAccessibility BOOLEAN NOT NULL,
  baseMassPrice INTEGER NOT NULL,
  acceptsOnlinePayments BOOLEAN NOT NULL,
  currency TEXT NOT NULL,
  logoUrl TEXT,
  coverImageUrl TEXT,
  photos TEXT[] NOT NULL,
  autoConfirmOrders BOOLEAN NOT NULL,
  maxAdvanceBookingDays INTEGER NOT NULL,
  minAdvanceBookingHours INTEGER NOT NULL,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
COMMENT ON TABLE churches IS 'Generated from: types\mass.ts, types\church.ts, services\mass\MassService.ts';

CREATE TABLE IF NOT EXISTS massintentionstatses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  total INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  pending INTEGER NOT NULL,
  paid INTEGER NOT NULL,
  completed INTEGER NOT NULL,
  cancelled INTEGER NOT NULL,
  totalRevenue INTEGER NOT NULL,
  avgProcessingTime INTEGER NOT NULL
);
COMMENT ON TABLE massintentionstatses IS 'Generated from: types\mass-intention.ts';

CREATE TABLE IF NOT EXISTS massintentionfilterses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  status TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  dateRange TEXT,
  start TIMESTAMP NOT NULL,
  end TIMESTAMP NOT NULL
);
COMMENT ON TABLE massintentionfilterses IS 'Generated from: types\mass-intention.ts';

CREATE TABLE IF NOT EXISTS massschedules (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  churchId TEXT NOT NULL,
  priestId TEXT,
  dayOfWeek INTEGER NOT NULL,
  time TEXT NOT NULL,
  massType TEXT NOT NULL,
  language TEXT NOT NULL,
  maxCapacity INTEGER NOT NULL,
  currentBookings INTEGER NOT NULL,
  price INTEGER,
  hasLiveStream BOOLEAN NOT NULL,
  streamUrl TEXT,
  isSpecialOccasion BOOLEAN NOT NULL,
  isActive BOOLEAN NOT NULL,
  validFrom TIMESTAMP NOT NULL,
  validUntil TIMESTAMP,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL,
  church TEXT,
  priest TEXT
);
COMMENT ON TABLE massschedules IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchfeatures (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  churchId TEXT NOT NULL,
  featureType TEXT NOT NULL,
  isAvailable BOOLEAN NOT NULL,
  description TEXT,
  additionalCost INTEGER NOT NULL,
  createdAt TIMESTAMP NOT NULL
);
COMMENT ON TABLE churchfeatures IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchreviews (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  churchId TEXT NOT NULL,
  userId TEXT NOT NULL,
  orderId TEXT NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT,
  comment TEXT,
  serviceQuality INTEGER,
  communication INTEGER,
  valueForMoney INTEGER,
  timeliness INTEGER,
  isVerified BOOLEAN NOT NULL,
  isFeatured BOOLEAN NOT NULL,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL,
  church TEXT,
  user TEXT,
  firstName TEXT,
  lastName TEXT,
  avatar TEXT
);
COMMENT ON TABLE churchreviews IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchstatses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  churchId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  totalOrders INTEGER NOT NULL,
  completedOrders INTEGER NOT NULL,
  cancelledOrders INTEGER NOT NULL,
  totalReviews INTEGER NOT NULL,
  averageRating INTEGER NOT NULL,
  fiveStarCount INTEGER NOT NULL,
  fourStarCount INTEGER NOT NULL,
  threeStarCount INTEGER NOT NULL,
  twoStarCount INTEGER NOT NULL,
  oneStarCount INTEGER NOT NULL,
  averageResponseTimeHours INTEGER NOT NULL,
  responseRate INTEGER NOT NULL,
  totalRevenue INTEGER NOT NULL,
  averageOrderValue INTEGER NOT NULL,
  profileViews INTEGER NOT NULL,
  liveStreamViews INTEGER NOT NULL,
  lastCalculated TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
COMMENT ON TABLE churchstatses IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchsummaries (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  rating INTEGER NOT NULL,
  reviewCount INTEGER NOT NULL,
  baseMassPrice INTEGER NOT NULL,
  hasLiveStreaming BOOLEAN NOT NULL,
  distance INTEGER,
  logoUrl TEXT,
  nextAvailableSlot TIMESTAMP
);
COMMENT ON TABLE churchsummaries IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchsearchfilterses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  city TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  country TEXT,
  maxDistance INTEGER,
  userLocation TEXT,
  hasLiveStreaming BOOLEAN,
  hasParking BOOLEAN,
  hasAccessibility BOOLEAN,
  features TEXT,
  minPrice INTEGER,
  maxPrice INTEGER,
  currency TEXT,
  minRating INTEGER,
  minReviewCount INTEGER,
  verifiedOnly BOOLEAN,
  massTypes TEXT,
  languages TEXT[],
  availableDays INTEGER[],
  maxResponseTime INTEGER,
  autoConfirmOnly BOOLEAN,
  query TEXT,
  sortBy TEXT,
  sortOrder TEXT,
  page INTEGER,
  limit INTEGER
);
COMMENT ON TABLE churchsearchfilterses IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchsearchresults (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  churches TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  total INTEGER NOT NULL,
  page INTEGER NOT NULL,
  limit INTEGER NOT NULL,
  hasMore BOOLEAN NOT NULL,
  filters TEXT NOT NULL
);
COMMENT ON TABLE churchsearchresults IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchregistrationdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  fullName TEXT,
  description TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postalCode TEXT,
  country TEXT NOT NULL,
  priestFirstName TEXT NOT NULL,
  priestLastName TEXT NOT NULL,
  priestEmail TEXT NOT NULL,
  priestPhone TEXT,
  hasLiveStreaming BOOLEAN NOT NULL,
  streamingPlatform TEXT,
  streamingUrl TEXT,
  hasParking BOOLEAN NOT NULL,
  hasAccessibility BOOLEAN NOT NULL,
  baseMassPrice INTEGER NOT NULL,
  acceptsOnlinePayments BOOLEAN NOT NULL,
  documents TEXT,
  agreesToTerms BOOLEAN NOT NULL,
  agreesToDataProcessing BOOLEAN NOT NULL
);
COMMENT ON TABLE churchregistrationdatas IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchverificationdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  churchId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  status TEXT NOT NULL,
  verificationNotes TEXT,
  verifiedBy TEXT NOT NULL,
  verifiedAt TIMESTAMP NOT NULL,
  documentsVerified BOOLEAN NOT NULL,
  liveStreamingVerified BOOLEAN
);
COMMENT ON TABLE churchverificationdatas IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchapiresponses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  data TEXT,
  error TEXT,
  message TEXT
);
COMMENT ON TABLE churchapiresponses IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchlistapiresponses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  data TEXT,
  error TEXT,
  message TEXT
);
COMMENT ON TABLE churchlistapiresponses IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS churchvalidationruleses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  minLength INTEGER NOT NULL,
  maxLength INTEGER NOT NULL,
  required BOOLEAN NOT NULL
);
COMMENT ON TABLE churchvalidationruleses IS 'Generated from: types\church.ts';

CREATE TABLE IF NOT EXISTS oremuscandles (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  nfc_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  activation_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  intention TEXT NOT NULL,
  is_active BOOLEAN NOT NULL,
  type TEXT NOT NULL,
  notification_sent BOOLEAN NOT NULL,
  notifications_enabled BOOLEAN NOT NULL,
  nfcId TEXT NOT NULL,
  activationDate TIMESTAMP,
  expiryDate TIMESTAMP,
  isActive BOOLEAN NOT NULL
);
COMMENT ON TABLE oremuscandles IS 'Generated from: types\candle.ts, components\features\candle\OremusCandle.tsx';

CREATE TABLE IF NOT EXISTS extendcandlerequests (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  candle_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  hours INTEGER NOT NULL
);
COMMENT ON TABLE extendcandlerequests IS 'Generated from: types\candle.ts';

CREATE TABLE IF NOT EXISTS candlestatses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  total_active INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  total_expired INTEGER NOT NULL,
  by_type TEXT NOT NULL,
  standard INTEGER NOT NULL,
  premium INTEGER NOT NULL,
  deluxe INTEGER NOT NULL
);
COMMENT ON TABLE candlestatses IS 'Generated from: types\candle.ts';

CREATE TABLE IF NOT EXISTS autherrors (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  code TEXT
);
COMMENT ON TABLE autherrors IS 'Generated from: types\auth.ts';

CREATE TABLE IF NOT EXISTS authstates (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  loading BOOLEAN NOT NULL,
  error TEXT NOT NULL
);
COMMENT ON TABLE authstates IS 'Generated from: types\auth.ts';

CREATE TABLE IF NOT EXISTS passwordvalidations (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  isValid BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  errors TEXT[] NOT NULL
);
COMMENT ON TABLE passwordvalidations IS 'Generated from: types\auth.ts';

CREATE TABLE IF NOT EXISTS userprofiles (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  email TEXT,
  role TEXT NOT NULL,
  displayName TEXT,
  phoneNumber TEXT,
  lastLogin TIMESTAMP,
  isEmailVerified BOOLEAN NOT NULL,
  twoFactorEnabled BOOLEAN NOT NULL,
  user_id TEXT,
  aud TEXT,
  confirmed_at TEXT,
  email_confirmed_at TEXT,
  phone TEXT,
  confirmation_sent_at TEXT,
  recovery_sent_at TEXT,
  last_sign_in_at TEXT,
  app_metadata TEXT NOT NULL
);
COMMENT ON TABLE userprofiles IS 'Generated from: types\auth.ts';

CREATE TABLE IF NOT EXISTS resetpassworddatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  token TEXT,
  newPassword TEXT
);
COMMENT ON TABLE resetpassworddatas IS 'Generated from: types\auth.ts';

CREATE TABLE IF NOT EXISTS authresponses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  message TEXT,
  user TEXT,
  error TEXT
);
COMMENT ON TABLE authresponses IS 'Generated from: types\auth.ts';

CREATE TABLE IF NOT EXISTS audiotracks (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  type TEXT NOT NULL,
  prayerSegments TEXT,
  hasInteractive BOOLEAN NOT NULL,
  chapters TEXT,
  thumbnail TEXT,
  description TEXT,
  tags TEXT[],
  isPremium BOOLEAN NOT NULL
);
COMMENT ON TABLE audiotracks IS 'Generated from: types\audio.ts';

CREATE TABLE IF NOT EXISTS prayersegments (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  text TEXT NOT NULL,
  startTime INTEGER NOT NULL,
  expectedResponse TEXT,
  waitForResponse BOOLEAN,
  responseTimeout INTEGER,
  audioUrl TEXT,
  duration INTEGER
);
COMMENT ON TABLE prayersegments IS 'Generated from: types\audio.ts, components\features\player\InteractivePrayerPlayer.tsx';

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  startTime INTEGER NOT NULL,
  endTime INTEGER,
  description TEXT
);
COMMENT ON TABLE chapters IS 'Generated from: types\audio.ts';

CREATE TABLE IF NOT EXISTS userprogresses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  userId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  trackId TEXT NOT NULL,
  progress INTEGER NOT NULL,
  completed BOOLEAN NOT NULL,
  lastPlayed TEXT NOT NULL,
  streak INTEGER NOT NULL
);
COMMENT ON TABLE userprogresses IS 'Generated from: types\audio.ts';

CREATE TABLE IF NOT EXISTS userpreferenceses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  userId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  preferredMode TEXT NOT NULL,
  volume INTEGER NOT NULL,
  playbackRate INTEGER NOT NULL,
  backgroundSound TEXT NOT NULL,
  autoplay BOOLEAN NOT NULL
);
COMMENT ON TABLE userpreferenceses IS 'Generated from: types\audio.ts';

CREATE TABLE IF NOT EXISTS createpaymentintentbodies (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  amount INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  method TEXT NOT NULL,
  metadata TEXT NOT NULL,
  intentionId TEXT NOT NULL,
  massType TEXT NOT NULL,
  date TEXT NOT NULL,
  key TEXT NOT NULL
);
COMMENT ON TABLE createpaymentintentbodies IS 'Generated from: types\api.ts';

CREATE TABLE IF NOT EXISTS createpaymentintentresponses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  client_secret TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  payment_id TEXT NOT NULL,
  redirectUrl TEXT,
  error TEXT
);
COMMENT ON TABLE createpaymentintentresponses IS 'Generated from: types\api.ts';

CREATE TABLE IF NOT EXISTS analyticsevents (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  userId TEXT,
  eventType TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT,
  metadata TEXT,
  createdAt TEXT NOT NULL,
  name TEXT NOT NULL,
  properties TEXT,
  timestamp TIMESTAMP
);
COMMENT ON TABLE analyticsevents IS 'Generated from: types\analytics.ts, services\analyticsService.ts';

CREATE TABLE IF NOT EXISTS webhookevents (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  provider TEXT NOT NULL,
  eventType TEXT NOT NULL,
  status TEXT NOT NULL,
  payload TEXT,
  errorMessage TEXT,
  retryCount INTEGER NOT NULL,
  processedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
COMMENT ON TABLE webhookevents IS 'Generated from: types\analytics.ts';

CREATE TABLE IF NOT EXISTS reportconfigs (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  schedule TEXT,
  query TEXT NOT NULL,
  parameters TEXT,
  recipients TEXT[] NOT NULL,
  lastRunAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
COMMENT ON TABLE reportconfigs IS 'Generated from: types\analytics.ts';

CREATE TABLE IF NOT EXISTS analyticspayloads (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  userId TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  eventType TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT,
  metadata TEXT
);
COMMENT ON TABLE analyticspayloads IS 'Generated from: types\analytics.ts';

CREATE TABLE IF NOT EXISTS realtimesubscriptions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  channelName TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  channel TEXT NOT NULL,
  unsubscribe TEXT NOT NULL
);
COMMENT ON TABLE realtimesubscriptions IS 'Generated from: services\realtimeService.ts';

CREATE TABLE IF NOT EXISTS createpaymentintentdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  amount INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  currency TEXT NOT NULL,
  payment_method_types TEXT NOT NULL,
  metadata TEXT,
  customer_email TEXT
);
COMMENT ON TABLE createpaymentintentdatas IS 'Generated from: services\paymentService.ts';

CREATE TABLE IF NOT EXISTS paymentresults (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  error TEXT,
  paymentIntentId TEXT
);
COMMENT ON TABLE paymentresults IS 'Generated from: services\paymentService.ts';

CREATE TABLE IF NOT EXISTS audio_content (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  category UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE audio_content IS 'Generated from: services\mediaService.ts';

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  title UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type UNKNOWN,
  duration UNKNOWN,
  language
        ) UNKNOWN,
  user_id UNKNOWN,
  track_id UNKNOWN
);
COMMENT ON TABLE user_favorites IS 'Generated from: services\favoriteService.ts';

CREATE TABLE IF NOT EXISTS calendareventinputs (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT,
  parishId TEXT NOT NULL,
  metadata TEXT
);
COMMENT ON TABLE calendareventinputs IS 'Generated from: services\calendarService.ts';

CREATE TABLE IF NOT EXISTS audio_tracks (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  url UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE audio_tracks IS 'Generated from: services\audioService.ts';

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  event_name UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  properties UNKNOWN,
  timestamp UNKNOWN,
  user_id UNKNOWN,
  event_type UNKNOWN,
  entity_type UNKNOWN,
  entity_id UNKNOWN,
  metadata UNKNOWN
);
COMMENT ON TABLE analytics_events IS 'Generated from: services\analyticsService.ts, services\analytics\AnalyticsService.ts';

CREATE TABLE IF NOT EXISTS courses (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  progress INTEGER,
  lessons TEXT NOT NULL,
  duration INTEGER NOT NULL,
  level TEXT NOT NULL,
  instructor TEXT NOT NULL,
  prerequisites TEXT[],
  price INTEGER NOT NULL,
  videos TEXT NOT NULL,
  isPurchased BOOLEAN NOT NULL
);
COMMENT ON TABLE courses IS 'Generated from: services\academyService.ts, app\api\academy\courses\route.ts, components\features\player\CoursePlayer.tsx';

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  courseId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  order INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  completed BOOLEAN,
  course UUID NOT NULL,
  course_id UNKNOWN
);
COMMENT ON TABLE lessons IS 'Generated from: services\academyService.ts, app\api\academy\courses\[courseId]\lessons\[lessonId]\route.ts, app\api\academy\courses\[courseId]\lessons\[lessonId]\quiz\route.ts';

CREATE TABLE IF NOT EXISTS certificates (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  courseId TEXT NOT NULL,
  issueDate TEXT NOT NULL,
  recipientName TEXT NOT NULL,
  instructorName TEXT NOT NULL,
  grade TEXT,
  validUntil TEXT
);
COMMENT ON TABLE certificates IS 'Generated from: services\academyService.ts';

CREATE TABLE IF NOT EXISTS quizattempts (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  lessonId TEXT NOT NULL,
  startedAt TEXT NOT NULL,
  completedAt TEXT,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers TEXT NOT NULL,
  questionId TEXT NOT NULL,
  selectedAnswer TEXT NOT NULL,
  correct BOOLEAN NOT NULL
);
COMMENT ON TABLE quizattempts IS 'Generated from: services\academyService.ts';

CREATE TABLE IF NOT EXISTS report_configs (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type UNKNOWN,
  schedule UNKNOWN,
  query UNKNOWN,
  parameters UNKNOWN,
  recipients UNKNOWN,
  last_run_at UNKNOWN
);
COMMENT ON TABLE report_configs IS 'Generated from: services\reporting\ReportingService.ts';

CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  definition_id UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  name UNKNOWN,
  format UNKNOWN,
  file_path UNKNOWN,
  parameters UNKNOWN,
  expires_at UNKNOWN
);
COMMENT ON TABLE generated_reports IS 'Generated from: services\reporting\ReportingService.ts';

CREATE TABLE IF NOT EXISTS reportdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  columns TEXT[] NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  rows TEXT NOT NULL
);
COMMENT ON TABLE reportdatas IS 'Generated from: services\reporting\ReportingService.ts';

CREATE TABLE IF NOT EXISTS mass_intentions (
  id UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  church_id UNKNOWN,
  church UUID NOT NULL,
  user UUID NOT NULL,
  phone) UNKNOWN,
  isPaid UNKNOWN,
  confirmedAt UNKNOWN,
  status UNKNOWN
);
COMMENT ON TABLE mass_intentions IS 'Generated from: services\payment\PaymentService.ts, services\mass\MassService.ts, services\mass\MassIntentionService.ts, hooks\useMassIntentions.ts, lib\payment\handlers\failedPayment.ts';

CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  endpoint UNKNOWN,
  p256dh_key UNKNOWN,
  auth_key UNKNOWN,
  user_agent UNKNOWN
);
COMMENT ON TABLE notification_subscriptions IS 'Generated from: services\notification\NotificationService.ts, supabase\functions\send-push-notification\index.ts, supabase\functions\send-push\index.ts';

CREATE TABLE IF NOT EXISTS notificationsubscriptions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  keys TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL
);
COMMENT ON TABLE notificationsubscriptions IS 'Generated from: services\notification\NotificationService.ts';

CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  status UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  sent_at UNKNOWN,
  retry_count UNKNOWN,
  error_message UNKNOWN
);
COMMENT ON TABLE scheduled_notifications IS 'Generated from: services\notifications\NotificationTaskService.ts';

CREATE TABLE IF NOT EXISTS notification_templates (

);
COMMENT ON TABLE notification_templates IS 'Generated from: services\notifications\NotificationService.ts';

CREATE TABLE IF NOT EXISTS massorderdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  church_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  mass_date TIMESTAMP NOT NULL,
  intention TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment JSONB
);
COMMENT ON TABLE massorderdatas IS 'Generated from: services\mass\MassOrderingService.ts';

CREATE TABLE IF NOT EXISTS templatevariableses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE templatevariableses IS 'Generated from: services\email\TemplateEngine.ts';

CREATE TABLE IF NOT EXISTS paymentconfirmationdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  intentionDetails TEXT NOT NULL,
  paymentAmount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  receiptUrl TEXT NOT NULL
);
COMMENT ON TABLE paymentconfirmationdatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS paymentfailuredatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  intentionId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  error TEXT
);
COMMENT ON TABLE paymentfailuredatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS refundconfirmationdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  intentionDetails TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL
);
COMMENT ON TABLE refundconfirmationdatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS reminderdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  intention_for TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  mass_date TEXT NOT NULL,
  parish_name TEXT NOT NULL,
  type TEXT NOT NULL
);
COMMENT ON TABLE reminderdatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS courseenrollmentdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  courseName TEXT NOT NULL,
  instructorName TEXT NOT NULL,
  courseLevel TEXT NOT NULL,
  courseDuration INTEGER NOT NULL,
  courseId TEXT NOT NULL
);
COMMENT ON TABLE courseenrollmentdatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS coursecompletiondatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  courseName TEXT NOT NULL,
  completionDate TIMESTAMP NOT NULL,
  grade TEXT,
  certificateId TEXT NOT NULL
);
COMMENT ON TABLE coursecompletiondatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS passwordresetdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  resetLink TEXT NOT NULL
);
COMMENT ON TABLE passwordresetdatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS emailverificationdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  verificationLink TEXT NOT NULL
);
COMMENT ON TABLE emailverificationdatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS parishregistrationdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  parishName TEXT NOT NULL,
  parishAddress TEXT NOT NULL,
  adminEmail TEXT NOT NULL
);
COMMENT ON TABLE parishregistrationdatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS webhookfailuredatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  provider TEXT NOT NULL,
  eventType TEXT NOT NULL,
  failureTime TIMESTAMP NOT NULL,
  retryCount INTEGER NOT NULL,
  errorMessage TEXT
);
COMMENT ON TABLE webhookfailuredatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS announcementdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  postedDate TIMESTAMP NOT NULL,
  parishId TEXT NOT NULL
);
COMMENT ON TABLE announcementdatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS reportreadydatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  reportName TEXT NOT NULL,
  generatedDate TIMESTAMP NOT NULL,
  reportFormat TEXT NOT NULL,
  downloadUrl TEXT NOT NULL
);
COMMENT ON TABLE reportreadydatas IS 'Generated from: services\email\EmailService.ts, services\email\EmailService.new.ts';

CREATE TABLE IF NOT EXISTS candles (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  expiry_date UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  user_id UNKNOWN,
  is_active UNKNOWN,
  activation_date UNKNOWN,
  notification_sent UNKNOWN,
  notifications_enabled UNKNOWN
);
COMMENT ON TABLE candles IS 'Generated from: services\candle\CandleService.ts, supabase\functions\send-candle-notification\index.ts, supabase\functions\process-nfc\index.ts';

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  role UNKNOWN,
  is_email_verified UNKNOWN,
  two_factor_enabled UNKNOWN,
  last_login UNKNOWN
);
COMMENT ON TABLE user_profiles IS 'Generated from: services\auth\AuthService.ts';

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  event_type UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  status UNKNOWN
);
COMMENT ON TABLE webhook_events IS 'Generated from: services\analytics\AnalyticsService.ts';

CREATE TABLE IF NOT EXISTS layoutinfos (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  deviceType TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  orientation TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  isLargeScreen BOOLEAN NOT NULL
);
COMMENT ON TABLE layoutinfos IS 'Generated from: hooks\useResponsiveLayout.ts';

CREATE TABLE IF NOT EXISTS usereportings (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  getReportConfigs TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  generateReport TEXT NOT NULL,
  getGeneratedReports TEXT NOT NULL,
  getReportsByDefinition TEXT NOT NULL,
  downloadReport TEXT NOT NULL
);
COMMENT ON TABLE usereportings IS 'Generated from: hooks\useReporting.ts';

CREATE TABLE IF NOT EXISTS subscriptionfilters (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  schema TEXT,
  table TEXT NOT NULL,
  filter TEXT
);
COMMENT ON TABLE subscriptionfilters IS 'Generated from: hooks\useRealtimeSubscription.ts';

CREATE TABLE IF NOT EXISTS user_progress (

);
COMMENT ON TABLE user_progress IS 'Generated from: hooks\useProgress.ts';

CREATE TABLE IF NOT EXISTS useperformancemonitorpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  componentName TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  enabled BOOLEAN
);
COMMENT ON TABLE useperformancemonitorpropses IS 'Generated from: hooks\usePerformanceMonitor.ts';

CREATE TABLE IF NOT EXISTS paymentstatustrackerpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  paymentId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onStatusChange TEXT NOT NULL
);
COMMENT ON TABLE paymentstatustrackerpropses IS 'Generated from: hooks\usePaymentStatus.ts, components\payment\PaymentStatusTracker.tsx';

CREATE TABLE IF NOT EXISTS usenotificationses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  scheduleNotification TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  getNotifications TEXT NOT NULL
);
COMMENT ON TABLE usenotificationses IS 'Generated from: hooks\useNotifications.ts';

CREATE TABLE IF NOT EXISTS featureflagses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  massOrderingEnabled BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  odbPlayerEnabled BOOLEAN NOT NULL,
  academyEnabled BOOLEAN NOT NULL,
  digitalLibraryEnabled BOOLEAN NOT NULL,
  modernDesignEnabled BOOLEAN NOT NULL,
  glassmorphismEnabled BOOLEAN NOT NULL
);
COMMENT ON TABLE featureflagses IS 'Generated from: hooks\useFeatureFlags.ts';

CREATE TABLE IF NOT EXISTS registermetadatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  userType TEXT NOT NULL,
  parish TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL
);
COMMENT ON TABLE registermetadatas IS 'Generated from: hooks\useAuth.ts';

CREATE TABLE IF NOT EXISTS useanalyticses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  trackEvent TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  getEventsByUser TEXT NOT NULL,
  getEventsByEntity TEXT NOT NULL,
  getWebhookMetrics TEXT NOT NULL,
  getEventMetrics TEXT NOT NULL,
  getFailedWebhooks TEXT NOT NULL
);
COMMENT ON TABLE useanalyticses IS 'Generated from: hooks\useAnalytics.ts';

CREATE TABLE IF NOT EXISTS useacademyoptionses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  courseId TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE useacademyoptionses IS 'Generated from: hooks\useAcademy.ts';

CREATE TABLE IF NOT EXISTS scheduleconfigs (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  cronExpression TEXT NOT NULL,
  lastRun TIMESTAMP,
  fn TEXT NOT NULL
);
COMMENT ON TABLE scheduleconfigs IS 'Generated from: lib\utils\TaskScheduler.ts';

CREATE TABLE IF NOT EXISTS providerspropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  children TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  initialOrganizationId TEXT,
  initialOrganizationSlug TEXT
);
COMMENT ON TABLE providerspropses IS 'Generated from: app\providers.tsx';

CREATE TABLE IF NOT EXISTS statuscardpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  status TEXT NOT NULL,
  message TEXT NOT NULL
);
COMMENT ON TABLE statuscardpropses IS 'Generated from: app\admin\monitoring\page.tsx';

CREATE TABLE IF NOT EXISTS registerforms (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  password TEXT NOT NULL,
  confirmPassword TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  termsAccepted BOOLEAN NOT NULL
);
COMMENT ON TABLE registerforms IS 'Generated from: app\(auth)\register\page.tsx';

CREATE TABLE IF NOT EXISTS propses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  params TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE propses IS 'Generated from: app\(main)\player\[id]\page.tsx, app\(main)\library\[id]\page.tsx, app\(main)\academy\[id]\page.tsx';

CREATE TABLE IF NOT EXISTS student_lessons (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  lesson_id UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE student_lessons IS 'Generated from: app\api\academy\courses\[courseId]\lessons\[lessonId]\route.ts, app\api\academy\courses\[courseId]\lessons\[lessonId]\quiz\route.ts';

CREATE TABLE IF NOT EXISTS splashscreenpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  onComplete TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  duration INTEGER
);
COMMENT ON TABLE splashscreenpropses IS 'Generated from: components\ui\SplashScreen.tsx';

CREATE TABLE IF NOT EXISTS statuslistenerpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  paymentId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onStatusChange TEXT
);
COMMENT ON TABLE statuslistenerpropses IS 'Generated from: components\payment\StatusListener.tsx';

CREATE TABLE IF NOT EXISTS statusindicatorpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE statusindicatorpropses IS 'Generated from: components\payment\StatusIndicator.tsx';

CREATE TABLE IF NOT EXISTS paymentstatusbadgepropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE paymentstatusbadgepropses IS 'Generated from: components\payment\PaymentStatusBadge.tsx';

CREATE TABLE IF NOT EXISTS churchselectorpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  userLocation TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  initialLocation TEXT
);
COMMENT ON TABLE churchselectorpropses IS 'Generated from: components\mass\ChurchSelector.tsx, components\features\mass\ChurchSelector.tsx';

CREATE TABLE IF NOT EXISTS neumorphicbuttonpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  onPress TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  children TEXT NOT NULL,
  disabled BOOLEAN,
  style TEXT
);
COMMENT ON TABLE neumorphicbuttonpropses IS 'Generated from: components\glass\NeumorphicButton.tsx';

CREATE TABLE IF NOT EXISTS glasspanelpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  children TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  className TEXT
);
COMMENT ON TABLE glasspanelpropses IS 'Generated from: components\glass\GlassPanel.tsx';

CREATE TABLE IF NOT EXISTS datepickerpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  value TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onChange TEXT NOT NULL,
  error TEXT,
  min TEXT,
  max TEXT
);
COMMENT ON TABLE datepickerpropses IS 'Generated from: components\glass\DatePicker.tsx';

CREATE TABLE IF NOT EXISTS calendarpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  selected TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onSelect TEXT,
  minDate TIMESTAMP,
  maxDate TIMESTAMP,
  className TEXT
);
COMMENT ON TABLE calendarpropses IS 'Generated from: components\glass\Calendar.tsx';

CREATE TABLE IF NOT EXISTS adaptivegridpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  children TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  mobileColumns INTEGER,
  tabletColumns INTEGER,
  desktopColumns INTEGER,
  className TEXT,
  cols TEXT,
  base INTEGER,
  sm INTEGER,
  md INTEGER,
  lg INTEGER,
  xl INTEGER
);
COMMENT ON TABLE adaptivegridpropses IS 'Generated from: components\glass\AdaptiveGrid.tsx, components\design-system\AdaptiveGrid.tsx';

CREATE TABLE IF NOT EXISTS toastpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT,
  onClose TEXT NOT NULL,
  duration INTEGER
);
COMMENT ON TABLE toastpropses IS 'Generated from: components\design-system\Toast.tsx';

CREATE TABLE IF NOT EXISTS toastcontexts (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  showToast TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE toastcontexts IS 'Generated from: components\design-system\Toast.tsx';

CREATE TABLE IF NOT EXISTS responsivecontainerpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  children TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  className TEXT,
  maxWidth TEXT,
  padding BOOLEAN
);
COMMENT ON TABLE responsivecontainerpropses IS 'Generated from: components\design-system\ResponsiveContainer.tsx';

CREATE TABLE IF NOT EXISTS glasscardpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  children TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  className TEXT,
  blur TEXT,
  opacity TEXT,
  hover BOOLEAN,
  onClick TEXT
);
COMMENT ON TABLE glasscardpropses IS 'Generated from: components\design-system\GlassCard.tsx';

CREATE TABLE IF NOT EXISTS buttonpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  children TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  variant TEXT,
  size TEXT,
  className TEXT,
  disabled BOOLEAN,
  onClick TEXT,
  isLoading BOOLEAN,
  icon TEXT
);
COMMENT ON TABLE buttonpropses IS 'Generated from: components\design-system\Button.tsx';

CREATE TABLE IF NOT EXISTS animatedcardpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  children TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  className TEXT,
  hover BOOLEAN,
  onClick TEXT,
  animate BOOLEAN
);
COMMENT ON TABLE animatedcardpropses IS 'Generated from: components\design-system\AnimatedCard.tsx';

CREATE TABLE IF NOT EXISTS activityitems (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  status TEXT,
  actionUrl TEXT,
  actionLabel TEXT,
  metadata TEXT,
  church TEXT,
  priest TEXT,
  amount INTEGER
);
COMMENT ON TABLE activityitems IS 'Generated from: components\dashboard\RecentActivity.tsx';

CREATE TABLE IF NOT EXISTS recentactivitypropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  activities TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  isLoading BOOLEAN,
  className TEXT,
  maxItems INTEGER
);
COMMENT ON TABLE recentactivitypropses IS 'Generated from: components\dashboard\RecentActivity.tsx';

CREATE TABLE IF NOT EXISTS quickstatsdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  totalOrders INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  pendingOrders INTEGER NOT NULL,
  completedMasses INTEGER NOT NULL,
  upcomingMasses INTEGER NOT NULL,
  monthlySpending INTEGER,
  favoriteChurch TEXT
);
COMMENT ON TABLE quickstatsdatas IS 'Generated from: components\dashboard\QuickStats.tsx';

CREATE TABLE IF NOT EXISTS quickstatspropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  stats TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  isLoading BOOLEAN,
  className TEXT
);
COMMENT ON TABLE quickstatspropses IS 'Generated from: components\dashboard\QuickStats.tsx';

CREATE TABLE IF NOT EXISTS logoanimatedpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  size INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  className TEXT
);
COMMENT ON TABLE logoanimatedpropses IS 'Generated from: components\common\LogoAnimated.tsx';

CREATE TABLE IF NOT EXISTS logopropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  variant TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  size TEXT,
  className TEXT,
  showText BOOLEAN
);
COMMENT ON TABLE logopropses IS 'Generated from: components\common\Logo.tsx';

CREATE TABLE IF NOT EXISTS datagridpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  data TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  columns TEXT NOT NULL,
  field TEXT NOT NULL,
  headerName TEXT NOT NULL
);
COMMENT ON TABLE datagridpropses IS 'Generated from: components\admin\DataGrid.tsx';

CREATE TABLE IF NOT EXISTS modalpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  isOpen BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onClose TEXT NOT NULL,
  title TEXT,
  children TEXT NOT NULL,
  className TEXT,
  size TEXT
);
COMMENT ON TABLE modalpropses IS 'Generated from: components\ui\Modal\Modal.tsx';

CREATE TABLE IF NOT EXISTS searchresults (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT
);
COMMENT ON TABLE searchresults IS 'Generated from: components\features\search\SmartSearch.tsx';

CREATE TABLE IF NOT EXISTS smartsearchpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  onSearch TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onResultSelect TEXT NOT NULL,
  userType TEXT NOT NULL,
  aiRecommendations BOOLEAN
);
COMMENT ON TABLE smartsearchpropses IS 'Generated from: components\features\search\SmartSearch.tsx';

CREATE TABLE IF NOT EXISTS authcardpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  children TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE authcardpropses IS 'Generated from: components\ui\auth\AuthCard.tsx';

CREATE TABLE IF NOT EXISTS prayers (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  audioUrl TEXT NOT NULL,
  duration INTEGER NOT NULL,
  thumbnail TEXT,
  text TEXT,
  language TEXT,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL
);
COMMENT ON TABLE prayers IS 'Generated from: components\features\prayer\PrayerPlayer.tsx, components\features\prayer\PrayerMap.tsx';

CREATE TABLE IF NOT EXISTS prayermappropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  prayers TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onPrayerSelect TEXT NOT NULL
);
COMMENT ON TABLE prayermappropses IS 'Generated from: components\features\prayer\PrayerMap.tsx';

CREATE TABLE IF NOT EXISTS rosarybeads (
  id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  completed BOOLEAN NOT NULL
);
COMMENT ON TABLE rosarybeads IS 'Generated from: components\features\prayer\InteractiveRosary.tsx';

CREATE TABLE IF NOT EXISTS rosarymysteries (
  id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  meditation TEXT NOT NULL,
  image TEXT
);
COMMENT ON TABLE rosarymysteries IS 'Generated from: components\features\prayer\InteractiveRosary.tsx';

CREATE TABLE IF NOT EXISTS interactiverosarypropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  type TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onComplete TEXT,
  userType TEXT NOT NULL
);
COMMENT ON TABLE interactiverosarypropses IS 'Generated from: components\features\prayer\InteractiveRosary.tsx';

CREATE TABLE IF NOT EXISTS odbplayerpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  track TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  userType TEXT NOT NULL,
  onProgress TEXT,
  onComplete TEXT
);
COMMENT ON TABLE odbplayerpropses IS 'Generated from: components\features\player\ODBPlayer.tsx';

CREATE TABLE IF NOT EXISTS interactiveprayers (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  segments TEXT NOT NULL,
  thumbnail TEXT NOT NULL
);
COMMENT ON TABLE interactiveprayers IS 'Generated from: components\features\player\InteractivePrayerPlayer.tsx';

CREATE TABLE IF NOT EXISTS videos (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  thumbnail TEXT,
  previewDuration TEXT NOT NULL
);
COMMENT ON TABLE videos IS 'Generated from: components\features\player\CoursePlayer.tsx';

CREATE TABLE IF NOT EXISTS courseplayerpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  course TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  userType TEXT NOT NULL,
  onPurchase TEXT NOT NULL
);
COMMENT ON TABLE courseplayerpropses IS 'Generated from: components\features\player\CoursePlayer.tsx';

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  type TEXT NOT NULL,
  thumbnail TEXT,
  courseId TEXT,
  previewDuration INTEGER,
  isPremium BOOLEAN
);
COMMENT ON TABLE tracks IS 'Generated from: components\features\player\CorePlayer.tsx';

CREATE TABLE IF NOT EXISTS playerpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  tracks TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  initialTrackId TEXT,
  onTrackChange TEXT,
  userType TEXT NOT NULL
);
COMMENT ON TABLE playerpropses IS 'Generated from: components\features\player\CorePlayer.tsx';

CREATE TABLE IF NOT EXISTS paymentsectionpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  orderData JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onComplete TEXT NOT NULL
);
COMMENT ON TABLE paymentsectionpropses IS 'Generated from: components\features\mass\PaymentSection.tsx';

CREATE TABLE IF NOT EXISTS intentionformpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  value TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onComplete TEXT NOT NULL
);
COMMENT ON TABLE intentionformpropses IS 'Generated from: components\features\mass\IntentionForm.tsx';

CREATE TABLE IF NOT EXISTS datetimepickerpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  churchId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  value TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  time TEXT NOT NULL
);
COMMENT ON TABLE datetimepickerpropses IS 'Generated from: components\features\mass\DateTimePicker.tsx';

CREATE TABLE IF NOT EXISTS virtualcandlepropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  intention TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  duration TEXT NOT NULL,
  onComplete TEXT,
  size TEXT
);
COMMENT ON TABLE virtualcandlepropses IS 'Generated from: components\features\candle\VirtualCandle.tsx';

CREATE TABLE IF NOT EXISTS oremuscandlepropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  candle TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onNfcDetected TEXT NOT NULL,
  onActivate TEXT NOT NULL
);
COMMENT ON TABLE oremuscandlepropses IS 'Generated from: components\features\candle\OremusCandle.tsx';

CREATE TABLE IF NOT EXISTS courseviewerpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  courseId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onClose TEXT
);
COMMENT ON TABLE courseviewerpropses IS 'Generated from: components\features\academy\CourseViewer.tsx';

CREATE TABLE IF NOT EXISTS breadcrumbitems (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  href TEXT,
  icon TEXT
);
COMMENT ON TABLE breadcrumbitems IS 'Generated from: components\design-system\navigation\Breadcrumbs.tsx';

CREATE TABLE IF NOT EXISTS breadcrumbspropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  items TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  homeHref TEXT,
  className TEXT,
  separator TEXT
);
COMMENT ON TABLE breadcrumbspropses IS 'Generated from: components\design-system\navigation\Breadcrumbs.tsx';

CREATE TABLE IF NOT EXISTS oremuslogopropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  variant TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  size TEXT,
  effect TEXT,
  className TEXT,
  animated BOOLEAN,
  priority BOOLEAN
);
COMMENT ON TABLE oremuslogopropses IS 'Generated from: components\common\logo\OremusLogo.tsx';

CREATE TABLE IF NOT EXISTS reportlistpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  onSelectReport TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE reportlistpropses IS 'Generated from: components\admin\reporting\ReportList.tsx';

CREATE TABLE IF NOT EXISTS reportgeneratorpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  report TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onGenerated TEXT NOT NULL
);
COMMENT ON TABLE reportgeneratorpropses IS 'Generated from: components\admin\reporting\ReportGenerator.tsx';

CREATE TABLE IF NOT EXISTS parameterinputpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  value JSONB NOT NULL,
  options TEXT
);
COMMENT ON TABLE parameterinputpropses IS 'Generated from: components\admin\reporting\ReportGenerator.tsx';

CREATE TABLE IF NOT EXISTS newreportformpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  onCreated TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE newreportformpropses IS 'Generated from: components\admin\reporting\NewReportForm.tsx';

CREATE TABLE IF NOT EXISTS generatedreportspropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  reportId TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE generatedreportspropses IS 'Generated from: components\admin\reporting\GeneratedReports.tsx';

CREATE TABLE IF NOT EXISTS reportfiles (
  id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  generatedAt TEXT NOT NULL,
  filePath TEXT NOT NULL
);
COMMENT ON TABLE reportfiles IS 'Generated from: components\admin\reporting\GeneratedReports.tsx';

CREATE TABLE IF NOT EXISTS priestformpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  initialData TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onSubmit TEXT NOT NULL,
  onCancel TEXT NOT NULL
);
COMMENT ON TABLE priestformpropses IS 'Generated from: components\admin\priests\PriestForm.tsx';

CREATE TABLE IF NOT EXISTS webhookstatuspropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  count INTEGER NOT NULL
);
COMMENT ON TABLE webhookstatuspropses IS 'Generated from: components\admin\monitoring\WebhookMonitor.tsx';

CREATE TABLE IF NOT EXISTS notificationmetricspropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  timeframe TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE notificationmetricspropses IS 'Generated from: components\admin\monitoring\NotificationMetrics.tsx';

CREATE TABLE IF NOT EXISTS metriccardpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  value INTEGER NOT NULL,
  className TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  trend INTEGER,
  isPercentage BOOLEAN
);
COMMENT ON TABLE metriccardpropses IS 'Generated from: components\admin\monitoring\NotificationMetrics.tsx, components\admin\analytics\CourseMetrics.tsx';

CREATE TABLE IF NOT EXISTS paymentstatspropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  payments TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE paymentstatspropses IS 'Generated from: components\admin\payments\PaymentStats.tsx';

CREATE TABLE IF NOT EXISTS parishformpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  initialData TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onSubmit TEXT NOT NULL,
  onCancel TEXT NOT NULL
);
COMMENT ON TABLE parishformpropses IS 'Generated from: components\admin\parish\ParishForm.tsx';

CREATE TABLE IF NOT EXISTS massesfordates (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  date TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  masses TEXT NOT NULL,
  intentions TEXT NOT NULL
);
COMMENT ON TABLE massesfordates IS 'Generated from: components\admin\masses\MassIntentionsManager.tsx';

CREATE TABLE IF NOT EXISTS masscardpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  mass TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  intentions TEXT NOT NULL,
  onAddIntention TEXT NOT NULL,
  onStatusChange TEXT NOT NULL
);
COMMENT ON TABLE masscardpropses IS 'Generated from: components\admin\masses\MassCard.tsx';

CREATE TABLE IF NOT EXISTS announcementformpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  initialData TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  onSubmit TEXT NOT NULL,
  onCancel TEXT NOT NULL
);
COMMENT ON TABLE announcementformpropses IS 'Generated from: components\admin\announcements\AnnouncementForm.tsx';

CREATE TABLE IF NOT EXISTS templateoptions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  value TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  label TEXT NOT NULL,
  defaultVariables TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT
);
COMMENT ON TABLE templateoptions IS 'Generated from: components\admin\email\EmailPreviewTool.tsx';

CREATE TABLE IF NOT EXISTS datapoints (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  value INTEGER NOT NULL
);
COMMENT ON TABLE datapoints IS 'Generated from: components\admin\analytics\TrendChart.tsx';

CREATE TABLE IF NOT EXISTS trendchartpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  data TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT,
  height INTEGER
);
COMMENT ON TABLE trendchartpropses IS 'Generated from: components\admin\analytics\TrendChart.tsx';

CREATE TABLE IF NOT EXISTS statscardpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  value TEXT NOT NULL,
  trend INTEGER,
  icon TEXT,
  className TEXT,
  isPositive BOOLEAN NOT NULL,
  color TEXT NOT NULL
);
COMMENT ON TABLE statscardpropses IS 'Generated from: components\admin\analytics\StatsCard.tsx, components\admin\analytics\index.tsx';

CREATE TABLE IF NOT EXISTS chartdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  date TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  value INTEGER NOT NULL
);
COMMENT ON TABLE chartdatas IS 'Generated from: components\admin\analytics\index.tsx';

CREATE TABLE IF NOT EXISTS piechartdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  value INTEGER NOT NULL
);
COMMENT ON TABLE piechartdatas IS 'Generated from: components\admin\analytics\index.tsx';

CREATE TABLE IF NOT EXISTS linechartdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  date TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  value INTEGER NOT NULL
);
COMMENT ON TABLE linechartdatas IS 'Generated from: components\admin\analytics\index.tsx';

CREATE TABLE IF NOT EXISTS metricstablepropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  data TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  metric TEXT NOT NULL,
  value TEXT NOT NULL,
  change TEXT NOT NULL,
  trend TEXT NOT NULL
);
COMMENT ON TABLE metricstablepropses IS 'Generated from: components\admin\analytics\index.tsx';

CREATE TABLE IF NOT EXISTS course_analytics (

);
COMMENT ON TABLE course_analytics IS 'Generated from: components\admin\analytics\CourseMetrics.tsx';

CREATE TABLE IF NOT EXISTS coursemetricspropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  timeframe TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE coursemetricspropses IS 'Generated from: components\admin\analytics\CourseMetrics.tsx';

CREATE TABLE IF NOT EXISTS analyticscardpropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  value TEXT NOT NULL,
  trend TEXT,
  positive BOOLEAN NOT NULL
);
COMMENT ON TABLE analyticscardpropses IS 'Generated from: components\admin\analytics\AnalyticsCard.tsx';

CREATE TABLE IF NOT EXISTS activityitempropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE activityitempropses IS 'Generated from: components\admin\analytics\ActivityFeed.tsx';

CREATE TABLE IF NOT EXISTS glasspropses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  blur TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  opacity INTEGER,
  className TEXT,
  children TEXT
);
COMMENT ON TABLE glasspropses IS 'Generated from: components\glass\types.ts';

CREATE TABLE IF NOT EXISTS navigationitems (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  href TEXT NOT NULL,
  icon TEXT,
  isExternal BOOLEAN
);
COMMENT ON TABLE navigationitems IS 'Generated from: components\design-system\navigation\utils.ts';

CREATE TABLE IF NOT EXISTS navigationsections (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  label TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  items TEXT NOT NULL
);
COMMENT ON TABLE navigationsections IS 'Generated from: components\design-system\navigation\utils.ts';

CREATE TABLE IF NOT EXISTS sortconfigs (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  direction TEXT NOT NULL
);
COMMENT ON TABLE sortconfigs IS 'Generated from: components\design-system\data-display\utils.ts';

CREATE TABLE IF NOT EXISTS paginationconfigs (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  page INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  pageSize INTEGER NOT NULL,
  total INTEGER NOT NULL,
  pageSizeOptions INTEGER[]
);
COMMENT ON TABLE paginationconfigs IS 'Generated from: components\design-system\data-display\utils.ts';

CREATE TABLE IF NOT EXISTS nfctagdatas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nfcId TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  candleId TEXT NOT NULL,
  action TEXT NOT NULL,
  location TEXT,
  latitude INTEGER NOT NULL,
  longitude INTEGER NOT NULL,
  accuracy INTEGER NOT NULL
);
COMMENT ON TABLE nfctagdatas IS 'Generated from: supabase\functions\process-nfc\index.ts';

CREATE TABLE IF NOT EXISTS nfctagresponses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  message TEXT NOT NULL,
  candle TEXT,
  is_active BOOLEAN NOT NULL,
  expires_at TEXT NOT NULL
);
COMMENT ON TABLE nfctagresponses IS 'Generated from: supabase\functions\process-nfc\index.ts';

CREATE TABLE IF NOT EXISTS migrationissues (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  message TEXT NOT NULL,
  file TEXT NOT NULL,
  line INTEGER
);
COMMENT ON TABLE migrationissues IS 'Generated from: tools\validate-migrations.ts';

CREATE TABLE IF NOT EXISTS schemachangeevents (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  tableName TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  details JSONB NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  sourceFile TEXT NOT NULL
);
COMMENT ON TABLE schemachangeevents IS 'Generated from: tools\supabase-schema-auto-manager.ts';

CREATE TABLE IF NOT EXISTS tablefields (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  nullable BOOLEAN NOT NULL,
  primaryKey BOOLEAN,
  foreignKey TEXT,
  table TEXT NOT NULL,
  column TEXT NOT NULL
);
COMMENT ON TABLE tablefields IS 'Generated from: tools\schema-extractor.ts';

CREATE TABLE IF NOT EXISTS tables (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  fields TEXT NOT NULL,
  relationships TEXT NOT NULL,
  foreignKey TEXT NOT NULL,
  columns TEXT[] NOT NULL,
  referencedTable TEXT NOT NULL,
  referencedColumns TEXT[] NOT NULL
);
COMMENT ON TABLE tables IS 'Generated from: tools\schema-extractor.ts';

CREATE TABLE IF NOT EXISTS enums (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  values TEXT[] NOT NULL,
  description TEXT
);
COMMENT ON TABLE enums IS 'Generated from: tools\schema-extractor.ts';

CREATE TABLE IF NOT EXISTS schemainfos (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  tables TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  enums TEXT NOT NULL
);
COMMENT ON TABLE schemainfos IS 'Generated from: tools\schema-extractor.ts';

CREATE TABLE IF NOT EXISTS table_name (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  col1 UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  col2 UNKNOWN
);
COMMENT ON TABLE table_name IS 'Generated from: tools\oremus-project-scanner.ts, tools\auto-database-analyzer.ts';

CREATE TABLE IF NOT EXISTS oremustables (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  columns TEXT NOT NULL,
  type TEXT NOT NULL,
  nullable BOOLEAN NOT NULL,
  default TEXT,
  unique BOOLEAN,
  references TEXT
);
COMMENT ON TABLE oremustables IS 'Generated from: tools\oremus-project-scanner.ts';

CREATE TABLE IF NOT EXISTS tableusages (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  table TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  operations TEXT[] NOT NULL,
  files TEXT[] NOT NULL
);
COMMENT ON TABLE tableusages IS 'Generated from: tools\detect-table-usage.ts';

CREATE TABLE IF NOT EXISTS missingtables (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  columns TEXT NOT NULL
);
COMMENT ON TABLE missingtables IS 'Generated from: tools\check-multi-tenant-schema.ts';

CREATE TABLE IF NOT EXISTS tabledefinitions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  columns TEXT NOT NULL,
  relationships TEXT NOT NULL,
  indexes TEXT NOT NULL,
  policies TEXT NOT NULL,
  sourceFiles TEXT[] NOT NULL
);
COMMENT ON TABLE tabledefinitions IS 'Generated from: tools\auto-database-analyzer.ts';

CREATE TABLE IF NOT EXISTS columndefinitions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  nullable BOOLEAN NOT NULL,
  default TEXT,
  unique BOOLEAN,
  references TEXT,
  sourceFile TEXT NOT NULL,
  lineNumber INTEGER NOT NULL
);
COMMENT ON TABLE columndefinitions IS 'Generated from: tools\auto-database-analyzer.ts';

CREATE TABLE IF NOT EXISTS relationshipdefinitions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  table TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  column TEXT NOT NULL,
  referencedTable TEXT NOT NULL,
  referencedColumn TEXT NOT NULL,
  onDelete TEXT,
  onUpdate TEXT
);
COMMENT ON TABLE relationshipdefinitions IS 'Generated from: tools\auto-database-analyzer.ts';

CREATE TABLE IF NOT EXISTS indexdefinitions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  columns TEXT[] NOT NULL,
  unique BOOLEAN,
  type TEXT
);
COMMENT ON TABLE indexdefinitions IS 'Generated from: tools\auto-database-analyzer.ts';

CREATE TABLE IF NOT EXISTS policydefinitions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  using TEXT,
  withCheck TEXT
);
COMMENT ON TABLE policydefinitions IS 'Generated from: tools\auto-database-analyzer.ts';

CREATE TABLE IF NOT EXISTS reminders (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  intention_id UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  type UNKNOWN,
  scheduled_for UNKNOWN,
  parish_id UNKNOWN,
  metadata UNKNOWN,
  status UNKNOWN
);
COMMENT ON TABLE reminders IS 'Generated from: services\notificationService.ts';

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  start_time UNKNOWN,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  end_time UNKNOWN,
  parish_id UNKNOWN,
  status UNKNOWN
);
COMMENT ON TABLE calendar_events IS 'Generated from: services\calendarService.ts';

-- Add foreign key constraints
ALTER TABLE payments ADD CONSTRAINT fk_payments_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE payments ADD CONSTRAINT fk_payments_intentionId FOREIGN KEY (intentionId) REFERENCES intentions(id) ON DELETE CASCADE;
ALTER TABLE paymentintents ADD CONSTRAINT fk_paymentintents_payment_id FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE;
ALTER TABLE paymentsessions ADD CONSTRAINT fk_paymentsessions_payment_id FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE;
ALTER TABLE priests ADD CONSTRAINT fk_priests_parish_id FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE;
ALTER TABLE priests ADD CONSTRAINT fk_priests_churchId FOREIGN KEY (churchId) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE priests ADD CONSTRAINT fk_priests_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE masses ADD CONSTRAINT fk_masses_parish_id FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE;
ALTER TABLE masses ADD CONSTRAINT fk_masses_priest_id FOREIGN KEY (priest_id) REFERENCES priests(id) ON DELETE CASCADE;
ALTER TABLE massintentions ADD CONSTRAINT fk_massintentions_mass_id FOREIGN KEY (mass_id) REFERENCES masses(id) ON DELETE CASCADE;
ALTER TABLE massintentions ADD CONSTRAINT fk_massintentions_payment_id FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE;
ALTER TABLE massintentions ADD CONSTRAINT fk_massintentions_churchId FOREIGN KEY (churchId) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE massintentions ADD CONSTRAINT fk_massintentions_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE massintentions ADD CONSTRAINT fk_massintentions_parish_id FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE;
ALTER TABLE announcements ADD CONSTRAINT fk_announcements_parish_id FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT fk_users_parish_id FOREIGN KEY (parish_id) REFERENCES parishes(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notificationpayloads ADD CONSTRAINT fk_notificationpayloads_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE memberships ADD CONSTRAINT fk_memberships_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE memberships ADD CONSTRAINT fk_memberships_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE massschedules ADD CONSTRAINT fk_massschedules_churchId FOREIGN KEY (churchId) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE massschedules ADD CONSTRAINT fk_massschedules_priestId FOREIGN KEY (priestId) REFERENCES priests(id) ON DELETE CASCADE;
ALTER TABLE churchfeatures ADD CONSTRAINT fk_churchfeatures_churchId FOREIGN KEY (churchId) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE churchreviews ADD CONSTRAINT fk_churchreviews_churchId FOREIGN KEY (churchId) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE churchreviews ADD CONSTRAINT fk_churchreviews_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE churchreviews ADD CONSTRAINT fk_churchreviews_orderId FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE churchstatses ADD CONSTRAINT fk_churchstatses_churchId FOREIGN KEY (churchId) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE churchverificationdatas ADD CONSTRAINT fk_churchverificationdatas_churchId FOREIGN KEY (churchId) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE oremuscandles ADD CONSTRAINT fk_oremuscandles_nfc_id FOREIGN KEY (nfc_id) REFERENCES nfcs(id) ON DELETE CASCADE;
ALTER TABLE oremuscandles ADD CONSTRAINT fk_oremuscandles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE oremuscandles ADD CONSTRAINT fk_oremuscandles_nfcId FOREIGN KEY (nfcId) REFERENCES nfcs(id) ON DELETE CASCADE;
ALTER TABLE extendcandlerequests ADD CONSTRAINT fk_extendcandlerequests_candle_id FOREIGN KEY (candle_id) REFERENCES candles(id) ON DELETE CASCADE;
ALTER TABLE userprofiles ADD CONSTRAINT fk_userprofiles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE userprogresses ADD CONSTRAINT fk_userprogresses_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE userprogresses ADD CONSTRAINT fk_userprogresses_trackId FOREIGN KEY (trackId) REFERENCES tracks(id) ON DELETE CASCADE;
ALTER TABLE userpreferenceses ADD CONSTRAINT fk_userpreferenceses_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE createpaymentintentbodies ADD CONSTRAINT fk_createpaymentintentbodies_intentionId FOREIGN KEY (intentionId) REFERENCES intentions(id) ON DELETE CASCADE;
ALTER TABLE createpaymentintentresponses ADD CONSTRAINT fk_createpaymentintentresponses_payment_id FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE;
ALTER TABLE analyticsevents ADD CONSTRAINT fk_analyticsevents_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE analyticsevents ADD CONSTRAINT fk_analyticsevents_entityId FOREIGN KEY (entityId) REFERENCES entities(id) ON DELETE CASCADE;
ALTER TABLE analyticspayloads ADD CONSTRAINT fk_analyticspayloads_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE analyticspayloads ADD CONSTRAINT fk_analyticspayloads_entityId FOREIGN KEY (entityId) REFERENCES entities(id) ON DELETE CASCADE;
ALTER TABLE paymentresults ADD CONSTRAINT fk_paymentresults_paymentIntentId FOREIGN KEY (paymentIntentId) REFERENCES paymentIntents(id) ON DELETE CASCADE;
ALTER TABLE calendareventinputs ADD CONSTRAINT fk_calendareventinputs_parishId FOREIGN KEY (parishId) REFERENCES parishes(id) ON DELETE CASCADE;
ALTER TABLE courses ADD CONSTRAINT fk_courses_lessons FOREIGN KEY (lessons) REFERENCES lessons(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT fk_lessons_courseId FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT fk_lessons_course FOREIGN KEY (course) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE certificates ADD CONSTRAINT fk_certificates_courseId FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE quizattempts ADD CONSTRAINT fk_quizattempts_lessonId FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE CASCADE;
ALTER TABLE quizattempts ADD CONSTRAINT fk_quizattempts_questionId FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE;
ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_church FOREIGN KEY (church) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_user FOREIGN KEY (user) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE massorderdatas ADD CONSTRAINT fk_massorderdatas_church_id FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE paymentfailuredatas ADD CONSTRAINT fk_paymentfailuredatas_intentionId FOREIGN KEY (intentionId) REFERENCES intentions(id) ON DELETE CASCADE;
ALTER TABLE courseenrollmentdatas ADD CONSTRAINT fk_courseenrollmentdatas_courseId FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE coursecompletiondatas ADD CONSTRAINT fk_coursecompletiondatas_certificateId FOREIGN KEY (certificateId) REFERENCES certificates(id) ON DELETE CASCADE;
ALTER TABLE announcementdatas ADD CONSTRAINT fk_announcementdatas_parishId FOREIGN KEY (parishId) REFERENCES parishes(id) ON DELETE CASCADE;
ALTER TABLE paymentstatustrackerpropses ADD CONSTRAINT fk_paymentstatustrackerpropses_paymentId FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE CASCADE;
ALTER TABLE useacademyoptionses ADD CONSTRAINT fk_useacademyoptionses_courseId FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE providerspropses ADD CONSTRAINT fk_providerspropses_initialOrganizationId FOREIGN KEY (initialOrganizationId) REFERENCES initialOrganizations(id) ON DELETE CASCADE;
ALTER TABLE statuslistenerpropses ADD CONSTRAINT fk_statuslistenerpropses_paymentId FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE CASCADE;
ALTER TABLE tracks ADD CONSTRAINT fk_tracks_courseId FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE playerpropses ADD CONSTRAINT fk_playerpropses_initialTrackId FOREIGN KEY (initialTrackId) REFERENCES initialTracks(id) ON DELETE CASCADE;
ALTER TABLE datetimepickerpropses ADD CONSTRAINT fk_datetimepickerpropses_churchId FOREIGN KEY (churchId) REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE courseviewerpropses ADD CONSTRAINT fk_courseviewerpropses_courseId FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE generatedreportspropses ADD CONSTRAINT fk_generatedreportspropses_reportId FOREIGN KEY (reportId) REFERENCES reports(id) ON DELETE CASCADE;
ALTER TABLE nfctagdatas ADD CONSTRAINT fk_nfctagdatas_nfcId FOREIGN KEY (nfcId) REFERENCES nfcs(id) ON DELETE CASCADE;
ALTER TABLE nfctagdatas ADD CONSTRAINT fk_nfctagdatas_candleId FOREIGN KEY (candleId) REFERENCES candles(id) ON DELETE CASCADE;

-- Add indexes
ALTER TABLE windows ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_windows_created_at ON windows(created_at);
ALTER TABLE databases ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_databases_created_at ON databases(created_at);
ALTER TABLE pushserviceconfigs ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_pushserviceconfigs_created_at ON pushserviceconfigs(created_at);
ALTER TABLE pushsubscriptionkeyses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_pushsubscriptionkeyses_created_at ON pushsubscriptionkeyses(created_at);
ALTER TABLE pushsubscriptionjsons ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_pushsubscriptionjsons_created_at ON pushsubscriptionjsons(created_at);
ALTER TABLE pushsubscriptions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_pushsubscriptions_created_at ON pushsubscriptions(created_at);
ALTER TABLE pushmanagers ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_pushmanagers_created_at ON pushmanagers(created_at);
ALTER TABLE serviceworkerregistrations ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_serviceworkerregistrations_created_at ON serviceworkerregistrations(created_at);
ALTER TABLE serviceworkerglobalscopes ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_serviceworkerglobalscopes_created_at ON serviceworkerglobalscopes(created_at);
ALTER TABLE payments ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_intentionId ON payments(intentionId);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
ALTER TABLE paymentintents ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paymentintents_payment_id ON paymentintents(payment_id);
CREATE INDEX IF NOT EXISTS idx_paymentintents_created_at ON paymentintents(created_at);
ALTER TABLE paymentsessions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paymentsessions_payment_id ON paymentsessions(payment_id);
CREATE INDEX IF NOT EXISTS idx_paymentsessions_created_at ON paymentsessions(created_at);
ALTER TABLE parishes ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_parishes_created_at ON parishes(created_at);
ALTER TABLE priests ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_priests_parish_id ON priests(parish_id);
CREATE INDEX IF NOT EXISTS idx_priests_churchId ON priests(churchId);
CREATE INDEX IF NOT EXISTS idx_priests_userId ON priests(userId);
CREATE INDEX IF NOT EXISTS idx_priests_created_at ON priests(created_at);
ALTER TABLE masses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_masses_parish_id ON masses(parish_id);
CREATE INDEX IF NOT EXISTS idx_masses_priest_id ON masses(priest_id);
CREATE INDEX IF NOT EXISTS idx_masses_created_at ON masses(created_at);
ALTER TABLE massintentions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_massintentions_mass_id ON massintentions(mass_id);
CREATE INDEX IF NOT EXISTS idx_massintentions_payment_id ON massintentions(payment_id);
CREATE INDEX IF NOT EXISTS idx_massintentions_churchId ON massintentions(churchId);
CREATE INDEX IF NOT EXISTS idx_massintentions_userId ON massintentions(userId);
CREATE INDEX IF NOT EXISTS idx_massintentions_parish_id ON massintentions(parish_id);
CREATE INDEX IF NOT EXISTS idx_massintentions_created_at ON massintentions(created_at);
ALTER TABLE announcements ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_announcements_parish_id ON announcements(parish_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
ALTER TABLE users ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_users_parish_id ON users(parish_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
ALTER TABLE notifications ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
ALTER TABLE notificationtemplates ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_notificationtemplates_created_at ON notificationtemplates(created_at);
ALTER TABLE notificationpayloads ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_notificationpayloads_userId ON notificationpayloads(userId);
CREATE INDEX IF NOT EXISTS idx_notificationpayloads_created_at ON notificationpayloads(created_at);
ALTER TABLE organizations ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);
ALTER TABLE ratelimitsettingses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_ratelimitsettingses_created_at ON ratelimitsettingses(created_at);
ALTER TABLE organizationsettingses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_organizationsettingses_created_at ON organizationsettingses(created_at);
ALTER TABLE memberpermissionses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_memberpermissionses_created_at ON memberpermissionses(created_at);
ALTER TABLE memberships ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_created_at ON memberships(created_at);
ALTER TABLE churches ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churches_created_at ON churches(created_at);
ALTER TABLE massintentionstatses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_massintentionstatses_created_at ON massintentionstatses(created_at);
ALTER TABLE massintentionfilterses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_massintentionfilterses_created_at ON massintentionfilterses(created_at);
ALTER TABLE massschedules ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_massschedules_churchId ON massschedules(churchId);
CREATE INDEX IF NOT EXISTS idx_massschedules_priestId ON massschedules(priestId);
CREATE INDEX IF NOT EXISTS idx_massschedules_created_at ON massschedules(created_at);
ALTER TABLE churchfeatures ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchfeatures_churchId ON churchfeatures(churchId);
CREATE INDEX IF NOT EXISTS idx_churchfeatures_created_at ON churchfeatures(created_at);
ALTER TABLE churchreviews ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchreviews_churchId ON churchreviews(churchId);
CREATE INDEX IF NOT EXISTS idx_churchreviews_userId ON churchreviews(userId);
CREATE INDEX IF NOT EXISTS idx_churchreviews_orderId ON churchreviews(orderId);
CREATE INDEX IF NOT EXISTS idx_churchreviews_created_at ON churchreviews(created_at);
ALTER TABLE churchstatses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchstatses_churchId ON churchstatses(churchId);
CREATE INDEX IF NOT EXISTS idx_churchstatses_created_at ON churchstatses(created_at);
ALTER TABLE churchsummaries ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchsummaries_created_at ON churchsummaries(created_at);
ALTER TABLE churchsearchfilterses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchsearchfilterses_created_at ON churchsearchfilterses(created_at);
ALTER TABLE churchsearchresults ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchsearchresults_created_at ON churchsearchresults(created_at);
ALTER TABLE churchregistrationdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchregistrationdatas_created_at ON churchregistrationdatas(created_at);
ALTER TABLE churchverificationdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchverificationdatas_churchId ON churchverificationdatas(churchId);
CREATE INDEX IF NOT EXISTS idx_churchverificationdatas_created_at ON churchverificationdatas(created_at);
ALTER TABLE churchapiresponses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchapiresponses_created_at ON churchapiresponses(created_at);
ALTER TABLE churchlistapiresponses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchlistapiresponses_created_at ON churchlistapiresponses(created_at);
ALTER TABLE churchvalidationruleses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchvalidationruleses_created_at ON churchvalidationruleses(created_at);
ALTER TABLE oremuscandles ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_oremuscandles_nfc_id ON oremuscandles(nfc_id);
CREATE INDEX IF NOT EXISTS idx_oremuscandles_user_id ON oremuscandles(user_id);
CREATE INDEX IF NOT EXISTS idx_oremuscandles_nfcId ON oremuscandles(nfcId);
CREATE INDEX IF NOT EXISTS idx_oremuscandles_created_at ON oremuscandles(created_at);
ALTER TABLE extendcandlerequests ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_extendcandlerequests_candle_id ON extendcandlerequests(candle_id);
CREATE INDEX IF NOT EXISTS idx_extendcandlerequests_created_at ON extendcandlerequests(created_at);
ALTER TABLE candlestatses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_candlestatses_created_at ON candlestatses(created_at);
ALTER TABLE autherrors ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_autherrors_created_at ON autherrors(created_at);
ALTER TABLE authstates ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_authstates_created_at ON authstates(created_at);
ALTER TABLE passwordvalidations ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_passwordvalidations_created_at ON passwordvalidations(created_at);
ALTER TABLE userprofiles ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_userprofiles_user_id ON userprofiles(user_id);
CREATE INDEX IF NOT EXISTS idx_userprofiles_created_at ON userprofiles(created_at);
ALTER TABLE resetpassworddatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_resetpassworddatas_created_at ON resetpassworddatas(created_at);
ALTER TABLE authresponses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_authresponses_created_at ON authresponses(created_at);
ALTER TABLE audiotracks ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_audiotracks_created_at ON audiotracks(created_at);
ALTER TABLE prayersegments ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_prayersegments_created_at ON prayersegments(created_at);
ALTER TABLE chapters ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_chapters_created_at ON chapters(created_at);
ALTER TABLE userprogresses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_userprogresses_userId ON userprogresses(userId);
CREATE INDEX IF NOT EXISTS idx_userprogresses_trackId ON userprogresses(trackId);
CREATE INDEX IF NOT EXISTS idx_userprogresses_created_at ON userprogresses(created_at);
ALTER TABLE userpreferenceses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_userpreferenceses_userId ON userpreferenceses(userId);
CREATE INDEX IF NOT EXISTS idx_userpreferenceses_created_at ON userpreferenceses(created_at);
ALTER TABLE createpaymentintentbodies ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_createpaymentintentbodies_intentionId ON createpaymentintentbodies(intentionId);
CREATE INDEX IF NOT EXISTS idx_createpaymentintentbodies_created_at ON createpaymentintentbodies(created_at);
ALTER TABLE createpaymentintentresponses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_createpaymentintentresponses_payment_id ON createpaymentintentresponses(payment_id);
CREATE INDEX IF NOT EXISTS idx_createpaymentintentresponses_created_at ON createpaymentintentresponses(created_at);
ALTER TABLE analyticsevents ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_analyticsevents_userId ON analyticsevents(userId);
CREATE INDEX IF NOT EXISTS idx_analyticsevents_entityId ON analyticsevents(entityId);
CREATE INDEX IF NOT EXISTS idx_analyticsevents_created_at ON analyticsevents(created_at);
ALTER TABLE webhookevents ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_webhookevents_created_at ON webhookevents(created_at);
ALTER TABLE reportconfigs ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_reportconfigs_created_at ON reportconfigs(created_at);
ALTER TABLE analyticspayloads ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_analyticspayloads_userId ON analyticspayloads(userId);
CREATE INDEX IF NOT EXISTS idx_analyticspayloads_entityId ON analyticspayloads(entityId);
CREATE INDEX IF NOT EXISTS idx_analyticspayloads_created_at ON analyticspayloads(created_at);
ALTER TABLE realtimesubscriptions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_realtimesubscriptions_created_at ON realtimesubscriptions(created_at);
ALTER TABLE createpaymentintentdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_createpaymentintentdatas_created_at ON createpaymentintentdatas(created_at);
ALTER TABLE paymentresults ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paymentresults_paymentIntentId ON paymentresults(paymentIntentId);
CREATE INDEX IF NOT EXISTS idx_paymentresults_created_at ON paymentresults(created_at);
ALTER TABLE audio_content ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_audio_content_created_at ON audio_content(created_at);
ALTER TABLE user_favorites ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);
ALTER TABLE calendareventinputs ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_calendareventinputs_parishId ON calendareventinputs(parishId);
CREATE INDEX IF NOT EXISTS idx_calendareventinputs_created_at ON calendareventinputs(created_at);
ALTER TABLE audio_tracks ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_audio_tracks_created_at ON audio_tracks(created_at);
ALTER TABLE analytics_events ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
ALTER TABLE courses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_courses_lessons ON courses(lessons);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);
ALTER TABLE lessons ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_lessons_courseId ON lessons(courseId);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons(created_at);
ALTER TABLE certificates ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_certificates_courseId ON certificates(courseId);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at);
ALTER TABLE quizattempts ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_quizattempts_lessonId ON quizattempts(lessonId);
CREATE INDEX IF NOT EXISTS idx_quizattempts_questionId ON quizattempts(questionId);
CREATE INDEX IF NOT EXISTS idx_quizattempts_created_at ON quizattempts(created_at);
ALTER TABLE report_configs ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_report_configs_created_at ON report_configs(created_at);
ALTER TABLE generated_reports ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_created_at ON generated_reports(created_at);
ALTER TABLE reportdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_reportdatas_created_at ON reportdatas(created_at);
ALTER TABLE mass_intentions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_mass_intentions_church ON mass_intentions(church);
CREATE INDEX IF NOT EXISTS idx_mass_intentions_user ON mass_intentions(user);
CREATE INDEX IF NOT EXISTS idx_mass_intentions_created_at ON mass_intentions(created_at);
ALTER TABLE notification_subscriptions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_created_at ON notification_subscriptions(created_at);
ALTER TABLE notificationsubscriptions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_notificationsubscriptions_created_at ON notificationsubscriptions(created_at);
ALTER TABLE scheduled_notifications ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_created_at ON scheduled_notifications(created_at);
ALTER TABLE massorderdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_massorderdatas_church_id ON massorderdatas(church_id);
CREATE INDEX IF NOT EXISTS idx_massorderdatas_created_at ON massorderdatas(created_at);
ALTER TABLE templatevariableses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_templatevariableses_created_at ON templatevariableses(created_at);
ALTER TABLE paymentconfirmationdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paymentconfirmationdatas_created_at ON paymentconfirmationdatas(created_at);
ALTER TABLE paymentfailuredatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paymentfailuredatas_intentionId ON paymentfailuredatas(intentionId);
CREATE INDEX IF NOT EXISTS idx_paymentfailuredatas_created_at ON paymentfailuredatas(created_at);
ALTER TABLE refundconfirmationdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_refundconfirmationdatas_created_at ON refundconfirmationdatas(created_at);
ALTER TABLE reminderdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_reminderdatas_created_at ON reminderdatas(created_at);
ALTER TABLE courseenrollmentdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_courseenrollmentdatas_courseId ON courseenrollmentdatas(courseId);
CREATE INDEX IF NOT EXISTS idx_courseenrollmentdatas_created_at ON courseenrollmentdatas(created_at);
ALTER TABLE coursecompletiondatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_coursecompletiondatas_certificateId ON coursecompletiondatas(certificateId);
CREATE INDEX IF NOT EXISTS idx_coursecompletiondatas_created_at ON coursecompletiondatas(created_at);
ALTER TABLE passwordresetdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_passwordresetdatas_created_at ON passwordresetdatas(created_at);
ALTER TABLE emailverificationdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_emailverificationdatas_created_at ON emailverificationdatas(created_at);
ALTER TABLE parishregistrationdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_parishregistrationdatas_created_at ON parishregistrationdatas(created_at);
ALTER TABLE webhookfailuredatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_webhookfailuredatas_created_at ON webhookfailuredatas(created_at);
ALTER TABLE announcementdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_announcementdatas_parishId ON announcementdatas(parishId);
CREATE INDEX IF NOT EXISTS idx_announcementdatas_created_at ON announcementdatas(created_at);
ALTER TABLE reportreadydatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_reportreadydatas_created_at ON reportreadydatas(created_at);
ALTER TABLE candles ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_candles_created_at ON candles(created_at);
ALTER TABLE user_profiles ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
ALTER TABLE webhook_events ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);
ALTER TABLE layoutinfos ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_layoutinfos_created_at ON layoutinfos(created_at);
ALTER TABLE usereportings ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_usereportings_created_at ON usereportings(created_at);
ALTER TABLE subscriptionfilters ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_subscriptionfilters_created_at ON subscriptionfilters(created_at);
ALTER TABLE useperformancemonitorpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_useperformancemonitorpropses_created_at ON useperformancemonitorpropses(created_at);
ALTER TABLE paymentstatustrackerpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paymentstatustrackerpropses_paymentId ON paymentstatustrackerpropses(paymentId);
CREATE INDEX IF NOT EXISTS idx_paymentstatustrackerpropses_created_at ON paymentstatustrackerpropses(created_at);
ALTER TABLE usenotificationses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_usenotificationses_created_at ON usenotificationses(created_at);
ALTER TABLE featureflagses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_featureflagses_created_at ON featureflagses(created_at);
ALTER TABLE registermetadatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_registermetadatas_created_at ON registermetadatas(created_at);
ALTER TABLE useanalyticses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_useanalyticses_created_at ON useanalyticses(created_at);
ALTER TABLE useacademyoptionses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_useacademyoptionses_courseId ON useacademyoptionses(courseId);
CREATE INDEX IF NOT EXISTS idx_useacademyoptionses_created_at ON useacademyoptionses(created_at);
ALTER TABLE scheduleconfigs ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_scheduleconfigs_created_at ON scheduleconfigs(created_at);
ALTER TABLE providerspropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_providerspropses_initialOrganizationId ON providerspropses(initialOrganizationId);
CREATE INDEX IF NOT EXISTS idx_providerspropses_created_at ON providerspropses(created_at);
ALTER TABLE statuscardpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_statuscardpropses_created_at ON statuscardpropses(created_at);
ALTER TABLE registerforms ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_registerforms_created_at ON registerforms(created_at);
ALTER TABLE propses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_propses_created_at ON propses(created_at);
ALTER TABLE student_lessons ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_student_lessons_created_at ON student_lessons(created_at);
ALTER TABLE splashscreenpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_splashscreenpropses_created_at ON splashscreenpropses(created_at);
ALTER TABLE statuslistenerpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_statuslistenerpropses_paymentId ON statuslistenerpropses(paymentId);
CREATE INDEX IF NOT EXISTS idx_statuslistenerpropses_created_at ON statuslistenerpropses(created_at);
ALTER TABLE statusindicatorpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_statusindicatorpropses_created_at ON statusindicatorpropses(created_at);
ALTER TABLE paymentstatusbadgepropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paymentstatusbadgepropses_created_at ON paymentstatusbadgepropses(created_at);
ALTER TABLE churchselectorpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_churchselectorpropses_created_at ON churchselectorpropses(created_at);
ALTER TABLE neumorphicbuttonpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_neumorphicbuttonpropses_created_at ON neumorphicbuttonpropses(created_at);
ALTER TABLE glasspanelpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_glasspanelpropses_created_at ON glasspanelpropses(created_at);
ALTER TABLE datepickerpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_datepickerpropses_created_at ON datepickerpropses(created_at);
ALTER TABLE calendarpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_calendarpropses_created_at ON calendarpropses(created_at);
ALTER TABLE adaptivegridpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_adaptivegridpropses_created_at ON adaptivegridpropses(created_at);
ALTER TABLE toastpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_toastpropses_created_at ON toastpropses(created_at);
ALTER TABLE toastcontexts ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_toastcontexts_created_at ON toastcontexts(created_at);
ALTER TABLE responsivecontainerpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_responsivecontainerpropses_created_at ON responsivecontainerpropses(created_at);
ALTER TABLE glasscardpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_glasscardpropses_created_at ON glasscardpropses(created_at);
ALTER TABLE buttonpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_buttonpropses_created_at ON buttonpropses(created_at);
ALTER TABLE animatedcardpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_animatedcardpropses_created_at ON animatedcardpropses(created_at);
ALTER TABLE activityitems ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_activityitems_created_at ON activityitems(created_at);
ALTER TABLE recentactivitypropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_recentactivitypropses_created_at ON recentactivitypropses(created_at);
ALTER TABLE quickstatsdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_quickstatsdatas_created_at ON quickstatsdatas(created_at);
ALTER TABLE quickstatspropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_quickstatspropses_created_at ON quickstatspropses(created_at);
ALTER TABLE logoanimatedpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_logoanimatedpropses_created_at ON logoanimatedpropses(created_at);
ALTER TABLE logopropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_logopropses_created_at ON logopropses(created_at);
ALTER TABLE datagridpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_datagridpropses_created_at ON datagridpropses(created_at);
ALTER TABLE modalpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_modalpropses_created_at ON modalpropses(created_at);
ALTER TABLE searchresults ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_searchresults_created_at ON searchresults(created_at);
ALTER TABLE smartsearchpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_smartsearchpropses_created_at ON smartsearchpropses(created_at);
ALTER TABLE authcardpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_authcardpropses_created_at ON authcardpropses(created_at);
ALTER TABLE prayers ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers(created_at);
ALTER TABLE prayermappropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_prayermappropses_created_at ON prayermappropses(created_at);
ALTER TABLE rosarybeads ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_rosarybeads_created_at ON rosarybeads(created_at);
ALTER TABLE rosarymysteries ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_rosarymysteries_created_at ON rosarymysteries(created_at);
ALTER TABLE interactiverosarypropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_interactiverosarypropses_created_at ON interactiverosarypropses(created_at);
ALTER TABLE odbplayerpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_odbplayerpropses_created_at ON odbplayerpropses(created_at);
ALTER TABLE interactiveprayers ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_interactiveprayers_created_at ON interactiveprayers(created_at);
ALTER TABLE videos ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
ALTER TABLE courseplayerpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_courseplayerpropses_created_at ON courseplayerpropses(created_at);
ALTER TABLE tracks ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_tracks_courseId ON tracks(courseId);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at);
ALTER TABLE playerpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_playerpropses_initialTrackId ON playerpropses(initialTrackId);
CREATE INDEX IF NOT EXISTS idx_playerpropses_created_at ON playerpropses(created_at);
ALTER TABLE paymentsectionpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paymentsectionpropses_created_at ON paymentsectionpropses(created_at);
ALTER TABLE intentionformpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_intentionformpropses_created_at ON intentionformpropses(created_at);
ALTER TABLE datetimepickerpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_datetimepickerpropses_churchId ON datetimepickerpropses(churchId);
CREATE INDEX IF NOT EXISTS idx_datetimepickerpropses_created_at ON datetimepickerpropses(created_at);
ALTER TABLE virtualcandlepropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_virtualcandlepropses_created_at ON virtualcandlepropses(created_at);
ALTER TABLE oremuscandlepropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_oremuscandlepropses_created_at ON oremuscandlepropses(created_at);
ALTER TABLE courseviewerpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_courseviewerpropses_courseId ON courseviewerpropses(courseId);
CREATE INDEX IF NOT EXISTS idx_courseviewerpropses_created_at ON courseviewerpropses(created_at);
ALTER TABLE breadcrumbitems ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_breadcrumbitems_created_at ON breadcrumbitems(created_at);
ALTER TABLE breadcrumbspropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_breadcrumbspropses_created_at ON breadcrumbspropses(created_at);
ALTER TABLE oremuslogopropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_oremuslogopropses_created_at ON oremuslogopropses(created_at);
ALTER TABLE reportlistpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_reportlistpropses_created_at ON reportlistpropses(created_at);
ALTER TABLE reportgeneratorpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_reportgeneratorpropses_created_at ON reportgeneratorpropses(created_at);
ALTER TABLE parameterinputpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_parameterinputpropses_created_at ON parameterinputpropses(created_at);
ALTER TABLE newreportformpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_newreportformpropses_created_at ON newreportformpropses(created_at);
ALTER TABLE generatedreportspropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_generatedreportspropses_reportId ON generatedreportspropses(reportId);
CREATE INDEX IF NOT EXISTS idx_generatedreportspropses_created_at ON generatedreportspropses(created_at);
ALTER TABLE reportfiles ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_reportfiles_created_at ON reportfiles(created_at);
ALTER TABLE priestformpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_priestformpropses_created_at ON priestformpropses(created_at);
ALTER TABLE webhookstatuspropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_webhookstatuspropses_created_at ON webhookstatuspropses(created_at);
ALTER TABLE notificationmetricspropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_notificationmetricspropses_created_at ON notificationmetricspropses(created_at);
ALTER TABLE metriccardpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_metriccardpropses_created_at ON metriccardpropses(created_at);
ALTER TABLE paymentstatspropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paymentstatspropses_created_at ON paymentstatspropses(created_at);
ALTER TABLE parishformpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_parishformpropses_created_at ON parishformpropses(created_at);
ALTER TABLE massesfordates ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_massesfordates_created_at ON massesfordates(created_at);
ALTER TABLE masscardpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_masscardpropses_created_at ON masscardpropses(created_at);
ALTER TABLE announcementformpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_announcementformpropses_created_at ON announcementformpropses(created_at);
ALTER TABLE templateoptions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_templateoptions_created_at ON templateoptions(created_at);
ALTER TABLE datapoints ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_datapoints_created_at ON datapoints(created_at);
ALTER TABLE trendchartpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_trendchartpropses_created_at ON trendchartpropses(created_at);
ALTER TABLE statscardpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_statscardpropses_created_at ON statscardpropses(created_at);
ALTER TABLE chartdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_chartdatas_created_at ON chartdatas(created_at);
ALTER TABLE piechartdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_piechartdatas_created_at ON piechartdatas(created_at);
ALTER TABLE linechartdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_linechartdatas_created_at ON linechartdatas(created_at);
ALTER TABLE metricstablepropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_metricstablepropses_created_at ON metricstablepropses(created_at);
ALTER TABLE coursemetricspropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_coursemetricspropses_created_at ON coursemetricspropses(created_at);
ALTER TABLE analyticscardpropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_analyticscardpropses_created_at ON analyticscardpropses(created_at);
ALTER TABLE activityitempropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_activityitempropses_created_at ON activityitempropses(created_at);
ALTER TABLE glasspropses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_glasspropses_created_at ON glasspropses(created_at);
ALTER TABLE navigationitems ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_navigationitems_created_at ON navigationitems(created_at);
ALTER TABLE navigationsections ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_navigationsections_created_at ON navigationsections(created_at);
ALTER TABLE sortconfigs ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_sortconfigs_created_at ON sortconfigs(created_at);
ALTER TABLE paginationconfigs ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_paginationconfigs_created_at ON paginationconfigs(created_at);
ALTER TABLE nfctagdatas ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_nfctagdatas_nfcId ON nfctagdatas(nfcId);
CREATE INDEX IF NOT EXISTS idx_nfctagdatas_candleId ON nfctagdatas(candleId);
CREATE INDEX IF NOT EXISTS idx_nfctagdatas_created_at ON nfctagdatas(created_at);
ALTER TABLE nfctagresponses ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_nfctagresponses_created_at ON nfctagresponses(created_at);
ALTER TABLE migrationissues ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_migrationissues_created_at ON migrationissues(created_at);
ALTER TABLE schemachangeevents ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_schemachangeevents_created_at ON schemachangeevents(created_at);
ALTER TABLE tablefields ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_tablefields_created_at ON tablefields(created_at);
ALTER TABLE tables ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_tables_created_at ON tables(created_at);
ALTER TABLE enums ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_enums_created_at ON enums(created_at);
ALTER TABLE schemainfos ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_schemainfos_created_at ON schemainfos(created_at);
ALTER TABLE table_name ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_table_name_created_at ON table_name(created_at);
ALTER TABLE oremustables ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_oremustables_created_at ON oremustables(created_at);
ALTER TABLE tableusages ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_tableusages_created_at ON tableusages(created_at);
ALTER TABLE missingtables ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_missingtables_created_at ON missingtables(created_at);
ALTER TABLE tabledefinitions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_tabledefinitions_created_at ON tabledefinitions(created_at);
ALTER TABLE columndefinitions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_columndefinitions_created_at ON columndefinitions(created_at);
ALTER TABLE relationshipdefinitions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_relationshipdefinitions_created_at ON relationshipdefinitions(created_at);
ALTER TABLE indexdefinitions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_indexdefinitions_created_at ON indexdefinitions(created_at);
ALTER TABLE policydefinitions ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_policydefinitions_created_at ON policydefinitions(created_at);
ALTER TABLE reminders ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_reminders_created_at ON reminders(created_at);
ALTER TABLE calendar_events ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_at ON calendar_events(created_at);

-- Enable Row Level Security
ALTER TABLE windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pushserviceconfigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pushsubscriptionkeyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pushsubscriptionjsons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pushsubscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pushmanagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE serviceworkerregistrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE serviceworkerglobalscopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymentintents ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymentsessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE priests ENABLE ROW LEVEL SECURITY;
ALTER TABLE masses ENABLE ROW LEVEL SECURITY;
ALTER TABLE massintentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificationtemplates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificationpayloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratelimitsettingses ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizationsettingses ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberpermissionses ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE massintentionstatses ENABLE ROW LEVEL SECURITY;
ALTER TABLE massintentionfilterses ENABLE ROW LEVEL SECURITY;
ALTER TABLE massschedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchfeatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchreviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchstatses ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchsummaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchsearchfilterses ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchsearchresults ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchregistrationdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchverificationdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchapiresponses ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchlistapiresponses ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchvalidationruleses ENABLE ROW LEVEL SECURITY;
ALTER TABLE oremuscandles ENABLE ROW LEVEL SECURITY;
ALTER TABLE extendcandlerequests ENABLE ROW LEVEL SECURITY;
ALTER TABLE candlestatses ENABLE ROW LEVEL SECURITY;
ALTER TABLE autherrors ENABLE ROW LEVEL SECURITY;
ALTER TABLE authstates ENABLE ROW LEVEL SECURITY;
ALTER TABLE passwordvalidations ENABLE ROW LEVEL SECURITY;
ALTER TABLE userprofiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resetpassworddatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE authresponses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiotracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayersegments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE userprogresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE userpreferenceses ENABLE ROW LEVEL SECURITY;
ALTER TABLE createpaymentintentbodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE createpaymentintentresponses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyticsevents ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhookevents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportconfigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyticspayloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtimesubscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE createpaymentintentdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymentresults ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendareventinputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizattempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mass_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificationsubscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE massorderdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE templatevariableses ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymentconfirmationdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymentfailuredatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE refundconfirmationdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminderdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE courseenrollmentdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE coursecompletiondatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE passwordresetdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE emailverificationdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parishregistrationdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhookfailuredatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcementdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportreadydatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE layoutinfos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usereportings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptionfilters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE useperformancemonitorpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymentstatustrackerpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE usenotificationses ENABLE ROW LEVEL SECURITY;
ALTER TABLE featureflagses ENABLE ROW LEVEL SECURITY;
ALTER TABLE registermetadatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE useanalyticses ENABLE ROW LEVEL SECURITY;
ALTER TABLE useacademyoptionses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduleconfigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE providerspropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuscardpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE registerforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE propses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE splashscreenpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuslistenerpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE statusindicatorpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymentstatusbadgepropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE churchselectorpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE neumorphicbuttonpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE glasspanelpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE datepickerpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendarpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptivegridpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE toastpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE toastcontexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsivecontainerpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE glasscardpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE buttonpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE animatedcardpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activityitems ENABLE ROW LEVEL SECURITY;
ALTER TABLE recentactivitypropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quickstatsdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE quickstatspropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE logoanimatedpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE logopropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE datagridpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modalpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE searchresults ENABLE ROW LEVEL SECURITY;
ALTER TABLE smartsearchpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE authcardpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayermappropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosarybeads ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosarymysteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactiverosarypropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE odbplayerpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactiveprayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE courseplayerpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playerpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymentsectionpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentionformpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE datetimepickerpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtualcandlepropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE oremuscandlepropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE courseviewerpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE breadcrumbitems ENABLE ROW LEVEL SECURITY;
ALTER TABLE breadcrumbspropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE oremuslogopropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportlistpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportgeneratorpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE parameterinputpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE newreportformpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE generatedreportspropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE priestformpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhookstatuspropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificationmetricspropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE metriccardpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymentstatspropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE parishformpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE massesfordates ENABLE ROW LEVEL SECURITY;
ALTER TABLE masscardpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcementformpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE templateoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE trendchartpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE statscardpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chartdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE piechartdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE linechartdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricstablepropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE coursemetricspropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyticscardpropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activityitempropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE glasspropses ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigationitems ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigationsections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sortconfigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE paginationconfigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfctagdatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfctagresponses ENABLE ROW LEVEL SECURITY;
ALTER TABLE migrationissues ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemachangeevents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tablefields ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE enums ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemainfos ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE oremustables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tableusages ENABLE ROW LEVEL SECURITY;
ALTER TABLE missingtables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabledefinitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE columndefinitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationshipdefinitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE indexdefinitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policydefinitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can only access their own data" ON notifications FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view their organizations" ON organizations FOR SELECT USING (id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));
CREATE POLICY "Users can only access their organization data" ON memberships FOR ALL USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));
CREATE POLICY "Users can only access their own data" ON oremuscandles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can only access their own data" ON userprofiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can only access their own data" ON user_favorites FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can only access their own data" ON analytics_events FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can only access their own data" ON notification_subscriptions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can only access their own data" ON candles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can only access their own data" ON user_profiles FOR ALL USING (user_id = auth.uid());