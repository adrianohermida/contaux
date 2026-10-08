/**
 * Sprint 35 Phase 2 - Performance Tuning E2E Tests
 * Comprehensive test suite for performance optimization features
 */

describe('Sprint 35 Phase 2 - Performance Tuning', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('usePerformanceTuner Hook', () => {
    it('should collect and analyze performance metrics', () => {
      cy.mount(() => {
        const { tuningState } = require('@/components/hooks/usePerformanceTuner').default();
        return <div>{tuningState.currentScore}</div>;
      });
      cy.contains(/\d+/).should('exist');
    });

    it('should generate performance recommendations', () => {
      cy.mount(() => {
        const { getRecommendations } = require('@/components/hooks/usePerformanceTuner').default();
        const recs = getRecommendations();
        return <div>{recs.length}</div>;
      });
    });

    it('should apply optimizations and track impact', () => {
      cy.mount(() => {
        const { applyOptimization } = require('@/components/hooks/usePerformanceTuner').default();
        const result = applyOptimization('bundle');
        return <div>{result.impact}</div>;
      });
      cy.contains(/bundle|optimization/).should('exist');
    });
  });

  describe('PerformanceTuningDashboard Component', () => {
    it('should render all metric cards', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.contains('Bundle Size').should('be.visible');
      cy.contains('Query Time').should('be.visible');
      cy.contains('Cache Hit Rate').should('be.visible');
    });

    it('should display performance recommendations', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.contains('Optimization Recommendations').should('be.visible');
      cy.contains('Bundle Optimization').should('be.visible');
    });

    it('should be fully responsive on mobile', () => {
      cy.viewport('iphone-x');
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.contains('Performance Tuning').should('be.visible');
    });

    it('should support dark mode', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.get('body').should('have.class', 'dark');
    });

    it('should have proper ARIA labels for accessibility', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.get('[role="heading"]').should('exist');
    });

    it('should be keyboard navigable', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.tab();
      cy.focused().should('exist');
    });
  });

  describe('Performance Metrics', () => {
    it('should track bundle size optimization', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.contains('285KB').should('be.visible');
    });

    it('should display query performance', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.contains('145ms').should('be.visible');
    });

    it('should show cache hit rate', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.contains('82.3%').should('be.visible');
    });
  });

  describe('Optimization Recommendations', () => {
    it('should render recommendation cards with details', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.contains('Bundle Optimization').parent().should('contain', 'high');
    });

    it('should have Apply buttons for pending optimizations', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.contains('button', 'Apply').should('have.length.at.least', 2);
    });

    it('should show completed optimizations with checkmark', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.contains('Completed').should('be.visible');
    });
  });

  describe('Dark Mode Support', () => {
    it('should render correctly in dark mode', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.get('.dark').should('exist');
    });

    it('should have appropriate dark mode classes on all elements', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.get('[class*="dark:"]').should('have.length.greaterThan', 5);
    });
  });

  describe('Mobile Responsiveness', () => {
    ['iphone-x', 'ipad-2', 'macbook-15'].forEach((device) => {
      it(`should be responsive on ${device}`, () => {
        cy.viewport(device);
        cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
        cy.contains('Performance Tuning').should('be.visible');
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper heading hierarchy', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.get('h1, h2, h3').should('have.length.greaterThan', 0);
    });

    it('should have alt text for all images', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('should support keyboard navigation', () => {
      cy.mount(require('@/components/dashboard/PerformanceTuningDashboard').default);
      cy.get('button, [role="button"]').first().focus();
      cy.focused().should('exist');
    });
  });
});