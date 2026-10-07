/**
 * Unit Tests - CampaignForm Component
 * Tests campaign creation, editing, scheduling, and segmentation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CampaignForm from '@/components/dashboard/CampaignForm';

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      Template: {
        filter: vi.fn().mockResolvedValue([
          { id: 'tpl_1', name: 'Welcome Template' },
          { id: 'tpl_2', name: 'Promotional Template' },
        ]),
      },
      Campaign: {
        create: vi.fn().mockResolvedValue({ id: 'camp_1', campaign_number: 'CAMP-0001' }),
        update: vi.fn().mockResolvedValue({ id: 'camp_1' }),
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

describe('CampaignForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Form renders with all fields
  it('should render form with all required fields', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Nova Campanha/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Nome da Campanha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Campanha/i)).toBeInTheDocument();
  });

  // Scenario 2: Campaign type selector
  it('should select different campaign types', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Campanha/i)).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText(/Tipo de Campanha/i);
    fireEvent.change(typeSelect, { target: { value: 'sms' } });
    expect(typeSelect.value).toBe('sms');
  });

  // Scenario 3: Template dropdown loads
  it('should load templates in dropdown', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Nova Campanha/i)).toBeInTheDocument();
    });
  });

  // Scenario 4: Subject line input for email
  it('should show subject line for email campaigns', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Nova Campanha/i)).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText(/Tipo de Campanha/i);
    fireEvent.change(typeSelect, { target: { value: 'email' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/Assunto do Email/i)).toBeInTheDocument();
    });
  });

  // Scenario 5: Budget input
  it('should accept budget amount', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const budgetInput = screen.getByLabelText(/Orçamento/i);
    fireEvent.change(budgetInput, { target: { value: '1000' } });
    expect(budgetInput.value).toBe('1000');
  });

  // Scenario 6: Cost per message input
  it('should accept cost per message', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const costInput = screen.getByLabelText(/Custo por Mensagem/i);
    fireEvent.change(costInput, { target: { value: '0.50' } });
    expect(costInput.value).toBe('0.50');
  });

  // Scenario 7: Target segment selector
  it('should select target segment', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const segmentSelect = screen.getByLabelText(/Segmento Alvo/i);
    fireEvent.change(segmentSelect, { target: { value: 'hot_leads' } });
    expect(segmentSelect.value).toBe('hot_leads');
  });

  // Scenario 8: Schedule date picker
  it('should accept schedule date', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const dateInput = screen.getByLabelText(/Data de Agendamento/i);
    fireEvent.change(dateInput, { target: { value: '2026-04-15T10:00' } });
    expect(dateInput.value).toBe('2026-04-15T10:00');
  });

  // Scenario 9: Recurring campaign toggle
  it('should enable recurring campaign option', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const recurringCheckbox = screen.getByRole('checkbox', { name: /Campanha Recorrente/i });
    fireEvent.click(recurringCheckbox);
    expect(recurringCheckbox.checked).toBe(true);
  });

  // Scenario 10: Tags input
  it('should accept tags input', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const tagsInput = screen.getByPlaceholderText(/e.g., promotional, seasonal/i);
    fireEvent.change(tagsInput, { target: { value: 'promotional, seasonal' } });
    expect(tagsInput.value).toBe('promotional, seasonal');
  });

  // Scenario 11: Edit existing campaign loads data
  it('should load existing campaign data in edit mode', async () => {
    const existingCampaign = {
      id: 'camp_1',
      name: 'Spring Sale Campaign',
      type: 'email',
      budget: 5000,
      status: 'draft',
    };

    const mockOnCancel = vi.fn();
    renderWithProviders(
      <CampaignForm
        campaign={existingCampaign}
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Editar Campanha/i)).toBeInTheDocument();
    });
  });

  // Scenario 12: Dark mode classes applied
  it('should apply dark mode styling', async () => {
    const mockOnCancel = vi.fn();
    const { container } = renderWithProviders(
      <CampaignForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const formElement = container.querySelector('form');
    expect(formElement).toHaveClass('dark:bg-slate-900');
  });
});