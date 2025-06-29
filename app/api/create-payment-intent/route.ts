import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/client';
import { CreatePaymentIntentBody } from '@/types/api';
import { PaymentService } from '@/services/payment/PaymentService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const body = await req.json() as CreatePaymentIntentBody;
    const { amount, metadata, method } = body;

    // Create payment record in database
    const paymentService = new PaymentService();
    const payment = await paymentService.createPayment({
      amount,
      intentionId: metadata.intentionId,
      method: method || 'card',
      description: `Mass Intention - ${metadata.massType}`
    });

    // Create payment session based on method
    if (method === 'blik' || method === 'p24') {
      // Create Przelewy24 session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: [method],
        line_items: [
          {
            price_data: {
              currency: 'pln',
              product_data: {
                name: `Mass Intention - ${metadata.massType}`,
                description: `Mass celebration on ${new Date(metadata.date).toLocaleDateString()}`,
              },
              unit_amount: amount * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${headersList.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
        cancel_url: `${headersList.get('origin')}/cancel?payment_id=${payment.id}`,
        metadata: {
          payment_id: payment.id,
          intention_id: metadata.intentionId,
          mass_type: metadata.massType,
          date: metadata.date,
        },
      });

      return NextResponse.json({ 
        id: session.id,
        payment_id: payment.id,
        redirectUrl: session.url 
      });
    } else {
      // Create standard payment intent for card payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'pln',
        payment_method_types: ['card'],
        metadata: {
          payment_id: payment.id,
          intention_id: metadata.intentionId,
          mass_type: metadata.massType,
          date: metadata.date,
        }
      });

      return NextResponse.json({
        client_secret: paymentIntent.client_secret,
        payment_id: payment.id
      });
    }
  } catch (err) {
    console.error('Error creating payment:', err);
    return NextResponse.json(
      { error: 'Error processing payment request' },
      { status: 500 }
    );
  }
}
