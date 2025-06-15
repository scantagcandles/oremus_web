import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { StatusNotificationService } from '@/services/StatusNotificationService'
import type { PaymentStatus } from '@/types/payment'

interface StatusListenerProps {
  paymentId: string
  onStatusChange?: (status: PaymentStatus) => void
}

export function StatusListener({ paymentId, onStatusChange }: StatusListenerProps) {
  const supabase = createClientComponentClient()
  const notifier = new StatusNotificationService()

  useEffect(() => {
    const channel = supabase
      .channel(`payment-${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `id=eq.${paymentId}`
        },
        async (payload) => {
          const status = payload.new.status
          onStatusChange?.(status)
          
          await notifier.handleStatusUpdate({
            paymentId,
            status,
            error: payload.new.error_message
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [paymentId])

  return null
}