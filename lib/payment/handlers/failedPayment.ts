import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { NotificationService } from '@/services/NotificationService'
import type { PaymentFailureData } from '@/types/payment'

export async function handleFailedPayment(failureData: PaymentFailureData) {
  const supabase = createClientComponentClient()
  const notifier = new NotificationService()

  const { data: intention } = await supabase
    .from('mass_intentions')
    .update({
      payment_status: 'failed',
      payment_error: failureData.error?.message,
      last_failure_at: new Date().toISOString()
    })
    .eq('id', failureData.metadata.intentionId)
    .select(`
      *,
      church:churches(name),
      user:profiles(email, phone)
    `)
    .single()

  if (intention) {
    await notifier.sendPaymentFailureNotification({
      intention,
      error: failureData.error,
      retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/retry/${intention.id}`
    })
  }

  return intention
}