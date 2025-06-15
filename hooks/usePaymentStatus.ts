import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GlassPanel } from '../ui/glass'
import { Spinner } from '../ui/Spinner'
import type { PaymentStatus } from '@/types/payment'

interface PaymentStatusTrackerProps {
  paymentId: string
  onStatusChange: (status: PaymentStatus) => void
}

export function PaymentStatusTracker({
  paymentId,
  onStatusChange
}: PaymentStatusTrackerProps) {
  const { data: status, isLoading } = useQuery({
    queryKey: ['payment-status', paymentId],
    queryFn: () => fetchPaymentStatus(paymentId),
    refetchInterval: 3000
  })

  useEffect(() => {
    if (status) {
      onStatusChange(status)
    }
  }, [status, onStatusChange])

  return (
    <GlassPanel className="p-6">
      <div className="flex items-center justify-center space-x-4">
        {isLoading ? (
          <Spinner size="md" />
        ) : (
          <StatusIndicator status={status} />
        )}
      </div>
    </GlassPanel>
  )
}import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { PaymentStatus } from '@/types/payment'

export function usePaymentStatus(paymentId: string) {
  const [status, setStatus] = useState<PaymentStatus>()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel('payment-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `id=eq.${paymentId}`
        },
        (payload) => {
          setStatus(payload.new.status)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [paymentId])

  return status
}