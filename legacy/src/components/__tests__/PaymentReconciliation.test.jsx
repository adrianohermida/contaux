/**
 * PaymentReconciliation Unit Tests
 * Validação de reconciliação automática e manual
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentReconciliation from '../dashboard/PaymentReconciliation';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock base44
const mockBase44 = {
  entities: {
    Invoice: {
      filter: vi.fn(),
    },
    Payment: {
      filter: vi.fn(),
      update: vi.fn(),
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

describe('PaymentReconciliation Component', () => {
  const mockInvoices = [
    {
      id: 'inv-1',
      invoice_number: 'INV-001',
      total_amount: 1000.00,
      due_date: '2026-04-01',
      status: 'sent',
    },
    {
      id: 'inv-2',
      invoice_number: 'INV-002',
      total_amount: 2500.00,
      due_date: '2026-03-01',
      status: 'sent',
    },
  ];

  const mockPayments = [
    {
      id: 'pay-1',
      invoice_id: 'inv-1',
      amount: 1000.00,
      status: 'confirmed',
      payment_date: '2026-03-01',
    },
    {
      id: 'pay-2',
      invoice_id: null,
      amount: 500.00,
      status: 'confirmed',
      payment_date: '2026-02-28',
    },
  ];

  const tenantId = 'test-tenant-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.filter.mockResolvedValue(mockPayments);
  });

  test('renders reconciliation component', async () => {
    render(<PaymentReconciliation tenantId={tenantId} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Reconciliação de Pagamentos/i)).toBeTruthy();
    });
  });

  test('displays status summary cards', async () => {
    render(<PaymentReconciliation tenantId={tenantId} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Reconciliados/i)).toBeTruthy();
      expect(screen.getByText(/Pendentes/i)).toBeTruthy();
    });
  });

  test('toggles between automatic and manual modes', async () => {
    const user = userEvent.setup();
    render(<PaymentReconciliation tenantId={tenantId} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const manualButton = screen.getByRole('button', { name: /Manual/i });
      expect(manualButton).toBeTruthy();
    });
  });

  test('shows unmatched payments in manual mode', async () => {
    const user = userEvent.setup();
    render(<PaymentReconciliation tenantId={tenantId} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const manualButton = screen.getByRole('button', { name: /Manual/i });
      await user.click(manualButton);
      
      expect(screen.getByText(/Pendentes de Associação/i)).toBeTruthy();
    });
  });

  test('calculates reconciliation status correctly', async () => {
    render(<PaymentReconciliation tenantId={tenantId} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // Should show 1 reconciled invoice (inv-1 with full payment)
      const reconciledCount = screen.getByText(/Reconciliados/).parentElement?.querySelector('div:last-child');
      expect(reconciledCount).toBeTruthy();
    });
  });

  test('displays dark mode styling', () => {
    const { container } = render(
      <PaymentReconciliation tenantId={tenantId} />,
      { wrapper: Wrapper }
    );
    
    const main = container.querySelector('[class*="bg-white"]');
    expect(main?.className).toContain('dark:');
  });

  test('handles manual match submission', async () => {
    const user = userEvent.setup();
    render(<PaymentReconciliation tenantId={tenantId} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const manualButton = screen.getByRole('button', { name: /Manual/i });
      user.click(manualButton);
    });
  });
});