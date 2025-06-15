export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export type PaymentMethod = 'card' | 'blik' | 'p24' | 'transfer' | 'cash';

export type PaymentType = 'mass_intention' | 'donation' | 'product';

export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  type: PaymentType;
  method: PaymentMethod;
  order_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntent {
  client_secret: string;
  payment_id: string;
  redirectUrl?: string;
}

export interface PaymentSession {
  id: string;
  payment_id: string;
  status: PaymentStatus;
  amount: number;
  redirectUrl: string;
}
