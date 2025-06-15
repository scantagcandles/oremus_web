import { Database } from './supabase';

export type MassIntention = Database['public']['Tables']['mass_intentions']['Row'];

export enum MassIntentionStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  SCHEDULED = 'scheduled',
  PAYMENT_FAILED = 'payment_failed'
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
