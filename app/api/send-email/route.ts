import { NextResponse } from 'next/server';
import { EmailService } from '@/services/email/EmailService';
import { PaymentService } from '@/services/payment/PaymentService';

export async function POST(request: Request) {
  try {
    const { type, paymentId, orderId, amount, error } = await request.json();
    
    const emailService = new EmailService();
    const paymentService = new PaymentService();

    // Get payment and order details
    const payment = await paymentService.getPaymentById(paymentId);
    const order = payment.orders;

    if (!payment || !order) {
      throw new Error('Payment or order not found');
    }

    // Determine recipient email
    const recipientEmail = order.contact_email;

    // Send appropriate email based on type
    switch (type) {
      case 'payment_confirmation':
        await emailService.sendPaymentConfirmation(payment, order, recipientEmail);
        break;

      case 'payment_failed':
        await emailService.sendPaymentFailure(payment, order, recipientEmail, error);
        break;

      case 'payment_refunded':
        await emailService.sendPaymentRefunded(payment, order, recipientEmail);
        break;

      default:
        throw new Error(`Invalid email type: ${type}`);
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
