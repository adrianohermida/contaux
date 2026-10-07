/**
 * ContactFormA11y Tests
 * Unit tests for accessibility and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactFormEnhanced from '../dashboard/ContactFormEnhanced';

describe('ContactFormA11y', () => {
  const mockWorkspaceId = 'workspace-123';
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    mockOnSuccess.mockClear();
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels', () => {
      render(
        <ContactFormEnhanced 
          workspaceId={mockWorkspaceId}
          onSuccess={mockOnSuccess}
        />
      );

      const form = screen.getByRole('form', { name: /create new contact/i });
      expect(form).toBeInTheDocument();

      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should mark required fields with aria-required or required attribute', () => {
      render(
        <ContactFormEnhanced 
          workspaceId={mockWorkspaceId}
          onSuccess={mockOnSuccess}
        />
      );

      const companyInput = screen.getByLabelText(/company name/i);
      const emailInput = screen.getByLabelText(/email/i);

      expect(companyInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should be fully keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <ContactFormEnhanced 
          workspaceId={mockWorkspaceId}
          onSuccess={mockOnSuccess}
        />
      );

      const companyInput = screen.getByLabelText(/company name/i);
      const submitButton = screen.getByRole('button', { name: /create contact/i });

      // Tab to first field
      await user.tab();
      expect(companyInput).toHaveFocus();

      // Enter form data
      await user.type(companyInput, 'Test Company');
      await user.tab();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveFocus();

      await user.type(emailInput, 'test@example.com');
      await user.tab();
      await user.tab(); // Skip phone input

      expect(submitButton).toHaveFocus();
    });
  });

  describe('Validation', () => {
    it('should show error for invalid email', async () => {
      const user = userEvent.setup();
      render(
        <ContactFormEnhanced 
          workspaceId={mockWorkspaceId}
          onSuccess={mockOnSuccess}
        />
      );

      const companyInput = screen.getByLabelText(/company name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(companyInput, 'Test Company');
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty company name', async () => {
      const user = userEvent.setup();
      render(
        <ContactFormEnhanced 
          workspaceId={mockWorkspaceId}
          onSuccess={mockOnSuccess}
        />
      );

      const companyInput = screen.getByLabelText(/company name/i);
      const submitButton = screen.getByRole('button', { name: /create contact/i });

      // Try to submit empty
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when user corrects input', async () => {
      const user = userEvent.setup();
      render(
        <ContactFormEnhanced 
          workspaceId={mockWorkspaceId}
          onSuccess={mockOnSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);

      // Type invalid email
      await user.type(emailInput, 'invalid');
      await user.tab();

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });

      // Correct the email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');

      // Error should be gone
      await waitFor(() => {
        expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Dark Mode', () => {
    it('should have dark mode classes', () => {
      const { container } = render(
        <ContactFormEnhanced 
          workspaceId={mockWorkspaceId}
          onSuccess={mockOnSuccess}
        />
      );

      const form = container.querySelector('form');
      expect(form).toHaveClass('dark:bg-slate-800');
      expect(form).toHaveClass('dark:border-slate-700');
    });
  });

  describe('Responsive Design', () => {
    it('should render buttons in a flex row', () => {
      const { container } = render(
        <ContactFormEnhanced 
          workspaceId={mockWorkspaceId}
          onSuccess={mockOnSuccess}
        />
      );

      const buttonContainer = container.querySelector('form > div:last-child');
      expect(buttonContainer).toHaveClass('flex');
      expect(buttonContainer).toHaveClass('gap-3');
    });
  });
});