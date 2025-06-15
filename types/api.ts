import { MassType } from '@/types/mass';
import { PaymentMethod } from './payment';

// Payment Intent API
export type CreatePaymentIntentBody = {
  amount: number;
  method: PaymentMethod;
  metadata: {
    intentionId: string;
    massType: MassType;
    date: string;
    [key: string]: string;
  };
};

export type CreatePaymentIntentResponse = {
  client_secret?: string;
  payment_id: string;
  redirectUrl?: string;
  error?: string;
};
