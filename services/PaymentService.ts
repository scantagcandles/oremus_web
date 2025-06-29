import { loadStripe } from '@stripe/stripe-js';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/configs/supabase';
import type { PaymentIntent } from '@stripe/stripe-js';

export type PaymentMethod = 'card' | 'blik' | 'p24' | 'bank_transfer';

export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  payment_method_types: PaymentMethod[];
  metadata?: Record<string, string>;
  customer_email?: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
}

class PaymentService {
  private static _instance: PaymentService;
  private _stripe: Promise<any>;

  private constructor() {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error('Missing Stripe publishable key');
    }
    this._stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }

  public static get instance(): PaymentService {
    if (!PaymentService._instance) {
      PaymentService._instance = new PaymentService();
    }
    return PaymentService._instance;
  }

  public async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      return result.paymentIntent;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new Error(error.message);
    }
  }

  public async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      return {
        success: true,
        paymentIntentId: result.paymentIntent.id,
      };
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  public async getPaymentStatus(paymentIntentId: string): Promise<string> {
    const { data, error } = await supabase
      .from('payments')
      .select('status')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (error) throw error;
    return data.status;
  }

  public async getStripe() {
    return this._stripe;
  }
}

export const paymentService = PaymentService.instance;
