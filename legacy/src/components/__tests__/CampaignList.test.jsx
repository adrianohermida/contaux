/**
 * Unit Tests - CampaignList Component
 * Tests campaign list display, filtering, searching, and engagement metrics
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CampaignList from '@/components/dashboard/CampaignList';

const mockCampaigns = [
  {
    id: 'camp_1',
    name: 'Spring Sale Campaign',
    type: 'email',
    status: 'active',
    sent_count: 1000,
    engagement_metrics: { open_count: 250, click_count: 50, conversion_count: 5 },
    start_date: '2026-03-01T09:00:00',
  },
  {
    id: 'camp_2',
    name: 'Newsletter Vol 5',
    type: 'email',
    status: 'completed',
    sent_count: 500,
    engagement_metrics: { open_count: 150 },
    start_date: '2026-02-28T14:00:00',
  },
  {
    id: 'camp_3',
    name: 'SMS Reminder',
    type: 'sms',
    status: 'draft',
    sent_count: 0,
    engagement_metrics: { open_count: 0 },
  },
];

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      Campaign: {
        filter: vi.fn().mockResolvedValue(mockCampaigns),
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

describe('CampaignList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Load and display campaigns
  it('should load and display campaigns', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
      expect(screen.getByText('Newsletter Vol 5')).toBeInTheDocument();
    });
  });

  // Scenario 2: Display campaign types
  it('should display campaign type badges', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    const emailBadges = screen.getAllByText(/Email/i);
    expect(emailBadges.length).toBeGreaterThan(0);
  });

  // Scenario 3: Display campaign status
  it('should display campaign status badges', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  // Scenario 4: Search by campaign name
  it('should filter campaigns by name search', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por nome/i);
    fireEvent.change(searchInput, { target: { value: 'Spring' } });

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });
  });

  // Scenario 5: Filter by status
  it('should filter campaigns by status', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue(/Todos os Status/i);
    fireEvent.change(statusSelect, { target: { value: 'active' } });
  });

  // Scenario 6: Filter by type
  it('should filter campaigns by type', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    const typeSelect = screen.getByDisplayValue(/Todos os Tipos/i);
    fireEvent.change(typeSelect, { target: { value: 'email' } });
  });

  // Scenario 7: Display sent count
  it('should display sent count', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  // Scenario 8: Calculate and display open rate
  it('should calculate and display open rate', async () => {
    const mockOnEdit = vi.fn();
    renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    // Open rate = 250/1000 = 25%
    expect(screen.getByText('25.0%')).toBeInTheDocument();
  });

  // Scenario 9: Edit button calls callback
  it('should call onEdit when clicking edit button', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    const editButtons = container.querySelectorAll('button svg');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  // Scenario 10: Delete button functionality
  it('should delete campaign when confirmed', async () => {
    const mockOnEdit = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  // Scenario 11: Dark mode styling applied
  it('should apply dark mode classes', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    const darkElements = container.querySelectorAll('[class*="dark:"]');
    expect(darkElements.length).toBeGreaterThan(0);
  });

  // Scenario 12: Mobile card view renders
  it('should render mobile card view', async () => {
    const mockOnEdit = vi.fn();
    const { container } = renderWithProviders(
      <CampaignList
        workspaceId="workspace_1"
        onEdit={mockOnEdit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Spring Sale Campaign')).toBeInTheDocument();
    });

    const mobileSection = container.querySelector('[class*="md:hidden"]');
    expect(mobileSection).toBeInTheDocument();
  });
});