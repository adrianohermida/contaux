/**
 * ClientForm Unit Tests
 * Validação de criação e edição de clientes
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientForm from '../dashboard/ClientForm';
import { vi } from 'vitest';

// Mock base44
vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      Client: {
        create: vi.fn(),
        update: vi.fn(),
      },
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock hooks
vi.mock('@/components/hooks/useViaCEP', () => ({
  useViaCEP: () => ({
    fetchAddress: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn(),
  }),
  validateCEP: () => true,
  formatCEP: (value) => value,
}));

describe('ClientForm Component', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const tenantId = 'test-tenant-123';

  const defaultProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel,
    tenantId,
    isOpen: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders form with all required fields', () => {
    render(<ClientForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/Tipo de Cliente/i)).toBeTruthy();
    expect(screen.getByLabelText(/Razão Social|Nome Completo/i)).toBeTruthy();
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/Telefone/i)).toBeTruthy();
  });

  test('validates required fields on submit', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Criar/i });
    await user.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.queryByText(/Email inválido/i)).toBeTruthy();
    });
  });

  test('accepts valid email format', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test('formats CPF automatically', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);
    
    // Change to Pessoa Física
    const clientTypeSelect = screen.getByLabelText(/Tipo de Cliente/i);
    await user.click(clientTypeSelect);
    await user.selectOption(clientTypeSelect, 'pf');
    
    const cpfInput = screen.getByLabelText(/CPF/i);
    await user.type(cpfInput, '12345678901');
    
    // Should auto-format to XXX.XXX.XXX-XX
    expect(cpfInput.value).toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
  });

  test('formats CNPJ automatically', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);
    
    const cnpjInput = screen.getByLabelText(/CNPJ/i);
    await user.type(cnpjInput, '12345678901234');
    
    // Should auto-format to XX.XXX.XXX/XXXX-XX
    expect(cnpjInput.value).toMatch(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
  });

  test('disables submit button when form is not dirty', () => {
    render(<ClientForm {...defaultProps} client={null} />);
    
    const submitButton = screen.getByRole('button', { name: /Criar/i });
    expect(submitButton).toBeDisabled();
  });

  test('enables submit button when form data changes', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/Razão Social|Nome Completo/i);
    await user.type(nameInput, 'Test Company');
    
    const submitButton = screen.getByRole('button', { name: /Criar/i });
    expect(submitButton).not.toBeDisabled();
  });

  test('switches between PF and PJ fields', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);
    
    // Initially shows CNPJ (default is PJ)
    expect(screen.getByLabelText(/CNPJ/i)).toBeTruthy();
    
    // Switch to PF
    const clientTypeSelect = screen.getByLabelText(/Tipo de Cliente/i);
    await user.selectOption(clientTypeSelect, 'pf');
    
    // Now should show CPF instead
    await waitFor(() => {
      expect(screen.getByLabelText(/CPF/i)).toBeTruthy();
    });
  });

  test('displays edit mode when client is provided', () => {
    const existingClient = {
      id: '123',
      company_name: 'Existing Company',
      email: 'existing@example.com',
      client_type: 'pj',
    };
    
    render(<ClientForm {...defaultProps} client={existingClient} />);
    
    expect(screen.getByRole('heading', { name: /Editar Cliente/i })).toBeTruthy();
    expect(screen.getByDisplayValue('Existing Company')).toBeTruthy();
  });

  test('shows cancel button to close form', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('has proper ARIA labels for accessibility', () => {
    render(<ClientForm {...defaultProps} />);
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-describedby');
    });
  });
});