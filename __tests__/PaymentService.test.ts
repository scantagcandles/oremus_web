import { PaymentService } from '@/services/payment/PaymentService';
import { createClient } from '@/lib/supabase/client';
import type { PaymentStatus, PaymentType, PaymentMethod } from '@/types/payment';

// Define enums for test values
const PaymentStatus = {
  PENDING: 'pending' as PaymentStatus,
  PROCESSING: 'processing' as PaymentStatus,
  COMPLETED: 'completed' as PaymentStatus,
  FAILED: 'failed' as PaymentStatus,
  REFUNDED: 'refunded' as PaymentStatus
};

const PaymentType = {
  MASS_INTENTION: 'mass_intention' as PaymentType,
  DONATION: 'donation' as PaymentType,
  PRODUCT: 'product' as PaymentType
};

const PaymentMethod = {
  CARD: 'card' as PaymentMethod,
  BLIK: 'blik' as PaymentMethod,
  P24: 'p24' as PaymentMethod,
  TRANSFER: 'transfer' as PaymentMethod,
  CASH: 'cash' as PaymentMethod
};

jest.mock('@/lib/supabase/client');

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    paymentService = new PaymentService();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {      const paymentData = {
        amount: 100,
        type: PaymentType.MASS_INTENTION,
        method: PaymentMethod.CARD,
        orderId: 'order123',
        description: 'Test payment'
      };

      const expectedPayment = {
        id: 'payment123',
        ...paymentData,
        status: PaymentStatus.PENDING
      };

      mockSupabase.single.mockResolvedValueOnce({ data: expectedPayment, error: null });

      const result = await paymentService.createPayment(paymentData);
      expect(result).toEqual(expectedPayment);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Database error');
      mockSupabase.single.mockResolvedValueOnce({ data: null, error });      await expect(paymentService.createPayment({
        amount: 100,
        type: PaymentType.MASS_INTENTION,
        method: PaymentMethod.CARD,
        orderId: 'order123',
        description: 'Test payment'
      })).rejects.toThrow('Database error');
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const paymentId = 'payment123';
      const status = PaymentStatus.COMPLETED;
      const expectedPayment = { id: paymentId, status };

      mockSupabase.single.mockResolvedValueOnce({ data: expectedPayment, error: null });

      const result = await paymentService.updatePaymentStatus(paymentId, status);
      expect(result).toEqual(expectedPayment);
    });
  });

  describe('getPaymentById', () => {
    it('should retrieve payment by id with order details', async () => {
      const paymentId = 'payment123';
      const expectedPayment = {
        id: paymentId,
        amount: 100,
        orders: { id: 'order123' }
      };

      mockSupabase.single.mockResolvedValueOnce({ data: expectedPayment, error: null });

      const result = await paymentService.getPaymentById(paymentId);
      expect(result).toEqual(expectedPayment);
    });
  });

  describe('getPaymentsByOrderId', () => {
    it('should retrieve all payments for an order', async () => {
      const orderId = 'order123';
      const expectedPayments = [
        { id: 'payment1', order_id: orderId },
        { id: 'payment2', order_id: orderId }
      ];

      mockSupabase.order.mockResolvedValueOnce({ data: expectedPayments, error: null });

      const result = await paymentService.getPaymentsByOrderId(orderId);
      expect(result).toEqual(expectedPayments);
    });
  });
});
