import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/client';
import { PaymentService } from '@/services/payment/PaymentService';
import { PaymentStatus } from '@/types/payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient();

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const paymentService = new PaymentService();

    async function handlePaymentSuccess(
      paymentId: string,
      orderId: string,
      amount: number
    ) {
      try {
        // Update payment status
        await paymentService.updatePaymentStatus(paymentId, 'completed');

        // Update order status
        await supabase
          .from('mass_intentions')
          .update({ status: 'confirmed', payment_status: 'completed' })
          .eq('id', orderId);

        // Send confirmation email
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_confirmation',
            paymentId,
            orderId,
            amount,
          }),
        });

        // Send notification to admin
        await supabase.from('notifications').insert({
          type: 'payment_received',
          title: 'New Payment Received',
          message: `Payment of ${amount} PLN received for order #${orderId}`,
          metadata: { paymentId, orderId, amount },
        });
      } catch (error) {
        console.error('Error handling payment success:', error);
        throw error;
      }
    }

    async function handlePaymentFailure(
      paymentId: string,
      orderId: string,
      error: any
    ) {
      try {
        // Update payment status
        await paymentService.updatePaymentStatus(paymentId, 'failed');

        // Update order status
        await supabase
          .from('mass_intentions')
          .update({
            status: 'pending',
            payment_status: 'failed',
            payment_error: error?.message,
          })
          .eq('id', orderId);

        // Send failure notification
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_failed',
            paymentId,
            orderId,
            error: error?.message,
          }),
        });

        // Send notification to admin
        await supabase.from('notifications').insert({
          type: 'payment_failed',
          title: 'Payment Failed',
          message: `Payment failed for order #${orderId}: ${error?.message}`,
          metadata: { paymentId, orderId, error: error?.message },
          priority: 'high',
        });
      } catch (error) {
        console.error('Error handling payment failure:', error);
        throw error;
      }
    }

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.payment_id && session.metadata?.order_id) {
          await handlePaymentSuccess(
            session.metadata.payment_id,
            session.metadata.order_id,
            session.amount_total ? session.amount_total / 100 : 0
          );
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.metadata?.payment_id && paymentIntent.metadata?.order_id) {
          await handlePaymentSuccess(
            paymentIntent.metadata.payment_id,
            paymentIntent.metadata.order_id,
            paymentIntent.amount / 100
          );
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.metadata?.payment_id && paymentIntent.metadata?.order_id) {
          await handlePaymentFailure(
            paymentIntent.metadata.payment_id,
            paymentIntent.metadata.order_id,
            paymentIntent.last_payment_error
          );
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentId = charge.metadata?.payment_id;
        const orderId = charge.metadata?.order_id;

        if (paymentId && orderId) {
          await paymentService.updatePaymentStatus(paymentId, 'refunded');

          // Update order status
          await supabase
            .from('mass_intentions')
            .update({ status: 'refunded', payment_status: 'refunded' })
            .eq('id', orderId);

          // Send refund notification
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'payment_refunded',
              paymentId,
              orderId,
              amount: charge.amount_refunded / 100,
            }),
          });
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = await stripe.charges.retrieve(dispute.charge as string);
        const paymentId = charge.metadata?.payment_id;
        const orderId = charge.metadata?.order_id;

        if (paymentId && orderId) {
          // Send high-priority admin notification
          await supabase.from('notifications').insert({
            type: 'payment_disputed',
            title: 'Payment Dispute',
            message: `Dispute received for order #${orderId}`,
            metadata: {
              paymentId,
              orderId,
              disputeId: dispute.id,
              reason: dispute.reason,
              amount: dispute.amount / 100,
            },
            priority: 'urgent',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
