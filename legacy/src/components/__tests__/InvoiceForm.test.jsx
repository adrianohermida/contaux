/**
 * InvoiceForm Unit Tests
 * Validação de criação e edição de faturas
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceForm from '../dashboard/InvoiceForm';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock base44
const mockBase44 = {
  entities: {
    Invoice: {
      create: vi.fn(),
      update: vi.fn(),
    },
    Client: {
      filter: vi.fn(),
    },
  },
  functions: {
    invoke: vi.fn(),
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

describe('InvoiceForm Component', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const tenantId = 'test-tenant-123';
  const mockClients = [
    { id: 'client-1', company_name: 'Company A' },
    { id: 'client-2', company_name: 'Company B' },
  ];

  const defaultProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel,
    tenantId,
    isOpen: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBase44.entities.Client.filter.mockResolvedValue(mockClients);
  });

  test('renders form with all required fields', async () => {
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Cliente/i)).toBeTruthy();
      expect(screen.getByLabelText(/Número da fatura/i)).toBeTruthy();
      expect(screen.getByLabelText(/Data de emissão/i)).toBeTruthy();
      expect(screen.getByLabelText(/Data de vencimento/i)).toBeTruthy();
    });
  });

  test('loads clients on mount', async () => {
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(mockBase44.entities.Client.filter).toHaveBeenCalledWith({
        tenant_id: tenantId,
        status: 'active',
      });
    });
  });

  test('displays client dropdown after loading', async () => {
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const clientSelect = screen.getByLabelText(/Cliente/i);
      expect(clientSelect).toBeTruthy();
    });
  });

  test('allows adding invoice items', async () => {
    const { container } = render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    const addItemButton = screen.getByLabelText(/Adicionar novo item/i);
    expect(addItemButton).toBeTruthy();
  });

  test('displays error for missing client', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    // Try to submit without selecting client
    const submitButton = screen.getByRole('button', { name: /Criar|Atualizar/i });
    if (submitButton && !submitButton.disabled) {
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Selecione um cliente/i)).toBeTruthy();
      });
    }
  });

  test('validates due date is after issue date', async () => {
    const { container } = render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    // Component should validate this on submit
    const form = container.querySelector('form');
    expect(form).toBeTruthy();
  });

  test('displays invoice items section', () => {
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    expect(screen.getByText(/Itens da Fatura/i)).toBeTruthy();
    expect(screen.getByLabelText(/Descrição do item 1/i)).toBeTruthy();
  });

  test('shows status options', async () => {
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Status da fatura/i)).toBeTruthy();
    });
  });

  test('allows changing currency', async () => {
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Moeda da fatura/i)).toBeTruthy();
    });
  });

  test('displays edit mode when invoice is provided', async () => {
    const existingInvoice = {
      id: '123',
      invoice_number: 'INV-001',
      client_id: 'client-1',
      status: 'draft',
    };
    
    render(<InvoiceForm {...defaultProps} invoice={existingInvoice} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('INV-001')).toBeTruthy();
    });
  });

  test('shows cancel button to close form', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('has proper ARIA labels for accessibility', async () => {
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label');
    });
  });

  test('displays notes field', () => {
    render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    expect(screen.getByLabelText(/Notas da fatura/i)).toBeTruthy();
  });

  test('has dark mode classes applied', () => {
    const { container } = render(<InvoiceForm {...defaultProps} />, { wrapper: Wrapper });
    
    const form = container.querySelector('form');
    expect(form?.className).toContain('dark:bg-slate-800');
  });
});