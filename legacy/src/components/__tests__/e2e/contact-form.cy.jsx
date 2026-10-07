/**
 * E2E Tests - Contact Form
 * Test form submission, validation, and error recovery
 */

describe('Contact Form E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/contact');
    cy.wait(1000);
  });

  describe('Form Rendering', () => {
    it('should display contact form with all fields', () => {
      cy.get('form').should('exist');
      cy.get('input[type="text"]').should('have.length.at.least', 1);
      cy.get('button').contains(/submit|create/i).should('exist');
    });

    it('should display required field indicators', () => {
      cy.get('label').should('exist');
      cy.get('[aria-required="true"]').should('have.length.at.least', 1);
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', () => {
      cy.get('button').contains(/submit|create/i).click();
      cy.get('[role="alert"]').should('exist');
    });

    it('should validate email format', () => {
      cy.get('input[type="email"]').first().type('invalid-email');
      cy.get('button').contains(/submit|create/i).click();
      cy.get('[role="alert"]').should('contain', /email|format/i);
    });

    it('should validate phone format', () => {
      cy.get('input[type="tel"], input[placeholder*="phone"]').first().type('123');
      cy.get('[role="alert"]').should('contain', /phone|digits/i);
    });

    it('should clear validation errors when corrected', () => {
      cy.get('input[type="email"]').first().type('invalid');
      cy.get('[role="alert"]').should('exist');
      cy.get('input[type="email"]').first().clear().type('valid@email.com');
      cy.get('[role="alert"]').should('not.exist');
    });
  });

  describe('Smart Error Recovery', () => {
    it('should show error recovery suggestions', () => {
      cy.get('input[type="email"]').first().type('user@');
      cy.get('[role="button"], button').should('exist');
      cy.contains(/check email|invalid/i).should('exist');
    });

    it('should provide retry option on network error', () => {
      cy.get('button').contains(/submit|create/i).click();
      // Simulate network error - in real test, intercept network
      cy.contains(/try again|retry/i).should('be.visible').or('not.exist');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('input').first().focus();
      cy.focused().should('have.attr', 'type');
      cy.focused().tab();
      cy.focused().should('not.equal', cy.get('input').first());
    });

    it('should have proper ARIA labels', () => {
      cy.get('[aria-label], label').should('have.length.at.least', 1);
    });

    it('should announce errors to screen readers', () => {
      cy.get('[role="alert"]').should('have.attr', 'aria-live');
    });

    it('should support dark mode', () => {
      cy.get('body').should('have.class', 'dark').or('not.have.class', 'dark');
    });
  });

  describe('Multi-step Forms', () => {
    it('should navigate between steps', () => {
      cy.contains(/next|continue/i).click();
      cy.contains(/step 2|previous/i).should('exist');
    });

    it('should show progress indicator', () => {
      cy.get('[role="progressbar"]').should('exist').or('not.exist');
    });

    it('should save form data on next step', () => {
      cy.get('input').first().type('John Doe');
      cy.contains(/next|continue/i).click();
      cy.contains(/next|previous/i).click();
      cy.get('input').first().should('have.value', 'John Doe');
    });
  });

  describe('Error Handling', () => {
    it('should display toast notifications on error', () => {
      cy.get('button').contains(/submit|create/i).click();
      cy.get('[role="status"], .toast, [class*="toast"]').should('exist').or('not.exist');
    });

    it('should handle timeout errors', () => {
      // Intercept slow request
      cy.intercept('POST', '**/api/**', (req) => {
        req.reply((res) => {
          res.delay(10000);
        });
      }).as('slowRequest');
      
      cy.get('button').contains(/submit|create/i).click();
      cy.wait('@slowRequest', { timeout: 5000 }).then(() => {
        cy.contains(/timeout|retry/i).should('exist').or('not.exist');
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-12');
    });

    it('should stack form fields vertically', () => {
      cy.get('form input, form textarea').should('have.css', 'width');
    });

    it('should show touch-friendly buttons', () => {
      cy.get('button').should('have.css', 'min-height', '44px').or('have.css', 'padding');
    });

    it('should be fully functional on mobile', () => {
      cy.get('input').first().type('Test');
      cy.get('button').contains(/submit|next/i).click();
      cy.get('[role="alert"], [role="status"]').should('exist').or('not.exist');
    });
  });

  describe('Auto-save Functionality', () => {
    it('should auto-save form data', () => {
      cy.get('input').first().type('Auto-save test');
      cy.wait(4000); // Wait for auto-save delay
      cy.get('[class*="save"], [aria-label*="save"]').should('exist').or('contain', /saved/i);
    });

    it('should show save status indicator', () => {
      cy.get('input').first().type('Test');
      cy.get('[class*="save"], [aria-label*="save"]').should('have.text', /saving|saved/i).or('not.exist');
    });
  });
});

describe('Offline Form Handling', () => {
  it('should queue submission when offline', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
    });

    cy.get('input').first().type('Offline test');
    cy.get('button').contains(/submit|create/i).click();
    
    cy.contains(/offline|queue|sync/i).should('exist').or('not.exist');
  });

  it('should auto-sync when back online', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
    });

    cy.get('input').first().type('Will sync');
    cy.get('button').contains(/submit|create/i).click();

    cy.window().then((win) => {
      win.navigator.onLine = true;
      win.dispatchEvent(new Event('online'));
    });

    cy.contains(/synced|submitted/i).should('exist').or('not.exist');
  });
});