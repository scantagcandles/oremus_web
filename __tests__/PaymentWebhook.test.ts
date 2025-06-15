import { NextRequest } from 'next/server';
import { NextRequest } from 'next/server';
import { PaymentService } from '@/services/payment/PaymentService';
import { EmailService } from '@/services/email/EmailService';
import { POST as handleWebhook } from '@/app/api/webhooks/payment/route';

jest.mock('@/services/payment/PaymentService');
jest.mock('@/services/email/EmailService');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  })
}));

describe('Payment Webhook Handler', () => {
  let mockPaymentService: jest.Mocked<PaymentService>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockPaymentService = new PaymentService() as jest.Mocked<PaymentService>;
    mockEmailService = new EmailService() as jest.Mocked<EmailService>;

    (PaymentService as jest.Mock).mockImplementation(() => mockPaymentService);
    (EmailService as jest.Mock).mockImplementation(() => mockEmailService);

    // Mock Stripe constructor
    (global as any).Stripe = jest.fn().mockReturnValue({
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({
          type: 'payment_intent.succeeded',
          data: { object: {} }
        })
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful payment', async () => {
    const mockEvent = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          metadata: {
            payment_id: 'pay_123',
            order_id: 'order_123'
          },
          amount: 1000
        }
      }
    };

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(mockEvent)
    });

    mockPaymentService.updatePaymentStatus.mockResolvedValueOnce({
      id: 'pay_123',
      status: 'completed'
    } as any);

    mockEmailService.sendPaymentConfirmation.mockResolvedValueOnce();

    const response = await handleWebhook(request);
    expect(response.status).toBe(200);

    expect(mockPaymentService.updatePaymentStatus).toHaveBeenCalledWith(
      'pay_123',
      'completed'
    );
  });

  it('should handle failed payment', async () => {
    const mockEvent = {
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_123',
          metadata: {
            payment_id: 'pay_123',
            order_id: 'order_123'
          },
          last_payment_error: {
            message: 'Card declined'
          }
        }
      }
    };

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(mockEvent)
    });

    mockPaymentService.updatePaymentStatus.mockResolvedValueOnce({
      id: 'pay_123',
      status: 'failed'
    } as any);

    mockEmailService.sendPaymentFailure.mockResolvedValueOnce();

    const response = await handleWebhook(request);
    expect(response.status).toBe(200);

    expect(mockPaymentService.updatePaymentStatus).toHaveBeenCalledWith(
      'pay_123',
      'failed'
    );
  });

  it('should handle refunded payment', async () => {
    const mockEvent = {
      type: 'charge.refunded',
      data: {
        object: {
          payment_intent: 'pi_123',
          metadata: {
            payment_id: 'pay_123',
            order_id: 'order_123'
          }
        }
      }
    };

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(mockEvent)
    });

    mockPaymentService.updatePaymentStatus.mockResolvedValueOnce({
      id: 'pay_123',
      status: 'refunded'
    } as any);

    mockEmailService.sendPaymentRefunded.mockResolvedValueOnce();

    const response = await handleWebhook(request);
    expect(response.status).toBe(200);

    expect(mockPaymentService.updatePaymentStatus).toHaveBeenCalledWith(
      'pay_123',
      'refunded'
    );
  });

  it('should handle invalid signature', async () => {
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await handleWebhook(request);
    expect(response.status).toBe(400);

    expect(mockPaymentService.updatePaymentStatus).not.toHaveBeenCalled();
    expect(mockEmailService.sendPaymentConfirmation).not.toHaveBeenCalled();
  });
});
