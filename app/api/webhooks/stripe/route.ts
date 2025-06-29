import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';
import { EmailService } from '@/services/email/EmailService';
import { NotificationService } from '@/services/notificationService';
import { createCalendarEvent } from '@/services/calendarService';
import { MassIntentionStatus } from '@/types/mass-intention';
import type { MassIntention } from '@/types/mass-intention';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const emailService = new EmailService();
const notificationService = new NotificationService();

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata!;
  
  if (!metadata.intentionId) {
    console.error('No intention ID in metadata');
    return;
  }

  // 1. Update mass intention status
  const { data: intention, error: dbError } = await supabase
    .from('masses')
    .update({
      is_paid: true,
      status: MassIntentionStatus.PAID,
      payment_id: session.payment_intent as string,
      payment_status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.intentionId)
    .select('*, parishes(*)')
    .single();

  if (dbError) {
    console.error('Failed to update mass intention:', dbError);
    return;
  }

  if (!intention) {
    console.error('No intention found with ID:', metadata.intentionId);
    return;
  }

  const typedIntention = intention as unknown as MassIntention;

  // 2. Send confirmation email
  if (session.customer_details?.email) {
    try {
      await emailService.sendPaymentConfirmation({
        email: session.customer_details.email,
        intentionDetails: typedIntention,
        paymentAmount: session.amount_total! / 100,
        currency: session.currency!,
        receiptUrl: await getReceiptUrl(session.payment_intent as string) || ''
      });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  }

  // 3. Create calendar event
  if (typedIntention.mass_date) {
    try {
      await createCalendarEvent({
        title: `Mass Intention: ${typedIntention.intention_for}`,
        description: `Mass intention for ${typedIntention.intention_for}`,
        startTime: typedIntention.mass_date,
        parishId: typedIntention.parish_id,
        metadata: {
          intentionId: typedIntention.id,
          type: 'mass_intention'
        }
      });
    } catch (error) {
      console.error('Failed to create calendar event:', error);
    }
  }

  // 4. Set up notifications
  try {
    await notificationService.scheduleIntentionReminders(typedIntention);
  } catch (error) {
    console.error('Failed to schedule reminders:', error);
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
  if (!metadata?.intentionId) {
    console.error('No intention ID in metadata');
    return;
  }

  // 1. Update mass intention status
  const { data: intention, error: dbError } = await supabase
    .from('masses')
    .update({
      status: MassIntentionStatus.PAYMENT_FAILED,
      payment_id: paymentIntent.id,
      payment_status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', metadata.intentionId)
    .select()
    .single();

  if (dbError) {
    console.error('Failed to update mass intention:', dbError);
    return;
  }

  // 2. Send failure notification
  if (paymentIntent.receipt_email) {
    try {
      await emailService.sendPaymentFailure({
        email: paymentIntent.receipt_email,
        intentionId: metadata.intentionId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        error: paymentIntent.last_payment_error?.message
      });
    } catch (error) {
      console.error('Failed to send payment failure email:', error);
    }
  }
}

async function getReceiptUrl(paymentIntentId: string): Promise<string | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge']
    });
    const charge = paymentIntent.latest_charge as Stripe.Charge;
    return charge?.receipt_url || null;
  } catch (error) {
    console.error('Failed to fetch receipt URL:', error);
    return null;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleFailedPayment(paymentIntent);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.metadata?.intentionId) {
          await supabase
            .from('masses')
            .update({
              status: MassIntentionStatus.CANCELLED,
              payment_status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentIntent.metadata.intentionId);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent && typeof charge.payment_intent === 'string') {
          const { data: intention } = await supabase
            .from('masses')
            .update({
              status: MassIntentionStatus.REFUNDED,
              payment_status: 'refunded',
              updated_at: new Date().toISOString()
            })
            .eq('payment_id', charge.payment_intent)
            .select()
            .single();

          if (intention && charge.receipt_email) {
            try {
              await emailService.sendRefundConfirmation({
                email: charge.receipt_email,
                intentionDetails: intention as unknown as MassIntention,
                amount: charge.amount_refunded / 100,
                currency: charge.currency
              });
            } catch (error) {
              console.error('Failed to send refund confirmation email:', error);
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
