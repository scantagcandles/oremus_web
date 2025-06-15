import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PaymentService } from '@/services/payment/PaymentService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Get payment details from metadata
    const paymentId = session.metadata?.payment_id;
    const orderId = session.metadata?.order_id;

    if (paymentId) {
      // Update payment status in database
      const paymentService = new PaymentService();
      const payment = await paymentService.updatePaymentStatus(paymentId, 'completed');

      return NextResponse.json({
        status: 'complete',
        payment_id: paymentId,
        order_id: orderId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        ...payment
      });
    }

    return NextResponse.json({
      status: session.payment_status,
      amount: session.amount_total ? session.amount_total / 100 : 0
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
