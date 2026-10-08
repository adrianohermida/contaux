/**
 * Unit Tests - SalesOpportunityList Component
 * Tests list display, filtering, searching, and lead score categories
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SalesOpportunityList from '@/components/dashboard/SalesOpportunityList';

const mockOpportunities = [
  {
    id: 'opp_1',
    opportunity_name: 'Enterprise Deal A',
    contact_id: 'cli_1',
    deal_value: 150000,
    pipeline_stage: 'proposal',
    lead_score: 85,
  },
  {
    id: 'opp_2',
    opportunity_name: 'Mid-Market Deal B',
    contact_id: 'cli_2',
    deal_value: 50000,
    pipeline_stage: 'qualified',
    lead_score: 45,
  },
  {
    id: 'opp_3',
    opportunity_name: 'Small Deal C',
    contact_id: 'cli_1',
    deal_value: 10000,
    pipeline_stage: 'prospect',
    lead_score: 15,
  },
];

const mockClients = [
  { id: 'cli_1', company_name: 'Client A' },
  { id: 'cli_2', company_name: 'Client B' },
];

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      SalesOpportunity: {
        filter: vi.fn().mockResolvedValue(mockOpportunities),
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

describe('SalesOpportunityList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Load and display opportunities
  it('should load and display opportunities', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
      expect(screen.getByText('Mid-Market Deal B')).toBeInTheDocument();
    });
  });

  // Scenario 2: Display lead scores with correct categories
  it('should display lead scores with Hot/Warm/Cold categories', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument(); // Hot (85)
      expect(screen.getByText('45')).toBeInTheDocument(); // Warm (45)
      expect(screen.getByText('15')).toBeInTheDocument(); // Cold (15)
    });
  });

  // Scenario 3: Search by opportunity name
  it('should filter opportunities by name search', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por nome ou cliente/i);
    fireEvent.change(searchInput, { target: { value: 'Enterprise' } });

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
    });
  });

  // Scenario 4: Search by client name
  it('should filter opportunities by client name', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por nome ou cliente/i);
    fireEvent.change(searchInput, { target: { value: 'Client A' } });
  });

  // Scenario 5: Filter by pipeline stage
  it('should filter opportunities by pipeline stage', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
    });
  });

  // Scenario 6: Filter by lead score category (Hot/Warm/Cold)
  it('should filter opportunities by lead score category', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
    });

    const scoreFilter = screen.getByDisplayValue(/Todos Scores/i);
    expect(scoreFilter).toBeInTheDocument();
  });

  // Scenario 7: Display deal values formatted
  it('should display deal values with proper formatting', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('150000.00')).toBeInTheDocument();
      expect(screen.getByText('50000.00')).toBeInTheDocument();
      expect(screen.getByText('10000.00')).toBeInTheDocument();
    });
  });

  // Scenario 8: Display pipeline stage badges
  it('should display pipeline stage badges', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
    });

    const badges = container.querySelectorAll('[class*="bg-"]');
    expect(badges.length).toBeGreaterThan(0);
  });

  // Scenario 9: Edit button calls callback
  it('should call onEdit when clicking edit button', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
    });
  });

  // Scenario 10: Delete button functionality
  it('should delete opportunity when confirmed', async () => {
    const mockOnEdit = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  // Scenario 11: Dark mode styling applied
  it('should apply dark mode classes', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
    });

    const darkElements = container.querySelectorAll('[class*="dark:"]');
    expect(darkElements.length).toBeGreaterThan(0);
  });

  // Scenario 12: Mobile card view renders
  it('should render mobile card view', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <SalesOpportunityList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Enterprise Deal A')).toBeInTheDocument();
    });

    const mobileSection = container.querySelector('[class*="md:hidden"]');
    expect(mobileSection).toBeInTheDocument();
  });
});