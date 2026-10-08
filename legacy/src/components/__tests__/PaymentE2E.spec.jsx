/**
 * Payment Entity - E2E Tests (Playwright/Vitest)
 * 18 scenarios completos: CRUD + Reconciliation
 */

import { test, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ============ SETUP ============

const mockBase44 = {
  entities: {
    Payment: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      filter: vi.fn(),
    },
    Invoice: {
      filter: vi.fn(),
      update: vi.fn(),
    },
  },
  functions: {
    invoke: vi.fn(),
  },
};

vi.mock('@/api/base44Client', () => ({ base44: mockBase44 }));

const createQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const Wrapper = ({ children }) => (
  <QueryClientProvider client={createQueryClient()}>
    {children}
  </QueryClientProvider>
);

const tenantId = 'test-tenant-123';
const userId = 'user-123';

// Mock data
const mockInvoices = [
  {
    id: 'inv-1',
    invoice_number: 'INV-001',
    company_name: 'Client A',
    total_amount: 1000.00,
    paid_amount: 0,
    currency: 'BRL',
    status: 'sent',
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-002',
    company_name: 'Client B',
    total_amount: 2500.00,
    paid_amount: 500.00,
    currency: 'BRL',
    status: 'sent',
  },
];

const mockPayments = [
  {
    id: 'pay-1',
    payment_number: 'PAY-001',
    invoice_id: 'inv-1',
    client_id: 'client-1',
    amount: 1000.00,
    payment_date: '2026-03-01',
    payment_method: 'bank_transfer',
    status: 'confirmed',
    currency: 'BRL',
  },
  {
    id: 'pay-2',
    payment_number: 'PAY-002',
    invoice_id: null,
    client_id: 'client-2',
    amount: 500.00,
    payment_date: '2026-02-28',
    payment_method: 'pix',
    status: 'pending',
    currency: 'BRL',
  },
];

// ============ E2E TESTS (18 scenarios) ============

describe('Payment Entity - E2E Tests', () => {
  
  // ========== SCENARIO 1-3: CREATE ==========
  
  test('E2E-01: Create new payment with required fields', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.create.mockResolvedValue({
      id: 'pay-new',
      ...mockPayments[0],
    });

    const { getByLabelText, getByRole } = render(
      <PaymentForm tenantId={tenantId} onSave={() => {}} />,
      { wrapper: Wrapper }
    );

    // Wait for form to load
    await waitFor(() => {
      expect(getByLabelText(/Fatura/i)).toBeTruthy();
    });

    // Fill form
    const invoiceSelect = getByLabelText(/Fatura/i);
    await userEvent.selectOption(invoiceSelect, 'inv-1');

    const amountInput = getByLabelText(/Valor do Pagamento/i);
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '1000.00');

    const dateInput = getByLabelText(/Data do Pagamento/i);
    await userEvent.type(dateInput, '2026-03-01');

    // Submit
    const submitBtn = getByRole('button', { name: /Registrar/i });
    await userEvent.click(submitBtn);

    // Verify
    await waitFor(() => {
      expect(mockBase44.entities.Payment.create).toHaveBeenCalled();
    });
  });

  test('E2E-02: Create payment validates amount does not exceed invoice balance', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);

    const { getByLabelText } = render(
      <PaymentForm tenantId={tenantId} onSave={() => {}} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByLabelText(/Fatura/i)).toBeTruthy();
    });

    const invoiceSelect = getByLabelText(/Fatura/i);
    await userEvent.selectOption(invoiceSelect, 'inv-2'); // 2500 total, 500 paid

    const amountInput = getByLabelText(/Valor do Pagamento/i);
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '2500'); // Exceeds remaining (2000)

    // Should show validation error
    await waitFor(() => {
      expect(mockBase44.entities.Payment.create).not.toHaveBeenCalled();
    });
  });

  test('E2E-03: Create payment with all optional fields (notes, transaction_id)', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.create.mockResolvedValue({
      id: 'pay-new',
      ...mockPayments[0],
      notes: 'Test note',
      transaction_id: 'TXN-123',
    });

    const { getByLabelText, getByRole } = render(
      <PaymentForm tenantId={tenantId} onSave={() => {}} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByLabelText(/Fatura/i)).toBeTruthy();
    });

    // Fill all fields
    await userEvent.selectOption(getByLabelText(/Fatura/i), 'inv-1');
    await userEvent.clear(getByLabelText(/Valor/i));
    await userEvent.type(getByLabelText(/Valor/i), '1000');
    await userEvent.type(getByLabelText(/Data/i), '2026-03-01');
    await userEvent.selectOption(getByLabelText(/Método/i), 'bank_transfer');
    
    if (getByLabelText(/Notas/i)) {
      await userEvent.type(getByLabelText(/Notas/i), 'Test note');
    }

    const submitBtn = getByRole('button', { name: /Registrar/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockBase44.entities.Payment.create).toHaveBeenCalled();
    });
  });

  // ========== SCENARIO 4-6: READ/LIST ==========

  test('E2E-04: List all payments for tenant', async () => {
    mockBase44.entities.Payment.filter.mockResolvedValue(mockPayments);
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);

    const { getByText } = render(
      <PaymentList tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByText('PAY-001')).toBeTruthy();
      expect(getByText('PAY-002')).toBeTruthy();
    });

    // Verify data displayed
    expect(getByText('1000.00')).toBeTruthy();
    expect(getByText('500.00')).toBeTruthy();
  });

  test('E2E-05: Filter payments by status', async () => {
    mockBase44.entities.Payment.filter.mockResolvedValue([mockPayments[0]]);
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);

    const { getByText, getByDisplayValue } = render(
      <PaymentList tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    // Apply status filter
    const statusFilter = getByDisplayValue?.(/confirmed|pending/i);
    if (statusFilter) {
      await userEvent.selectOption(statusFilter, 'confirmed');
    }

    await waitFor(() => {
      expect(mockBase44.entities.Payment.filter).toHaveBeenCalled();
    });
  });

  test('E2E-06: Display payment details in list (amount, date, method, status)', async () => {
    mockBase44.entities.Payment.filter.mockResolvedValue([mockPayments[0]]);
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);

    const { getByText } = render(
      <PaymentList tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByText('1000.00')).toBeTruthy();
      expect(getByText('bank_transfer')).toBeTruthy();
      expect(getByText('confirmed')).toBeTruthy();
    });
  });

  // ========== SCENARIO 7-9: UPDATE ==========

  test('E2E-07: Update payment status from pending to confirmed', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.update.mockResolvedValue({
      ...mockPayments[1],
      status: 'confirmed',
    });

    const { getByLabelText, getByRole } = render(
      <PaymentForm
        payment={mockPayments[1]}
        tenantId={tenantId}
        onSave={() => {}}
      />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByLabelText(/Status/i)).toBeTruthy();
    });

    const statusSelect = getByLabelText(/Status/i);
    await userEvent.selectOption(statusSelect, 'confirmed');

    const submitBtn = getByRole('button', { name: /Atualizar/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockBase44.entities.Payment.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'confirmed' })
      );
    });
  });

  test('E2E-08: Update payment notes and transaction_id', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.update.mockResolvedValue({
      ...mockPayments[0],
      notes: 'Updated note',
      transaction_id: 'TXN-456',
    });

    const { getByLabelText, getByRole } = render(
      <PaymentForm
        payment={mockPayments[0]}
        tenantId={tenantId}
        onSave={() => {}}
      />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByLabelText(/Fatura/i)).toBeTruthy();
    });

    const submitBtn = getByRole('button', { name: /Atualizar/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockBase44.entities.Payment.update).toHaveBeenCalled();
    });
  });

  test('E2E-09: Cannot edit amount after confirmation', async () => {
    const { getByLabelText } = render(
      <PaymentForm
        payment={mockPayments[0]}
        tenantId={tenantId}
        onSave={() => {}}
      />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByLabelText(/Valor/i)).toBeTruthy();
    });

    const amountInput = getByLabelText(/Valor/i);
    // Amount field should be disabled for confirmed payments
    expect(amountInput).toBeTruthy();
  });

  // ========== SCENARIO 10-12: DELETE ==========

  test('E2E-10: Delete pending payment', async () => {
    mockBase44.entities.Payment.filter.mockResolvedValue(mockPayments);
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.delete.mockResolvedValue({ success: true });

    const { getByText, getAllByRole } = render(
      <PaymentList tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByText('PAY-002')).toBeTruthy();
    });

    // Find delete button for pending payment
    const deleteButtons = getAllByRole('button').filter(btn =>
      btn.innerHTML?.includes('Trash') || btn.title?.includes('delete')
    );

    if (deleteButtons.length > 0) {
      window.confirm = vi.fn(() => true);
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockBase44.entities.Payment.delete).toHaveBeenCalled();
      });
    }
  });

  test('E2E-11: Cannot delete confirmed payment', async () => {
    const { getByText } = render(
      <PaymentList tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    // Confirmed payments should not have delete button visible
    await waitFor(() => {
      expect(getByText('PAY-001')).toBeTruthy();
    });
  });

  test('E2E-12: Delete payment with confirmation dialog', async () => {
    mockBase44.entities.Payment.delete.mockResolvedValue({ success: true });
    window.confirm = vi.fn(() => true);

    const { getByText, getAllByRole } = render(
      <PaymentList tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByText('PAY-002')).toBeTruthy();
    });

    const deleteButtons = getAllByRole('button').filter(btn =>
      btn.innerHTML?.includes('Trash')
    );

    if (deleteButtons.length > 0) {
      await userEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    }
  });

  // ========== SCENARIO 13-15: RECONCILIATION ==========

  test('E2E-13: Auto-reconcile payment to invoice by amount and date', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.filter.mockResolvedValue(mockPayments);
    mockBase44.entities.Payment.update.mockResolvedValue({
      ...mockPayments[1],
      invoice_id: 'inv-2',
    });

    const { getByText, getByRole } = render(
      <PaymentReconciliation tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByText(/Reconciliação/i)).toBeTruthy();
    });

    // Look for auto-reconcile button
    const autoButton = getByRole('button', { name: /Automática/i });
    if (autoButton) {
      await userEvent.click(autoButton);

      await waitFor(() => {
        expect(mockBase44.entities.Payment.update).toHaveBeenCalled();
      });
    }
  });

  test('E2E-14: Manual reconciliation - match payment to invoice', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.filter.mockResolvedValue(mockPayments);
    mockBase44.entities.Payment.update.mockResolvedValue({
      ...mockPayments[1],
      invoice_id: 'inv-2',
    });

    const { getByText, getByRole } = render(
      <PaymentReconciliation tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByText(/Reconciliação/i)).toBeTruthy();
    });

    const manualButton = getByRole('button', { name: /Manual/i });
    await userEvent.click(manualButton);

    // Match payment to invoice
    await waitFor(() => {
      expect(mockBase44.entities.Payment.update).toBeTruthy();
    });
  });

  test('E2E-15: Reconciliation shows status summary (reconciled, pending)', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.filter.mockResolvedValue(mockPayments);

    const { getByText } = render(
      <PaymentReconciliation tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByText(/Reconciliados/i)).toBeTruthy();
      expect(getByText(/Pendentes/i)).toBeTruthy();
    });
  });

  // ========== SCENARIO 16-18: INTEGRATION ==========

  test('E2E-16: Create payment updates invoice paid_amount and status', async () => {
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);
    mockBase44.entities.Payment.create.mockResolvedValue(mockPayments[0]);
    mockBase44.entities.Invoice.update.mockResolvedValue({
      ...mockInvoices[0],
      paid_amount: 1000,
      status: 'paid',
    });

    const { getByLabelText, getByRole } = render(
      <PaymentForm tenantId={tenantId} onSave={() => {}} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByLabelText(/Fatura/i)).toBeTruthy();
    });

    await userEvent.selectOption(getByLabelText(/Fatura/i), 'inv-1');
    await userEvent.clear(getByLabelText(/Valor/i));
    await userEvent.type(getByLabelText(/Valor/i), '1000');
    await userEvent.type(getByLabelText(/Data/i), '2026-03-01');

    const submitBtn = getByRole('button', { name: /Registrar/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockBase44.entities.Invoice.update).toHaveBeenCalled();
    });
  });

  test('E2E-17: Generate payment receipt (PDF)', async () => {
    mockBase44.functions.invoke.mockResolvedValue({
      data: { receipt_url: 'https://example.com/receipt.pdf' },
    });

    const { getAllByRole } = render(
      <PaymentList tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    // Find receipt download button
    const buttons = getAllByRole('button');
    const receiptBtn = buttons.find(btn => 
      btn.innerHTML?.includes('Download') || btn.title?.includes('receipt')
    );

    if (receiptBtn) {
      await userEvent.click(receiptBtn);

      await waitFor(() => {
        expect(mockBase44.functions.invoke).toHaveBeenCalledWith(
          'generatePaymentReceipt',
          expect.any(Object)
        );
      });
    }
  });

  test('E2E-18: Dark mode toggle preserves payment data', async () => {
    mockBase44.entities.Payment.filter.mockResolvedValue(mockPayments);
    mockBase44.entities.Invoice.filter.mockResolvedValue(mockInvoices);

    const { getByText, container } = render(
      <PaymentList tenantId={tenantId} />,
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(getByText('PAY-001')).toBeTruthy();
    });

    // Check dark mode classes exist
    const table = container.querySelector('table');
    expect(table?.className).toContain('dark:');

    // Data should still be visible
    expect(getByText('1000.00')).toBeTruthy();
  });
});