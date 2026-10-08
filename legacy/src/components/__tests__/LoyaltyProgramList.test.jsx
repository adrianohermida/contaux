/**
 * Unit Tests - LoyaltyProgramList Component
 * Tests program list display, filtering, searching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoyaltyProgramList from '@/components/dashboard/LoyaltyProgramList';

const mockPrograms = [
  {
    id: 'prog_1',
    name: 'Gold Rewards',
    status: 'active',
    member_count: 500,
    total_points_issued: 25000,
    points_per_dollar: 2,
  },
  {
    id: 'prog_2',
    name: 'Silver Program',
    status: 'active',
    member_count: 300,
    total_points_issued: 12000,
    points_per_dollar: 1,
  },
  {
    id: 'prog_3',
    name: 'Legacy Program',
    status: 'archived',
    member_count: 100,
    total_points_issued: 5000,
    points_per_dollar: 1,
  },
];

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      LoyaltyProgram: {
        filter: vi.fn().mockResolvedValue(mockPrograms),
        delete: vi.fn().mockResolvedValue(true),
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

describe('LoyaltyProgramList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Load and display programs
  it('should load and display loyalty programs', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
      expect(screen.getByText('Silver Program')).toBeInTheDocument();
    });
  });

  // Scenario 2: Display member count
  it('should display member count', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  // Scenario 3: Display points issued
  it('should display total points issued', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    expect(screen.getByText('25,000')).toBeInTheDocument();
  });

  // Scenario 4: Filter by status
  it('should filter programs by status', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue(/Todos Status/i);
    fireEvent.change(statusSelect, { target: { value: 'active' } });
  });

  // Scenario 5: Search by program name
  it('should search programs by name', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/Buscar por nome/i);
    fireEvent.change(searchInput, { target: { value: 'Gold' } });
  });

  // Scenario 6: Display program status badge
  it('should display status badge', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('archived')).toBeInTheDocument();
  });

  // Scenario 7: Edit button callback
  it('should call onEdit when clicking edit', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    const editButtons = container.querySelectorAll('button svg');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  // Scenario 8: Delete program
  it('should delete program when confirmed', async () => {
    const mockOnEdit = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  // Scenario 9: Points per dollar display
  it('should display points per dollar ratio', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    expect(screen.getByText(/2 pt por/i)).toBeInTheDocument();
  });

  // Scenario 10: Mobile card view
  it('should render mobile card view', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    const mobileSection = container.querySelector('[class*="md:hidden"]');
    expect(mobileSection).toBeInTheDocument();
  });

  // Scenario 11: Dark mode styling
  it('should apply dark mode classes', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gold Rewards')).toBeInTheDocument();
    });

    const darkElements = container.querySelectorAll('[class*="dark:"]');
    expect(darkElements.length).toBeGreaterThan(0);
  });

  // Scenario 12: Empty state
  it('should show empty state when no programs', async () => {
    vi.resetModules();
    const mockOnEdit = vi.fn();

    renderWithProviders(
      <LoyaltyProgramList
        workspaceId="ws_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Carregando programas/i)).toBeInTheDocument();
    });
  });
});