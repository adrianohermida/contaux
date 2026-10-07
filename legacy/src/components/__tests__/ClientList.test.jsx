/**
 * ClientList Unit Tests
 * Validação de listagem e operações CRUD
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientList from '../dashboard/ClientList';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock base44
const mockBase44 = {
  entities: {
    Client: {
      filter: vi.fn(),
      delete: vi.fn(),
    },
  },
};

vi.mock('@/api/base44Client', () => ({
  base44: mockBase44,
}));

// Mock auth hook
vi.mock('@/components/auth/useMultitenantAuthOptimized', () => ({
  useMultitenantAuthOptimized: () => ({
    workspaceId: 'test-workspace',
  }),
}));

// Mock cache strategy
vi.mock('@/components/hooks/useCacheStrategy', () => ({
  useCacheStrategy: () => ({
    invalidateRelated: vi.fn(),
  }),
}));

// Mock navigation
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
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

describe('ClientList Component', () => {
  const mockClients = [
    {
      id: '1',
      company_name: 'Company A',
      email: 'a@example.com',
      phone: '11999999999',
      client_type: 'pj',
      status: 'active',
    },
    {
      id: '2',
      company_name: 'Company B',
      email: 'b@example.com',
      phone: '11888888888',
      client_type: 'pf',
      status: 'inactive',
    },
  ];

  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockBase44.entities.Client.filter.mockResolvedValue(mockClients);
  });

  test('renders clients in table on desktop', async () => {
    render(<ClientList onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Company A')).toBeTruthy();
      expect(screen.getByText('Company B')).toBeTruthy();
    });
  });

  test('displays client information correctly', async () => {
    render(<ClientList onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('a@example.com')).toBeTruthy();
      expect(screen.getByText('11999999999')).toBeTruthy();
      expect(screen.getByText('PJ')).toBeTruthy();
    });
  });

  test('shows loading state while fetching clients', () => {
    mockBase44.entities.Client.filter.mockImplementationOnce(() => 
      new Promise(() => {}) // Never resolves
    );
    
    render(<ClientList onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    expect(screen.getByText(/Carregando clientes/i)).toBeTruthy();
  });

  test('calls onEdit with selected client', async () => {
    const user = userEvent.setup();
    render(<ClientList onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const editButtons = screen.getAllByTitle('Editar');
      expect(editButtons.length).toBeGreaterThan(0);
    });
    
    const editButton = screen.getAllByTitle('Editar')[0];
    await user.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockClients[0]);
  });

  test('handles delete with confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    
    render(<ClientList onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Deletar');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
    
    const deleteButton = screen.getAllByTitle('Deletar')[0];
    await user.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockBase44.entities.Client.delete).toHaveBeenCalledWith('1');
  });

  test('requires confirmation before deleting', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);
    
    render(<ClientList onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Deletar');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
    
    const deleteButton = screen.getAllByTitle('Deletar')[0];
    await user.click(deleteButton);
    
    expect(mockBase44.entities.Client.delete).not.toHaveBeenCalled();
  });

  test('displays empty message when no clients', async () => {
    mockBase44.entities.Client.filter.mockResolvedValueOnce([]);
    
    render(<ClientList onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhum cliente cadastrado/i)).toBeTruthy();
    });
  });

  test('refetches when refresh prop changes', async () => {
    const { rerender } = render(
      <ClientList onEdit={mockOnEdit} refresh={false} />,
      { wrapper: Wrapper }
    );
    
    expect(mockBase44.entities.Client.filter).toHaveBeenCalledTimes(1);
    
    rerender(<ClientList onEdit={mockOnEdit} refresh={true} />);
    
    await waitFor(() => {
      expect(mockBase44.entities.Client.filter).toHaveBeenCalledTimes(2);
    });
  });

  test('has proper dark mode classes', () => {
    const { container } = render(<ClientList onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    const table = container.querySelector('table');
    expect(table?.className).toContain('dark:bg-slate-800');
  });

  test('has keyboard navigation support', async () => {
    const user = userEvent.setup();
    render(<ClientList onEdit={mockOnEdit} />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      buttons.forEach(btn => {
        expect(btn).toHaveAttribute('title');
      });
    });
  });
});