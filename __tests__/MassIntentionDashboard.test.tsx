import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MassIntentionDashboard from '@/components/admin/intentions/MassIntentionDashboard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MassIntentionStatus } from '@/types/mass-intention';

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: vi.fn(),
}));

const mockIntentions = [
  {
    id: '1',
    content: 'Test intention 1',
    preferred_date: '2025-06-15',
    mass_type: 'regular',
    requestor_name: 'John Doe',
    requestor_email: 'john@example.com',
    status: MassIntentionStatus.PENDING_PAYMENT,
    payment_amount: 5000,
    created_at: '2025-06-14T10:00:00Z',
    updated_at: '2025-06-14T10:00:00Z'
  },
  {
    id: '2',
    content: 'Test intention 2',
    preferred_date: '2025-06-16',
    mass_type: 'gregorian',
    requestor_name: 'Jane Doe',
    requestor_email: 'jane@example.com',
    status: MassIntentionStatus.PAID,
    payment_amount: 150000,
    created_at: '2025-06-14T11:00:00Z',
    updated_at: '2025-06-14T11:00:00Z'
  }
];

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        data: mockIntentions,
        error: null,
      })),
    })),
  })),
};

describe('MassIntentionDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('renders the dashboard with intentions', async () => {
    render(<MassIntentionDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Wszystkie intencje')).toBeInTheDocument();
    });

    // Check if intentions are displayed
    expect(screen.getByText('Test intention 1')).toBeInTheDocument();
    expect(screen.getByText('Test intention 2')).toBeInTheDocument();
  });

  it('filters intentions by status', async () => {
    render(<MassIntentionDashboard />);

    // Open filters
    fireEvent.click(screen.getByText('Filtry'));

    // Select status filter
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: MassIntentionStatus.PAID }
    });

    // Submit filter form
    fireEvent.click(screen.getByText('Zastosuj filtry'));

    // Verify that the filter was applied
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('mass_intentions');
      expect(screen.getByText('Test intention 2')).toBeInTheDocument();
      expect(screen.queryByText('Test intention 1')).not.toBeInTheDocument();
    });
  });

  it('updates intention status', async () => {
    render(<MassIntentionDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test intention 1')).toBeInTheDocument();
    });

    // Change status
    fireEvent.change(screen.getAllByLabelText('Status')[0], {
      target: { value: MassIntentionStatus.PAID }
    });

    // Verify that the update was made
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('mass_intentions');
    });
  });

  it('displays analytics charts', async () => {
    render(<MassIntentionDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Intencje według statusu')).toBeInTheDocument();
      expect(screen.getByText('Przychód (ostatnie 30 dni)')).toBeInTheDocument();
    });
  });
});
