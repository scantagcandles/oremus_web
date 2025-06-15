import { loadStripe } from '@stripe/stripe-js';
import { PaymentMethod } from '@/types/payment';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Support for different payment methods
export const PaymentGateway = {
  async createPaymentIntent(amount: number, method: PaymentMethod, metadata: any) {
    try {
      // Create payment intent with Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method, metadata }),
      });

      const { clientSecret, error } = await response.json();
      if (error) throw new Error(error.message);

      // Get Stripe instance
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Failed to load Stripe');

      // Initialize payment based on method
      switch (method) {
        case 'blik':
          return await stripe.confirmBlikPayment(clientSecret, {
            payment_method: { type: 'blik' },
            return_url: `${window.location.origin}/payment/success`,
          });

        case 'p24':
          return await stripe.confirmP24Payment(clientSecret, {
            payment_method: { type: 'p24', billing_details: metadata.billing },
            return_url: `${window.location.origin}/payment/success`,
          });

        case 'card':
          return await stripe.confirmCardPayment(clientSecret);

        default:
          throw new Error('Unsupported payment method');
      }
    } catch (error) {
      console.error('Payment gateway error:', error);
      throw error;
    }
  },

  // Support for PayU/Przelewy24 integration
  async createP24Session(amount: number, orderData: any) {
    try {
      const response = await fetch('/api/create-p24-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, orderData }),
      });

      const { redirectUrl, error } = await response.json();
      if (error) throw new Error(error.message);

      // Redirect to Przelewy24 payment page
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('P24 session error:', error);
      throw error;
    }
  },

  // Verifies the payment status
  async verifyPayment(paymentId: string) {
    try {
      const response = await fetch(`/api/verify-payment/${paymentId}`);
      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }
};
