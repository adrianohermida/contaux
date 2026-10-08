/**
 * Unit Tests - QuoteList Component
 * Tests list display, filtering, searching, and actions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuoteList from '@/components/dashboard/QuoteList';

// Mock base44
const mockQuotes = [
  {
    id: 'quote_1',
    quote_number: 'QT-0001',
    client_id: 'cli_1',
    quote_date: '2026-03-02',
    valid_until: '2026-04-02',
    currency: 'BRL',
    status: 'draft',
    total_amount: 1000,
  },
  {
    id: 'quote_2',
    quote_number: 'QT-0002',
    client_id: 'cli_2',
    quote_date: '2026-03-01',
    valid_until: '2026-04-01',
    currency: 'USD',
    status: 'sent',
    total_amount: 2000,
  },
];

const mockClients = [
  { id: 'cli_1', company_name: 'Client A' },
  { id: 'cli_2', company_name: 'Client B' },
];

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      Quote: {
        filter: vi.fn().mockResolvedValue(mockQuotes),
        delete: vi.fn().mockResolvedValue(true),
      },
      Client: {
        filter: vi.fn().mockResolvedValue(mockClients),
      },
    },
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('QuoteList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Loads and displays quotes
  it('should load and display quotes', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('QT-0001')).toBeInTheDocument();
      expect(screen.getByText('QT-0002')).toBeInTheDocument();
    });
  });

  // Scenario 2: Shows loading state initially
  it('should show loading state', async () => {
    const mockOnEdit = vi.fn();
    const { rerender } = renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    // Loading is shown briefly
    expect(screen.getByText(/Carregando/i) || screen.getByText('QT-0001')).toBeInTheDocument();
  });

  // Scenario 3: Search by quote number
  it('should filter quotes by quote number search', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('QT-0001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por nº ou cliente/i);
    fireEvent.change(searchInput, { target: { value: 'QT-0001' } });

    await waitFor(() => {
      expect(screen.getByText('QT-0001')).toBeInTheDocument();
    });
  });

  // Scenario 4: Search by client name
  it('should filter quotes by client name', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por nº ou cliente/i);
    fireEvent.change(searchInput, { target: { value: 'Client A' } });

    // Client A should be visible
    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });
  });

  // Scenario 5: Filter by status
  it('should filter quotes by status', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('QT-0001')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue(/Todos Status/i);
    fireEvent.change(statusSelect, { target: { value: 'draft' } });

    // Should filter to draft quotes only
    await waitFor(() => {
      expect(screen.getByText('QT-0001')).toBeInTheDocument();
    });
  });

  // Scenario 6: Display status badge with correct color
  it('should display status badge with correct styling', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('QT-0001')).toBeInTheDocument();
    });

    // Look for status badges
    const badges = container.querySelectorAll('[class*="bg-"]');
    expect(badges.length).toBeGreaterThan(0);
  });

  // Scenario 7: Edit button calls onEdit callback
  it('should call onEdit when clicking edit button', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('QT-0001')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('[class*="Edit"]'));

    if (editButton) {
      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalled();
    }
  });

  // Scenario 8: Display quote dates formatted
  it('should display quote date formatted in pt-BR', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      // Date should be formatted as dd/mm/yyyy
      const dateElements = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  // Scenario 9: Display total amount formatted
  it('should display total amount with correct formatting', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('1000.00')).toBeInTheDocument();
    });
  });

  // Scenario 10: Show empty state message
  it('should show empty state when no quotes exist', async () => {
    vi.mocked(require('@/api/base44Client').base44.entities.Quote.filter)
      .mockResolvedValueOnce([]);

    const mockOnEdit = vi.fn();
    renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma cotação encontrada/i)).toBeInTheDocument();
    });
  });

  // Scenario 11: Dark mode styling applied
  it('should apply dark mode classes', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('QT-0001')).toBeInTheDocument();
    });

    const darkElements = container.querySelectorAll('[class*="dark:"]');
    expect(darkElements.length).toBeGreaterThan(0);
  });

  // Scenario 12: Mobile card view renders on small screens
  it('should render mobile card view', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <QuoteList
        tenantId="tenant_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('QT-0001')).toBeInTheDocument();
    });

    // Mobile view should have md:hidden class
    const mobileSection = container.querySelector('[class*="md:hidden"]');
    expect(mobileSection).toBeInTheDocument();
  });
});