import { createClient } from '@/lib/supabase/client';
import { PaymentStatus, PaymentType, PaymentMethod } from '@/types/payment';

export class PaymentService {
  private supabase = createClient();

  async createPayment(data: {
    amount: number;
    type: PaymentType;
    method: PaymentMethod;
    orderId: string;
    description: string;
  }) {
    try {
      const { data: payment, error } = await this.supabase
        .from('payments')
        .insert({
          amount: data.amount,
          type: data.type,
          method: data.method,
          order_id: data.orderId,
          description: data.description,
          status: PaymentStatus.PENDING
        })
        .select()
        .single();

      if (error) throw error;
      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .update({ status })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async getPaymentById(paymentId: string) {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*, orders(*)')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  async getPaymentsByOrderId(orderId: string) {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting order payments:', error);
      throw error;
    }
  }
}
