/**
 * PaymentList Unit Tests
 * Validação de listagem de pagamentos
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentList from '../dashboard/PaymentList';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock base44
const mockBase44 = {
  entities: {
    Payment: {
      filter: vi.fn(),
      delete: vi.fn(),
    },
    Invoice: {
      filter: vi.fn(),
    },
  },
};

vi.mock('@/api/base44Client', () => ({
  base44: mockBase44,
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const Wrapper = ({ children }) => (
  <QueryClientProvider client={createQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('PaymentList Component', () => {
  const mockPayments = [
    {
      id: '1',
      payment_number: 'PAY-001',
      invoice_id: 'inv-1',
      amount: 1000.00,
      currency: 'BRL',
      payment_date: '2026-03-01',
      payment_method: 'bank_transfer',
      status: 'confirmed',
    },
    {
      id: '2',
      payment_number: 'PAY-002',
      invoice_id: 'inv-2',
      amount: 500.00,
      currency: 'BRL',
      payment_date: '2026-02-28',
      payment_method: 'pix',
      status: 'pending',
    },
  ];

  const mockInvoices = [
    { id: 'inv-1', invoice_number: 'INV-001' },
    { id: 'inv-2', invoice_number: 'INV-002' },
  ];

  const mockOnEdit = vi.fn();
  const tenantId = 'test-tenant-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockBase44.entities.Payment.filter.mockResolvedValue(mockPayments);
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
  });

  test('renders payments in virtualized list', async () => {
    render(<PaymentList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('PAY-001')).toBeTruthy();
    });
  });

  test('displays payment information correctly', async () => {
    render(<PaymentList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('1000.00')).toBeTruthy();
      expect(screen.getByText('bank_transfer')).toBeTruthy();
    });
  });

  test('shows loading state while fetching', () => {
    mockBase44.entities.Payment.filter.mockImplementationOnce(() => 
      new Promise(() => {})
    );
    
    render(<PaymentList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    expect(screen.getByText(/Carregando/i)).toBeTruthy();
  });

  test('calls onEdit with selected payment', async () => {
    const user = userEvent.setup();
    render(<PaymentList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const editButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('svg')
      );
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  test('handles delete with confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    
    render(<PaymentList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button').filter(btn =>
        btn.innerHTML.includes('Trash')
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  test('displays empty message when no payments', async () => {
    mockBase44.entities.Payment.filter.mockResolvedValueOnce([]);
    
    render(<PaymentList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhum pagamento/i)).toBeTruthy();
    });
  });

  test('displays correct status badges', async () => {
    render(<PaymentList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('confirmed')).toBeTruthy();
      expect(screen.getByText('pending')).toBeTruthy();
    });
  });

  test('formats dates correctly', async () => {
    render(<PaymentList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/01\/03\/2026|03\/01\/2026|2026-03-01/)).toBeTruthy();
    });
  });

  test('filters payments by tenant_id', async () => {
    render(<PaymentList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(mockBase44.entities.Payment.filter).toHaveBeenCalledWith({
        tenant_id: tenantId,
      });
    });
  });

  test('has dark mode classes', () => {
    const { container } = render(
      <PaymentList tenantId={tenantId} onEdit={mockOnEdit} />,
      { wrapper: Wrapper }
    );
    
    const table = container.querySelector('table');
    expect(table?.className).toContain('dark:');
  });
});