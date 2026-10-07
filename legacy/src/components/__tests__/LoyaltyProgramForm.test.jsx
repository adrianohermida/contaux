/**
 * Unit Tests - LoyaltyProgramForm Component
 * Tests program creation, editing, tier configuration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoyaltyProgramForm from '@/components/dashboard/LoyaltyProgramForm';

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      LoyaltyProgram: {
        create: vi.fn().mockResolvedValue({ id: 'prog_1', name: 'Gold Rewards' }),
        update: vi.fn().mockResolvedValue({ id: 'prog_1' }),
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

describe('LoyaltyProgramForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Form renders with all fields
  it('should render form with required fields', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Novo Programa/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Nome do Programa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pontos por Dollar/i)).toBeInTheDocument();
  });

  // Scenario 2: Program name input
  it('should accept program name', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/Nome do Programa/i);
    fireEvent.change(nameInput, { target: { value: 'Gold Rewards' } });
    expect(nameInput.value).toBe('Gold Rewards');
  });

  // Scenario 3: Points per dollar input
  it('should accept points per dollar value', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const pointsInput = screen.getByLabelText(/Pontos por Dollar/i);
    fireEvent.change(pointsInput, { target: { value: '2' } });
    expect(pointsInput.value).toBe('2');
  });

  // Scenario 4: Redemption rate input
  it('should accept redemption rate', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const redemptionInput = screen.getByLabelText(/Valor de Resgate/i);
    fireEvent.change(redemptionInput, { target: { value: '0.5' } });
    expect(redemptionInput.value).toBe('0.5');
  });

  // Scenario 5: Status selector
  it('should select program status', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });
  });

  // Scenario 6: Tier system toggle
  it('should enable tier system', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const tierToggle = screen.getByLabelText(/Sistema de Tiers/i);
    fireEvent.click(tierToggle);
    expect(tierToggle.checked).toBe(true);
  });

  // Scenario 7: Add tier
  it('should add tier when enabled', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    // Enable tier system
    const tierToggle = screen.getByLabelText(/Sistema de Tiers/i);
    fireEvent.click(tierToggle);

    await waitFor(() => {
      expect(screen.getByText(/Adicionar Tier/i)).toBeInTheDocument();
    });
  });

  // Scenario 8: Launch date picker
  it('should accept launch date', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const dateInput = screen.getByLabelText(/Data de Lançamento/i);
    fireEvent.change(dateInput, { target: { value: '2026-03-15' } });
    expect(dateInput.value).toBe('2026-03-15');
  });

  // Scenario 9: Program description
  it('should accept program description', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const descInput = screen.getByLabelText(/Descrição/i);
    fireEvent.change(descInput, { target: { value: 'Best loyalty program' } });
    expect(descInput.value).toBe('Best loyalty program');
  });

  // Scenario 10: Edit existing program
  it('should load existing program data', async () => {
    const existingProgram = {
      id: 'prog_1',
      name: 'Gold Rewards',
      points_per_dollar: 2,
      status: 'active',
    };

    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        program={existingProgram}
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Editar Programa/i)).toBeInTheDocument();
    });
  });

  // Scenario 11: Form validation
  it('should validate required fields', async () => {
    const mockOnCancel = vi.fn();
    renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText(/Salvar/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/obrigatório/i)).toBeInTheDocument();
    });
  });

  // Scenario 12: Dark mode applied
  it('should apply dark mode classes', async () => {
    const mockOnCancel = vi.fn();
    const { container } = renderWithProviders(
      <LoyaltyProgramForm
        workspaceId="ws_1"
        isOpen={true}
        onCancel={mockOnCancel}
      />
    );

    const darkElements = container.querySelectorAll('[class*="dark:"]');
    expect(darkElements.length).toBeGreaterThan(0);
  });
});