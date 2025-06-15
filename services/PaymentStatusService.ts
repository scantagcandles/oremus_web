import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { PaymentStatus, PaymentStatusUpdate } from '@/types/payment'

export class PaymentStatusService {
  private supabase = createClientComponentClient()

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('status, updated_at')
      .eq('id', paymentId)
      .single()

    if (error) throw error
    return data.status
  }

  async updatePaymentStatus(update: PaymentStatusUpdate): Promise<void> {
    const { data, error } = await this.supabase
      .from('payments')
      .update({
        status: update.status,
        updated_at: new Date().toISOString(),
        error_message: update.error
      })
      .eq('id', update.paymentId)

    if (error) throw error
  }
}