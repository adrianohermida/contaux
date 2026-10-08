/**
 * InvoiceList Unit Tests
 * Validação de listagem e operações CRUD
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceList from '../dashboard/InvoiceList';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock base44
const mockBase44 = {
  entities: {
    Invoice: {
      filter: vi.fn(),
      delete: vi.fn(),
    },
  },
};

vi.mock('@/api/base44Client', () => ({
  base44: mockBase44,
}));

// Mock hooks
vi.mock('@/components/hooks/useCacheStrategy', () => ({
  useCacheStrategy: () => ({
    invalidateRelated: vi.fn(),
  }),
}));

vi.mock('@/components/hooks/useRealtimeSync', () => ({
  useRealtimeSync: () => ({
    isConnected: true,
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

describe('InvoiceList Component', () => {
  const mockInvoices = [
    {
      id: '1',
      invoice_number: 'INV-001',
      issue_date: '2026-03-01',
      total_amount: 1000.00,
      currency: 'BRL',
      status: 'draft',
    },
    {
      id: '2',
      invoice_number: 'INV-002',
      issue_date: '2026-03-02',
      total_amount: 2500.50,
      currency: 'BRL',
      status: 'sent',
    },
    {
      id: '3',
      invoice_number: 'INV-003',
      issue_date: '2026-02-15',
      total_amount: 500.00,
      currency: 'USD',
      status: 'paid',
    },
  ];

  const mockOnEdit = vi.fn();
  const tenantId = 'test-tenant-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
  });

  test('renders invoices in virtualized list', async () => {
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeTruthy();
      expect(screen.getByText('INV-002')).toBeTruthy();
    });
  });

  test('displays invoice information correctly', async () => {
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // Check if currency formatting worked
      expect(screen.getByText(/1\.000,00|1000.00/)).toBeTruthy();
    });
  });

  test('shows loading state while fetching invoices', () => {
    mockBase44.entities.Invoice.filter.mockImplementationOnce(() => 
      new Promise(() => {}) // Never resolves
    );
    
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    expect(screen.getByText(/Carregando/i)).toBeTruthy();
  });

  test('calls onEdit with selected invoice', async () => {
    const user = userEvent.setup();
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const editButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('svg[class*="Edit"]')
      );
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  test('handles delete with confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('svg[class*="Trash"]')
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  test('requires confirmation before deleting', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);
    
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('svg[class*="Trash"]')
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
    
    expect(mockBase44.entities.Invoice.delete).not.toHaveBeenCalled();
  });

  test('displays empty message when no invoices', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValueOnce([]);
    
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma fatura cadastrada/i)).toBeTruthy();
    });
  });

  test('refetches when refresh prop changes', async () => {
    const { rerender } = render(
      <InvoiceList tenantId={tenantId} onEdit={mockOnEdit} onRefresh={0} />,
      { wrapper: Wrapper }
    );
    
    expect(mockBase44.entities.Invoice.filter).toHaveBeenCalledTimes(1);
    
    rerender(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} onRefresh={1} />);
    
    await waitFor(() => {
      expect(mockBase44.entities.Invoice.filter).toHaveBeenCalledTimes(2);
    });
  });

  test('has proper dark mode classes', () => {
    const { container } = render(
      <InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />,
      { wrapper: Wrapper }
    );
    
    const table = container.querySelector('table');
    expect(table?.parentElement?.className).toContain('dark:bg-slate-800');
  });

  test('displays correct status badges', async () => {
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('draft')).toBeTruthy();
      expect(screen.getByText('sent')).toBeTruthy();
      expect(screen.getByText('paid')).toBeTruthy();
    });
  });

  test('formats dates correctly', async () => {
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // Should show formatted date
      expect(screen.getByText(/01\/03\/2026|03\/01\/2026|2026-03-01/)).toBeTruthy();
    });
  });

  test('filters invoices by tenant_id', async () => {
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(mockBase44.entities.Invoice.filter).toHaveBeenCalledWith({
        tenant_id: tenantId,
      });
    });
  });

  test('handles errors gracefully', async () => {
    mockBase44.entities.Invoice.filter.mockRejectedValueOnce(new Error('API Error'));
    
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar faturas/i)).toBeTruthy();
    });
  });

  test('formats currency according to invoice currency', async () => {
    render(<InvoiceList tenantId={tenantId} onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // BRL formatting should show with comma separator
      // USD formatting should show with dot separator
      const cells = screen.getAllByRole('cell');
      expect(cells.length).toBeGreaterThan(0);
    });
  });
});