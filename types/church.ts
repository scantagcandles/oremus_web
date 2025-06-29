// types/church.ts
// TypeScript definitions for Church-related entities

export enum ChurchStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
  INACTIVE = 'inactive'
}

export enum PriestRole {
  PRIEST = 'priest',
  PASTOR = 'pastor',
  ADMINISTRATOR = 'administrator',
  VICAR = 'vicar',
  BISHOP = 'bishop',
  ARCHBISHOP = 'archbishop',
  CARDINAL = 'cardinal'
}

export enum MassType {
  REGULAR = 'regular',
  SUNDAY = 'sunday',
  HOLIDAY = 'holiday',
  WEDDING = 'wedding',
  FUNERAL = 'funeral',
  BAPTISM = 'baptism',
  FIRST_COMMUNION = 'first_communion',
  CONFIRMATION = 'confirmation',
  SPECIAL = 'special'
}

export enum FeatureType {
  PARKING = 'parking',
  ACCESSIBILITY = 'accessibility',
  AIR_CONDITIONING = 'air_conditioning',
  SOUND_SYSTEM = 'sound_system',
  LIVE_STREAMING = 'live_streaming',
  RECORDING = 'recording',
  FLOWERS = 'flowers',
  CANDLES = 'candles',
  MUSIC_ORGAN = 'music_organ',
  MUSIC_CHOIR = 'music_choir',
  PHOTOGRAPHY = 'photography',
  DECORATION = 'decoration',
  RECEPTION_HALL = 'reception_hall'
}

export interface Church {
  id: string;
  
  // Basic Information
  name: string;
  fullName?: string;
  shortName?: string;
  description?: string;
  
  // Contact Information
  email: string;
  phone?: string;
  website?: string;
  
  // Location
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  
  // Verification & Status
  status: ChurchStatus;
  verifiedAt?: Date;
  verifiedBy?: string;
  registrationDate: Date;
  
  // Features & Capabilities
  hasLiveStreaming: boolean;
  streamingPlatform?: 'youtube' | 'facebook' | 'custom';
  streamingUrl?: string;
  hasParking: boolean;
  hasAccessibility: boolean;
  
  // Financial
  baseMassPrice: number;
  acceptsOnlinePayments: boolean;
  currency: string;
  
  // Media
  logoUrl?: string;
  coverImageUrl?: string;
  photos: string[];
  
  // Settings
  autoConfirmOrders: boolean;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Priest {
  id: string;
  churchId: string;
  userId?: string; // Link to auth user
  
  // Personal Information
  firstName: string;
  lastName: string;
  title: string; // 'ks.', 'bp.', etc.
  
  // Contact
  email?: string;
  phone?: string;
  
  // Role & Status
  role: PriestRole;
  isPrimary: boolean; // Main contact priest
  isActive: boolean;
  
  // Specializations
  specializations: string[];
  languages: string[];
  
  // Availability
  availableDays: number[]; // 1=Monday, 7=Sunday
  availableHoursStart: string; // '08:00'
  availableHoursEnd: string; // '20:00'
  
  // Media
  avatarUrl?: string;
  bio?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Related data (populated)
  church?: Church;
}

export interface MassSchedule {
  id: string;
  churchId: string;
  priestId?: string;
  
  // Schedule Information
  dayOfWeek: number; // 1=Monday, 7=Sunday
  time: string; // '10:00'
  massType: MassType;
  language: string;
  
  // Capacity & Pricing
  maxCapacity: number;
  currentBookings: number;
  price?: number;
  
  // Features
  hasLiveStream: boolean;
  streamUrl?: string;
  isSpecialOccasion: boolean;
  
  // Availability
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Related data (populated)
  church?: Church;
  priest?: Priest;
}

export interface ChurchFeature {
  id: string;
  churchId: string;
  featureType: FeatureType;
  isAvailable: boolean;
  description?: string;
  additionalCost: number;
  createdAt: Date;
}

export interface ChurchReview {
  id: string;
  churchId: string;
  userId: string;
  orderId: string;
  
  // Review Content
  rating: number; // 1-5
  title?: string;
  comment?: string;
  
  // Review Categories
  serviceQuality?: number; // 1-5
  communication?: number; // 1-5
  valueForMoney?: number; // 1-5
  timeliness?: number; // 1-5
  
  // Status
  isVerified: boolean;
  isFeatured: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Related data (populated)
  church?: Church;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface ChurchStats {
  churchId: string;
  
  // Order Statistics
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  
  // Review Statistics
  totalReviews: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  
  // Response Statistics
  averageResponseTimeHours: number;
  responseRate: number; // Percentage
  
  // Financial Statistics
  totalRevenue: number;
  averageOrderValue: number;
  
  // Engagement Statistics
  profileViews: number;
  liveStreamViews: number;
  
  // Last Updated
  lastCalculated: Date;
  updatedAt: Date;
}

// Extended interfaces with related data
export interface ChurchWithDetails extends Church {
  priests: Priest[];
  schedules: MassSchedule[];
  features: ChurchFeature[];
  stats: ChurchStats;
  reviews: ChurchReview[];
  distance?: number; // When location-based search
}

export interface ChurchSummary {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviewCount: number;
  baseMassPrice: number;
  hasLiveStreaming: boolean;
  distance?: number;
  logoUrl?: string;
  nextAvailableSlot?: Date;
}

export interface ChurchSearchFilters {
  // Location
  city?: string;
  country?: string;
  maxDistance?: number; // km
  userLocation?: [number, number]; // [lat, lng]
  
  // Features
  hasLiveStreaming?: boolean;
  hasParking?: boolean;
  hasAccessibility?: boolean;
  features?: FeatureType[];
  
  // Pricing
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  
  // Quality
  minRating?: number;
  minReviewCount?: number;
  verifiedOnly?: boolean;
  
  // Availability
  massTypes?: MassType[];
  languages?: string[];
  availableDays?: number[];
  
  // Response
  maxResponseTime?: number; // hours
  autoConfirmOnly?: boolean;
  
  // Search
  query?: string; // Text search
  
  // Sorting
  sortBy?: 'distance' | 'rating' | 'price' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

export interface ChurchSearchResult {
  churches: ChurchWithDetails[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: ChurchSearchFilters;
}

// Registration & Management Types
export interface ChurchRegistrationData {
  // Basic Information
  name: string;
  fullName?: string;
  description?: string;
  
  // Contact Information
  email: string;
  phone?: string;
  website?: string;
  
  // Location
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  
  // Primary Priest
  priestFirstName: string;
  priestLastName: string;
  priestEmail: string;
  priestPhone?: string;
  
  // Features
  hasLiveStreaming: boolean;
  streamingPlatform?: string;
  streamingUrl?: string;
  hasParking: boolean;
  hasAccessibility: boolean;
  
  // Financial
  baseMassPrice: number;
  acceptsOnlinePayments: boolean;
  
  // Documents (for verification)
  documents?: File[];
  
  // Agreement
  agreesToTerms: boolean;
  agreesToDataProcessing: boolean;
}

export interface ChurchVerificationData {
  churchId: string;
  status: ChurchStatus;
  verificationNotes?: string;
  verifiedBy: string;
  verifiedAt: Date;
  documentsVerified: boolean;
  liveStreamingVerified?: boolean;
}

// API Response Types
export interface ChurchApiResponse {
  success: boolean;
  data?: ChurchWithDetails;
  error?: string;
  message?: string;
}

export interface ChurchListApiResponse {
  success: boolean;
  data?: ChurchSearchResult;
  error?: string;
  message?: string;
}

// Form validation schemas (for use with zod or similar)
export interface ChurchValidationRules {
  name: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  email: {
    required: boolean;
    format: 'email';
  };
  phone: {
    required: boolean;
    format: 'phone';
  };
  address: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  baseMassPrice: {
    min: number;
    max: number;
    required: boolean;
  };
}

// Constants
export const CHURCH_CONSTANTS = {
  DEFAULT_MASS_PRICE: 25.00,
  DEFAULT_CURRENCY: 'PLN',
  DEFAULT_COUNTRY: 'Poland',
  MAX_ADVANCE_BOOKING_DAYS: 90,
  MIN_ADVANCE_BOOKING_HOURS: 24,
  MAX_PHOTOS: 10,
  SUPPORTED_CURRENCIES: ['PLN', 'EUR', 'USD'],
  SUPPORTED_STREAMING_PLATFORMS: ['youtube', 'facebook', 'custom'],
  VERIFICATION_DOCUMENT_TYPES: [
    'parish_certificate',
    'priest_identification', 
    'church_photos',
    'streaming_setup_proof'
  ]
} as const;