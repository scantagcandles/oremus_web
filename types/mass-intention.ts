import { Database } from './supabase';

export interface MassIntention {
  id: string;
  parish_id: string;
  intention_for: string;
  mass_date: string;
  mass_time?: string;
  mass_type: 'regular' | 'requiem' | 'thanksgiving';
  status: MassIntentionStatus;
  payment_id: string | null;
  payment_status: string | null;
  is_paid: boolean;
  email: string;
  created_at: string;
  updated_at: string;
  parishes?: {
    id: string;
    name: string;
  };
}

export enum MassIntentionStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  SCHEDULED = 'scheduled',
  PAYMENT_FAILED = 'payment_failed',
  REFUNDED = 'refunded'
}

export interface MassIntentionStats {
  total: number;
  pending: number;
  paid: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  avgProcessingTime: number;
}

export interface MassIntentionFilters {
  status?: MassIntentionStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  church?: string;
  massType?: string;
  search?: string;
}

export interface MassType {
  id: string;
  name: string;
  price: number;
  description?: string;
  duration?: number;
}

export const MASS_TYPES: MassType[] = [
  {
    id: 'regular',
    name: 'Msza zwykła',
    price: 50,
    duration: 60,
  },
  {
    id: 'gregorian',
    name: 'Msza gregoriańska',
    price: 1500,
    description: 'Seria 30 mszy odprawianych przez 30 kolejnych dni',
    duration: 60,
  },
  {
    id: 'wedding',
    name: 'Msza ślubna',
    price: 600,
    description: 'Msza święta z ceremonią zaślubin',
    duration: 90,
  },
  {
    id: 'funeral',
    name: 'Msza pogrzebowa',
    price: 500,
    description: 'Msza święta pogrzebowa',
    duration: 90,
  },
  {
    id: 'first_communion',
    name: 'Pierwsza Komunia',
    price: 400,
    description: 'Msza święta pierwszokomunijna',
    duration: 90,
  }
];
