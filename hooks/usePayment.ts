'use client';

import { useState } from 'react'
import { PaymentService } from '@/services/payment/PaymentService'
import type { PaymentResult } from '@/types/payment'

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const paymentService = new PaymentService()

  const processPayment = async (params: {
    amount: number
    intentionId: string
    method: string
  }): Promise<PaymentResult> => {
    setIsProcessing(true)
    setError(null)

    try {
      const intent = await paymentService.createPayment(params)
      return {
        success: true,
        paymentIntentId: intent.id,
        redirectUrl: intent.redirectUrl
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processPayment,
    isProcessing,
    error
  }
}

