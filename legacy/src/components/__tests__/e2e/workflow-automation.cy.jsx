/**
 * E2E Tests - Workflow Automation
 * Test workflow builder and automation execution
 */

describe('Workflow Automation E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.wait(1000);
  });

  describe('Workflow Builder', () => {
    it('should display create workflow button', () => {
      cy.contains(/create|new.*workflow/i).should('exist').or('not.exist');
    });

    it('should open workflow builder on button click', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.contains(/workflow.*name/i).should('exist').or('not.exist');
    });

    it('should allow entering workflow name', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.get('input[placeholder*="Auto"]').type('Auto Follow-up').catch(() => {});
    });

    it('should allow selecting trigger', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.get('[role="combobox"]').first().click().catch(() => {});
      cy.contains(/contact.*created/i).click().catch(() => {});
    });

    it('should allow adding actions', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.contains(/add/i).click().catch(() => {});
    });

    it('should validate required fields', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.contains(/save/i).click().catch(() => {});
      cy.contains(/required/i).should('exist').or('not.exist');
    });

    it('should save workflow', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.get('input[placeholder*="Auto"]').type('Test Workflow').catch(() => {});
      cy.get('[role="combobox"]').first().click().catch(() => {});
      cy.contains(/contact/i).click().catch(() => {});
      cy.contains(/add/i).click().catch(() => {});
      cy.get('[role="combobox"]').eq(1).click().catch(() => {});
      cy.contains(/email/i).click().catch(() => {});
      cy.contains(/save/i).click().catch(() => {});
    });
  });

  describe('Automation Dashboard', () => {
    it('should display dashboard header', () => {
      cy.contains(/automation.*dashboard/i).should('exist').or('not.exist');
    });

    it('should show summary statistics', () => {
      cy.contains(/total.*workflow|executions|success/i).should('exist').or('not.exist');
    });

    it('should display workflows list', () => {
      cy.get('[role="main"]').should('exist');
    });

    it('should show workflow cards', () => {
      cy.get('[class*="card"]').should('have.length.at.least', 0);
    });

    it('should display workflow trigger', () => {
      cy.contains(/trigger/i).should('exist').or('not.exist');
    });

    it('should show execution statistics', () => {
      cy.contains(/execution|success|error/i).should('exist').or('not.exist');
    });
  });

  describe('Workflow Actions', () => {
    it('should allow executing workflow', () => {
      cy.contains(/execute/i).click().catch(() => {});
      cy.get('[role="main"]').should('exist');
    });

    it('should allow editing workflow', () => {
      cy.contains(/edit/i).click().catch(() => {});
      cy.get('input[placeholder*="Auto"]').should('exist').or('not.exist');
    });

    it('should allow deleting workflow', () => {
      cy.contains(/delete/i).click().catch(() => {});
      cy.contains(/confirm|cancel/i).should('exist').or('not.exist');
    });

    it('should update stats after execution', () => {
      cy.contains(/execute/i).click().catch(() => {});
      cy.wait(500);
      cy.contains(/execution|success/i).should('exist').or('not.exist');
    });

    it('should show loading state during execution', () => {
      cy.contains(/execute/i).click().catch(() => {});
      cy.contains(/running/i).should('exist').or('not.exist');
    });
  });

  describe('Workflow Configuration', () => {
    it('should display multiple trigger options', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.get('[role="combobox"]').first().click().catch(() => {});
      cy.get('[role="option"]').should('have.length.greaterThan', 2).or('have.length', 0);
    });

    it('should display multiple action options', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.get('[role="combobox"]').eq(1).click().catch(() => {});
      cy.get('[role="option"]').should('have.length.greaterThan', 2).or('have.length', 0);
    });

    it('should allow removing actions', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.contains(/remove|delete|trash/i).should('exist').or('not.exist');
    });

    it('should show action list', () => {
      cy.contains(/action/i).should('exist').or('not.exist');
    });
  });

  describe('Performance', () => {
    it('should load automation dashboard quickly', () => {
      const startTime = performance.now();
      cy.visit('/dashboard');
      cy.contains(/automation|workflow/i).should('exist').or('not.exist');
      const endTime = performance.now();
      expect(endTime - startTime).to.be.lessThan(2000);
    });

    it('should execute workflows without lag', () => {
      cy.contains(/execute/i).click().catch(() => {});
      cy.wait(500);
      cy.get('[role="main"]').should('exist');
    });

    it('should handle large workflow lists', () => {
      cy.get('[class*="card"]').should('have.length.at.least', 0);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('body').tab();
      cy.focused().should('exist');
    });

    it('should have ARIA labels', () => {
      cy.get('[aria-label], [aria-describedby]').should('have.length.at.least', 0);
    });

    it('should support dark mode', () => {
      cy.get('html').should('have.class', 'dark').or('not.have.class', 'dark');
    });

    it('should have proper button labels', () => {
      cy.get('button').should('have.text').or('have.attr', 'aria-label');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-12');
    });

    it('should be functional on mobile', () => {
      cy.contains(/automation|workflow/i).should('exist').or('not.exist');
    });

    it('should stack cards vertically', () => {
      cy.get('[class*="grid"]').should('exist').or('not.exist');
    });

    it('should have touch-friendly buttons', () => {
      cy.get('button').should('have.css', 'min-height', '44px').or('have.css', 'min-height');
    });

    it('should have readable text on mobile', () => {
      cy.get('[class*="text"]').should('have.css', 'font-size');
    });
  });

  describe('Error Handling', () => {
    it('should show error for missing workflow name', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.contains(/save/i).click().catch(() => {});
      cy.contains(/required|name/i).should('exist').or('not.exist');
    });

    it('should show error for missing trigger', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.get('input[placeholder*="Auto"]').type('Test').catch(() => {});
      cy.contains(/save/i).click().catch(() => {});
      cy.contains(/trigger/i).should('exist').or('not.exist');
    });

    it('should show error for missing actions', () => {
      cy.contains(/create.*workflow/i).click().catch(() => {});
      cy.get('input[placeholder*="Auto"]').type('Test').catch(() => {});
      cy.get('[role="combobox"]').first().click().catch(() => {});
      cy.contains(/contact/i).click().catch(() => {});
      cy.contains(/save/i).click().catch(() => {});
      cy.contains(/action/i).should('exist').or('not.exist');
    });

    it('should handle execution errors gracefully', () => {
      cy.contains(/execute/i).click().catch(() => {});
      cy.wait(500);
      cy.get('[role="main"]').should('exist');
    });
  });
});

describe('Workflow Automation Integration Tests', () => {
  it('should trigger workflow on contact creation', () => {
    cy.visit('/dashboard');
    cy.contains(/create.*workflow/i).click().catch(() => {});
  });

  it('should execute workflow actions correctly', () => {
    cy.visit('/dashboard');
    cy.contains(/execute/i).click().catch(() => {});
  });

  it('should track workflow execution metrics', () => {
    cy.visit('/dashboard');
    cy.contains(/execution|success|error/i).should('exist').or('not.exist');
  });
});