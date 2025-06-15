import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import OrderPage from '../app/main/order-mass/page';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn()
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('OrderPage', () => {
  const mockRouter = {
    push: jest.fn()
  };

  const mockStripe = {
    confirmCardPayment: jest.fn()
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (loadStripe as jest.Mock).mockResolvedValue(mockStripe);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle card payment success', async () => {
    const mockClientSecret = 'test_client_secret';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ client_secret: mockClientSecret })
    });

    mockStripe.confirmCardPayment.mockResolvedValueOnce({ error: null });

    render(<OrderPage />);

    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/kwota/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/intencja/i), { target: { value: 'Test intention' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /zamów i zapłać/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/create-payment-intent', expect.any(Object));
      expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith(mockClientSecret);
      expect(toast.success).toHaveBeenCalledWith('Płatność zaakceptowana!');
      expect(mockRouter.push).toHaveBeenCalledWith('/success');
    });
  });

  it('should handle BLIK/P24 redirect', async () => {
    const mockRedirectUrl = 'https://example.com/pay';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ redirectUrl: mockRedirectUrl })
    });    render(<OrderPage />);

    // Fill in form fields and select BLIK
    fireEvent.change(screen.getByLabelText(/kwota/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/intencja/i), { target: { value: 'Test intention' } });
    fireEvent.click(screen.getByLabelText(/blik/i));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /zamów i zapłać/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/create-payment-intent', expect.any(Object));
      expect(window.location.href).toBe(mockRedirectUrl);
    });
  });

  it('should handle payment errors', async () => {
    const mockError = 'Payment failed';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ error: mockError })
    });

    render(<OrderPage />);

    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/kwota/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/intencja/i), { target: { value: 'Test intention' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /zamów i zapłać/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/create-payment-intent', expect.any(Object));
      expect(toast.error).toHaveBeenCalledWith('Błąd płatności. Spróbuj ponownie.');
    });
  });

  it('should handle stripe errors', async () => {
    const mockClientSecret = 'test_client_secret';
    const mockStripeError = { message: 'Stripe error' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ client_secret: mockClientSecret })
    });

    mockStripe.confirmCardPayment.mockResolvedValueOnce({ error: mockStripeError });

    render(<OrderPage />);

    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/kwota/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/intencja/i), { target: { value: 'Test intention' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /zamów i zapłać/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/create-payment-intent', expect.any(Object));
      expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith(mockClientSecret);
      expect(toast.error).toHaveBeenCalledWith('Błąd płatności. Spróbuj ponownie.');
    });
  });
});
