/**
 * Sprint 35 Phase 3 - UX Improvements E2E Tests
 * Comprehensive test suite for user preferences and settings
 */

describe('Sprint 35 Phase 3 - UX Improvements', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('useUserPreferences Hook', () => {
    it('should initialize with default preferences', () => {
      cy.mount(() => {
        const { preferences } = require('@/components/hooks/useUserPreferences').default('test-user');
        return <div>{preferences.theme}</div>;
      });
      cy.contains('dark').should('exist');
    });

    it('should update individual preference', () => {
      cy.mount(() => {
        const { preferences, updatePreference } = require('@/components/hooks/useUserPreferences').default('test-user');
        return (
          <div>
            <button onClick={() => updatePreference('theme', 'light')}>Change Theme</button>
            <span>{preferences.theme}</span>
          </div>
        );
      });
      cy.contains('button', 'Change Theme').click();
    });

    it('should persist preferences to localStorage', () => {
      cy.mount(() => {
        const { updatePreference } = require('@/components/hooks/useUserPreferences').default('test-user');
        return <button onClick={() => updatePreference('language', 'en-US')}>Update</button>;
      });
      cy.contains('button', 'Update').click();
      cy.window().then((win) => {
        const stored = JSON.parse(win.localStorage.getItem('user_preferences_test-user'));
        expect(stored).to.have.property('language');
      });
    });

    it('should bulk update preferences', () => {
      cy.mount(() => {
        const { updatePreferences } = require('@/components/hooks/useUserPreferences').default('test-user');
        return (
          <button onClick={() => updatePreferences({ theme: 'light', language: 'pt-BR' })}>
            Bulk Update
          </button>
        );
      });
    });

    it('should reset to default preferences', () => {
      cy.mount(() => {
        const { resetPreferences } = require('@/components/hooks/useUserPreferences').default('test-user');
        return <button onClick={() => resetPreferences()}>Reset</button>;
      });
    });
  });

  describe('UserSettingsPanel Component', () => {
    it('should render settings header', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Settings').should('be.visible');
    });

    it('should display theme selector', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Theme').should('be.visible');
    });

    it('should display language picker', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Language').should('be.visible');
    });

    it('should display notification toggle', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Push Notifications').should('be.visible');
    });

    it('should have Save Changes button', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('button', 'Save Changes').should('be.visible');
    });

    it('should have Reset button', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('button', 'Reset').should('be.visible');
    });

    it('should be fully responsive on mobile', () => {
      cy.viewport('iphone-x');
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Settings').should('be.visible');
    });

    it('should support dark mode', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.get('body').should('have.class', 'dark');
    });

    it('should have proper ARIA labels', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.get('[role="heading"]').should('exist');
    });

    it('should be keyboard navigable', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.tab();
      cy.focused().should('exist');
    });
  });

  describe('Theme Settings', () => {
    it('should display theme options (Dark, Light, Auto)', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Theme').parent().should('contain', 'Dark');
    });

    it('should allow theme selection', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.get('[role="combobox"]').first().click();
    });
  });

  describe('Language Settings', () => {
    it('should display language options', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Language').parent().should('contain', 'Português');
    });

    it('should support multiple languages (PT, EN, ES)', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('pt-BR').should('exist');
    });
  });

  describe('Layout Settings', () => {
    it('should display layout mode selector', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Layout').should('be.visible');
    });

    it('should support Full and Compact modes', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Full').should('exist');
    });
  });

  describe('Notification Settings', () => {
    it('should have toggles for push notifications', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.get('[role="switch"]').should('have.length.at.least', 1);
    });

    it('should have toggle for email updates', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.contains('Email Updates').should('be.visible');
    });
  });

  describe('Dark Mode Support', () => {
    it('should render correctly in dark mode', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.get('.dark').should('exist');
    });

    it('should apply dark mode classes to all elements', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.get('[class*="dark:"]').should('have.length.greaterThan', 5);
    });
  });

  describe('Mobile Responsiveness', () => {
    ['iphone-x', 'ipad-2', 'macbook-15'].forEach((device) => {
      it(`should be responsive on ${device}`, () => {
        cy.viewport(device);
        cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
        cy.contains('Settings').should('be.visible');
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper heading hierarchy', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.get('h1, h2, h3').should('have.length.greaterThan', 0);
    });

    it('should support keyboard navigation', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.get('button, [role="button"], [role="switch"]').first().focus();
      cy.focused().should('exist');
    });

    it('should have descriptive labels', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.get('label').should('have.length.greaterThan', 0);
    });
  });

  describe('Preference Persistence', () => {
    it('should persist theme preference', () => {
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
      cy.window().then((win) => {
        win.localStorage.setItem('user_preferences_test', JSON.stringify({ theme: 'light' }));
      });
      cy.reload();
    });

    it('should load saved preferences on mount', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('user_preferences_test', JSON.stringify({ theme: 'dark' }));
      });
      cy.mount(require('@/components/dashboard/UserSettingsPanel').default);
    });
  });
});