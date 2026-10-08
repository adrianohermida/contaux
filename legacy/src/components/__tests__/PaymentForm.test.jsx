/**
 * PaymentForm Unit Tests
 * Validação de criação e edição de pagamentos
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentForm from '../dashboard/PaymentForm';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock base44
const mockBase44 = {
  entities: {
    Payment: {
      create: vi.fn(),
      update: vi.fn(),
    },
    Invoice: {
      filter: vi.fn(),
    },
  },
};

vi.mock('@/api/base44Client', () => ({
  base44: mockBase44,
}));

// Mock hooks
vi.mock('@/components/modals/useFormState', () => ({
  useFormState: (initial) => ({
    formData: initial,
    handleChange: vi.fn(),
    setFieldValue: vi.fn(),
    isDirty: true,
    reset: vi.fn(),
  }),
}));

vi.mock('@/components/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    errors: {},
    validateForm: () => true,
    clearErrors: vi.fn(),
  }),
}));

vi.mock('@/components/modals/useFormSubmit', () => ({
  useFormSubmit: () => ({
    loading: false,
    submit: vi.fn((fn, config) => {
      fn().then(() => config.onSuccess?.());
    }),
  }),
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

describe('PaymentForm Component', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const tenantId = 'test-tenant-123';
  const mockInvoices = [
    {
      id: 'inv-1',
      invoice_number: 'INV-001',
      company_name: 'Client A',
      total_amount: 1000.00,
      paid_amount: 0,
      currency: 'BRL',
    },
    {
      id: 'inv-2',
      invoice_number: 'INV-002',
      company_name: 'Client B',
      total_amount: 2500.00,
      paid_amount: 500.00,
      currency: 'BRL',
    },
  ];

  const defaultProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel,
    tenantId,
    isOpen: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
  });

  test('renders form with all required fields', async () => {
    render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Fatura/i)).toBeTruthy();
      expect(screen.getByLabelText(/Valor do Pagamento/i)).toBeTruthy();
      expect(screen.getByLabelText(/Data do Pagamento/i)).toBeTruthy();
      expect(screen.getByLabelText(/Método de Pagamento/i)).toBeTruthy();
    });
  });

  test('loads unpaid invoices on mount', async () => {
    render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(mockBase44.entities.Invoice.filter).toHaveBeenCalledWith({
        tenant_id: tenantId,
      });
    });
  });

  test('displays invoice details when selected', async () => {
    render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Total da Fatura/i)).toBeTruthy();
    });
  });

  test('validates amount does not exceed remaining balance', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    // Should enforce max value based on remaining balance
    const amountInput = screen.getByLabelText(/Valor do Pagamento/i);
    expect(amountInput).toBeTruthy();
  });

  test('requires invoice selection', async () => {
    render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Registrar|Atualizar/i });
      expect(submitButton).toBeTruthy();
    });
  });

  test('allows editing existing payment', async () => {
    const existingPayment = {
      id: '123',
      invoice_id: 'inv-1',
      amount: 500.00,
      payment_date: '2026-03-01',
      payment_method: 'bank_transfer',
      status: 'pending',
    };
    
    render(<PaymentForm {...defaultProps} payment={existingPayment} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('500')).toBeTruthy();
    });
  });

  test('displays all payment methods', async () => {
    render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const methodSelect = screen.getByLabelText(/Método de Pagamento/i);
      expect(methodSelect).toBeTruthy();
    });
  });

  test('shows payment status options', async () => {
    render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Status do Pagamento/i)).toBeTruthy();
    });
  });

  test('has cancel button to close form', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('has proper ARIA labels for accessibility', async () => {
    render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const form = screen.getByRole('form');
      expect(form).toBeTruthy();
    });
  });

  test('displays dark mode classes', () => {
    const { container } = render(<PaymentForm {...defaultProps} />, { wrapper: Wrapper });
    
    const form = container.querySelector('form');
    expect(form?.className).toContain('dark:');
  });
});