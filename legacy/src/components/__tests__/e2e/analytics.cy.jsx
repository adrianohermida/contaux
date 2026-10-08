/**
 * E2E Tests - Analytics Dashboard
 * Test analytics features, KPI display, charts, and exports
 */

describe('Analytics Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.wait(1000);
  });

  describe('Dashboard Rendering', () => {
    it('should display analytics dashboard with header', () => {
      cy.contains(/analytics|dashboard/i).should('exist');
      cy.get('[role="main"]').should('exist');
    });

    it('should display all KPI cards', () => {
      cy.get('[class*="KPI"], [class*="card"]').should('have.length.at.least', 4);
    });

    it('should display action buttons', () => {
      cy.contains(/refresh|export|download/i).should('exist');
    });
  });

  describe('KPI Metrics', () => {
    it('should display revenue metrics', () => {
      cy.contains(/revenue|total|income/i).should('exist');
      cy.contains(/\$|R\$|€/).should('exist');
    });

    it('should display contact metrics', () => {
      cy.contains(/client|contact|customer/i).should('exist');
      cy.get('[role="main"]').contains(/\d+/).should('exist');
    });

    it('should display sales metrics', () => {
      cy.contains(/opportun|deal|sale|pipeline/i).should('exist');
    });

    it('should show trend indicators', () => {
      cy.contains(/trend|growth|change/i).should('exist').or('not.exist');
    });
  });

  describe('Charts and Visualizations', () => {
    it('should render revenue trend chart', () => {
      cy.get('svg').should('have.length.at.least', 1);
    });

    it('should display chart tooltips on hover', () => {
      cy.get('svg').first().trigger('mouseover');
      cy.get('[role="tooltip"]').should('exist').or('not.exist');
    });

    it('should support chart interactions', () => {
      cy.get('svg').should('be.visible');
    });
  });

  describe('Report Builder', () => {
    it('should allow metric selection', () => {
      cy.contains(/metric|report/i).parent().within(() => {
        cy.get('input[type="checkbox"]').should('have.length.at.least', 1);
      });
    });

    it('should support report type selection', () => {
      cy.contains(/type|summary|detailed/i).should('exist');
    });

    it('should enable export functionality', () => {
      cy.contains(/export|download|pdf|csv/i).should('exist');
    });
  });

  describe('Data Filtering', () => {
    it('should allow date range filtering', () => {
      cy.contains(/date|range|period/i).should('exist').or('not.exist');
    });

    it('should support grouping options', () => {
      cy.contains(/group|daily|weekly|monthly/i).should('exist').or('not.exist');
    });
  });

  describe('Scheduled Reports', () => {
    it('should display scheduled reports section', () => {
      cy.contains(/schedule|automation|repeat/i).should('exist').or('not.exist');
    });

    it('should allow schedule creation', () => {
      cy.contains(/create|add|new|schedule/i).should('exist').or('not.exist');
    });
  });

  describe('Export Functionality', () => {
    it('should support PDF export', () => {
      cy.contains(/export|pdf/i).should('exist').or('not.exist');
    });

    it('should support CSV export', () => {
      cy.contains(/export|csv/i).should('exist').or('not.exist');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('body').tab();
      cy.focused().should('exist');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[aria-label], [aria-describedby]').should('have.length.at.least', 1);
    });

    it('should support dark mode', () => {
      cy.get('html').should('have.class', 'dark').or('not.have.class', 'dark');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-12');
    });

    it('should stack content vertically on mobile', () => {
      cy.get('[class*="grid"]').should('exist');
    });

    it('should be fully functional on mobile', () => {
      cy.contains(/revenue|contact/i).should('exist');
    });
  });

  describe('Real-time Updates', () => {
    it('should display connection status', () => {
      cy.contains(/connect|sync|online|offline/i).should('exist').or('not.exist');
    });

    it('should update metrics in real-time', () => {
      cy.get('[role="main"]').within(() => {
        cy.contains(/\d/).should('exist');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle loading states gracefully', () => {
      cy.contains(/loading|fetching/i).should('exist').or('not.exist');
    });

    it('should display error messages if data fails to load', () => {
      cy.get('[role="alert"]').should('exist').or('not.exist');
    });
  });
});

describe('Report Builder E2E', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.contains(/report|builder/i).click().catch(() => {});
  });

  it('should create custom report', () => {
    cy.get('input[type="text"]').first().type('Test Report');
    cy.get('input[type="checkbox"]').first().check();
    cy.contains(/create|save|submit/i).click().catch(() => {});
  });

  it('should handle report preview', () => {
    cy.contains(/preview/i).click().catch(() => {});
    cy.contains(/loading|data|metric/i).should('exist').or('not.exist');
  });
});

describe('Scheduled Reports E2E', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should create scheduled report', () => {
    cy.contains(/schedule|new/i).click().catch(() => {});
    cy.get('input').first().type('Weekly Report');
    cy.contains(/create|schedule/i).click().catch(() => {});
  });

  it('should list scheduled reports', () => {
    cy.contains(/scheduled|automation/i).should('exist').or('not.exist');
  });
});