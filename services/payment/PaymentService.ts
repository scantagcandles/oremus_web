import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { loadStripe } from '@stripe/stripe-js'
import type { PaymentIntent, PaymentMethod } from '@/types/payment'

export class PaymentService {
  private supabase = createClientComponentClient()
  private stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)

  async createPayment(params: {
    amount: number
    intentionId: string
    method: PaymentMethod
  }): Promise<PaymentIntent> {
    const { data: intention } = await this.supabase
      .from('mass_intentions')
      .select('id, church_id')
      .eq('id', params.intentionId)
      .single()

    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        churchId: intention.church_id
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create payment')
    }

    return response.json()
  }

  async confirmPayment(intentId: string): Promise<boolean> {
    const stripe = await this.stripe
    if (!stripe) throw new Error('Stripe not initialized')

    const { error } = await stripe.confirmPayment({
      elements: {
        payment_method: 'card',
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`
        }
      },
      clientSecret: intentId
    })

    if (error) throw new Error(error.message)
    return true
  }
}