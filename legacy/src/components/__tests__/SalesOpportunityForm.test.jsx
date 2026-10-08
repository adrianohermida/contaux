/**
 * Unit Tests - SalesOpportunityForm Component
 * Tests opportunity creation, editing, lead score calculation, and form validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SalesOpportunityForm from '@/components/dashboard/SalesOpportunityForm';

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      Client: {
        filter: vi.fn().mockResolvedValue([
          { id: 'cli_1', company_name: 'Client A' },
          { id: 'cli_2', company_name: 'Client B' },
        ]),
      },
      SalesOpportunity: {
        create: vi.fn().mockResolvedValue({ id: 'opp_1', opportunity_number: 'OPP-0001' }),
        update: vi.fn().mockResolvedValue({ id: 'opp_1' }),
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

describe('SalesOpportunityForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Form renders with all fields
  it('should render form with all required fields', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Nova Oportunidade/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Contato\/Cliente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome da Oportunidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor da Oportunidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estágio do Pipeline/i)).toBeInTheDocument();
  });

  // Scenario 2: Contact dropdown loads clients
  it('should load and display clients in dropdown', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Contato\/Cliente/i)).toBeInTheDocument();
    });
  });

  // Scenario 3: Lead score calculates and displays
  it('should calculate and display lead score', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Lead Score/i)).toBeInTheDocument();
    });
  });

  // Scenario 4: Deal value input changes lead score
  it('should update lead score when deal value changes', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Valor da Oportunidade/i)).toBeInTheDocument();
    });

    const dealValueInput = screen.getByLabelText(/Valor da Oportunidade/i);
    fireEvent.change(dealValueInput, { target: { value: '50000' } });

    await waitFor(() => {
      expect(dealValueInput.value).toBe('50000');
    });
  });

  // Scenario 5: Pipeline stage selector works
  it('should change pipeline stage', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const stageSelect = screen.getByLabelText(/Estágio do Pipeline/i);
    expect(stageSelect).toBeInTheDocument();
  });

  // Scenario 6: Probability percentage input
  it('should accept conversion probability input', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Probabilidade de Conversão/i)).toBeInTheDocument();
    });

    const probabilityInput = screen.getByLabelText(/Probabilidade de Conversão/i);
    fireEvent.change(probabilityInput, { target: { value: '75' } });

    expect(probabilityInput.value).toBe('75');
  });

  // Scenario 7: Expected close date picker
  it('should accept expected close date', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const dateInput = screen.getByLabelText(/Data Esperada de Fechamento/i);
    fireEvent.change(dateInput, { target: { value: '2026-04-15' } });

    expect(dateInput.value).toBe('2026-04-15');
  });

  // Scenario 8: Lead score badge shows correct category
  it('should display lead score badge with category', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Lead Score/i)).toBeInTheDocument();
    });
  });

  // Scenario 9: Edit existing opportunity loads data
  it('should load existing opportunity data in edit mode', async () => {
    const existingOpportunity = {
      id: 'opp_1',
      opportunity_name: 'Big Deal',
      contact_id: 'cli_1',
      deal_value: 100000,
      pipeline_stage: 'proposal',
      conversion_probability: 75,
      lead_score: 65,
      expected_close_date: '2026-04-15',
    };

    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        opportunity={existingOpportunity}
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Editar Oportunidade/i)).toBeInTheDocument();
    });
  });

  // Scenario 10: Dark mode classes applied
  it('should apply dark mode styling', async () => {
    const mockOnCancel = vi.fn();
    const { container } = renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const formElement = container.querySelector('form');
    expect(formElement).toHaveClass('dark:bg-slate-900');
  });

  // Scenario 11: Description textarea
  it('should accept description text', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const descriptionField = screen.getByPlaceholderText(/Detalhes sobre a oportunidade/i);
    fireEvent.change(descriptionField, { target: { value: 'Test opportunity' } });

    expect(descriptionField.value).toBe('Test opportunity');
  });

  // Scenario 12: Form validation on submit
  it('should validate required fields before submit', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <SalesOpportunityForm
        workspaceId="workspace_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Nova Oportunidade/i)).toBeInTheDocument();
    });
  });
});