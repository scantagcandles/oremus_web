import { EmailService } from '@/services/email/EmailService';
import nodemailer from 'nodemailer';
import { Payment, PaymentStatus, PaymentType, PaymentMethod } from '@/types/payment';

jest.mock('nodemailer');

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: jest.Mocked<any>;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn()
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    emailService = new EmailService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPaymentConfirmation', () => {
    it('should send payment confirmation email', async () => {
      const payment: Payment = {
        id: 'pay_123',
        amount: 100,
        status: 'completed' as PaymentStatus,
        type: 'mass_intention' as PaymentType,
        method: 'card' as PaymentMethod,
        order_id: 'order_123',
        created_at: '2025-06-14T12:00:00Z',
        updated_at: '2025-06-14T12:00:00Z',
        description: 'Test payment'
      };

      const order = {
        id: 'order_123',
        intention: 'Test intention',
        date: '2025-06-15',
        time: '12:00'
      };

      const recipient = 'test@example.com';

      mockTransporter.sendMail.mockResolvedValueOnce({});

      await emailService.sendPaymentConfirmation(payment, order, recipient);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: recipient,
        subject: 'Potwierdzenie płatności - Oremus',
        html: expect.stringContaining('Test intention')
      });
    });
  });
  describe('sendPaymentFailure', () => {
    it('should send payment failure email', async () => {
      const payment: Payment = {
        id: 'pay_123',
        amount: 100,
        status: 'failed' as PaymentStatus,
        type: 'mass_intention' as PaymentType,
        method: 'card' as PaymentMethod,
        order_id: 'order_123',
        created_at: '2025-06-14T12:00:00Z',
        updated_at: '2025-06-14T12:00:00Z',
        description: 'Test payment'
      };

      const order = {
        id: 'order_123',
        intention: 'Test intention',
        date: '2025-06-15',
        time: '12:00'
      };

      const recipient = 'test@example.com';
      const error = 'Card declined';

      mockTransporter.sendMail.mockResolvedValueOnce({});

      await emailService.sendPaymentFailure(payment, order, recipient, error);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: recipient,
        subject: 'Problem z płatnością - Oremus',
        html: expect.stringContaining('Card declined')
      });
    });
  });
  describe('sendPaymentRefunded', () => {
    it('should send refund confirmation email', async () => {
      const payment: Payment = {
        id: 'pay_123',
        amount: 100,
        status: 'refunded' as PaymentStatus,
        type: 'mass_intention' as PaymentType,
        method: 'card' as PaymentMethod,
        order_id: 'order_123',
        created_at: '2025-06-14T12:00:00Z',
        updated_at: '2025-06-14T12:00:00Z',
        description: 'Test payment'
      };

      const order = {
        id: 'order_123',
        intention: 'Test intention',
        date: '2025-06-15',
        time: '12:00'
      };

      const recipient = 'test@example.com';

      mockTransporter.sendMail.mockResolvedValueOnce({});

      await emailService.sendPaymentRefunded(payment, order, recipient);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: recipient,
        subject: expect.stringContaining('Potwierdzenie zwrotu'),
        html: expect.stringContaining('order_123')
      });
    });
  });
  describe('error handling', () => {
    it('should handle email sending errors', async () => {
      const payment: Payment = {
        id: 'pay_123',
        amount: 100,
        status: 'completed' as PaymentStatus,
        type: 'mass_intention' as PaymentType,
        method: 'card' as PaymentMethod,
        order_id: 'order_123',
        created_at: '2025-06-14T12:00:00Z',
        updated_at: '2025-06-14T12:00:00Z',
        description: 'Test payment'
      };

      const order = {
        id: 'order_123',
        intention: 'Test intention',
        date: '2025-06-15',
        time: '12:00'
      };

      const recipient = 'test@example.com';
      const error = new Error('SMTP error');

      mockTransporter.sendMail.mockRejectedValueOnce(error);

      await expect(
        emailService.sendPaymentConfirmation(payment, order, recipient)
      ).rejects.toThrow('SMTP error');
    });
  });
});
