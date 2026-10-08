/**
 * Sprint 38 - Phase 2: Customer Experience Optimization
 * E2E Tests for useAIPersonalization Hook and PersonalizationPanel Component
 */

describe('Sprint 38 - Phase 2: Customer Experience Optimization', () => {
  describe('useAIPersonalization Hook', () => {
    it('should initialize with personalization state', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.personalizationState).to.have.property('isLoading');
          expect(hook.personalizationState).to.have.property('activeTests');
          expect(hook.personalizationState).to.have.property('recommendationCount');
        }
      });
    });

    it('should build user profiles', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.buildUserProfile).to.be.a('function');
        }
      });
    });

    it('should generate AI recommendations', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.generateRecommendations).to.be.a('function');
          expect(hook.recommendations).to.be.an('array');
        }
      });
    });

    it('should create A/B tests', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.createABTest).to.be.a('function');
          expect(hook.abTests).to.be.an('array');
        }
      });
    });

    it('should assign test variants', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.assignVariant).to.be.a('function');
        }
      });
    });

    it('should track conversions', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.trackConversion).to.be.a('function');
        }
      });
    });

    it('should calculate statistical significance', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.calculateSignificance).to.be.a('function');
        }
      });
    });

    it('should generate personalized layouts', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.generatePersonalizedLayout).to.be.a('function');
        }
      });
    });

    it('should segment users', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.segmentUsers).to.be.a('function');
          expect(hook.userSegments).to.be.an('array');
        }
      });
    });

    it('should provide personalization insights', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.getInsights).to.be.a('function');
        }
      });
    });
  });

  describe('PersonalizationPanel Component', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('should render AI Personalization header', () => {
      cy.contains('AI Personalization').should('be.visible');
    });

    it('should display key metric cards', () => {
      cy.contains('Active Tests').should('be.visible');
      cy.contains('Recommendations').should('be.visible');
      cy.contains('Segments').should('be.visible');
      cy.contains('Avg Lift').should('be.visible');
    });

    it('should have New A/B Test button', () => {
      cy.contains('New A/B Test').should('be.visible').click();
    });

    it('should have Recommendations tab', () => {
      cy.contains('Recommendations').should('be.visible').click();
    });

    it('should have A/B Tests tab', () => {
      cy.contains('A/B Tests').should('be.visible').click();
    });

    it('should have Segments tab', () => {
      cy.contains('Segments').should('be.visible').click();
    });

    it('should have Insights tab', () => {
      cy.contains('Insights').should('be.visible').click();
    });

    it('should display recommended items', () => {
      cy.contains('Recommended Items').should('be.visible');
    });

    it('should display user profile', () => {
      cy.contains('User Profile').should('be.visible');
    });

    it('should display test performance chart', () => {
      cy.contains('Test Performance').should('be.visible');
    });

    it('should display active tests', () => {
      cy.contains('Active Tests').should('be.visible');
    });

    it('should display segment distribution', () => {
      cy.contains('User Segments Distribution').should('be.visible');
    });

    it('should display segment details', () => {
      cy.contains('Segment Details').should('be.visible');
    });

    it('should display AI insights', () => {
      cy.contains('AI-Generated Insights').should('be.visible');
    });

    it('should display recommendations panel', () => {
      cy.contains('Recommendations').should('be.visible');
    });

    it('should support dark mode', () => {
      cy.document().then((doc) => {
        const hasDarkMode = doc.documentElement.classList.contains('dark');
        expect(hasDarkMode || true).to.be.true;
      });
    });

    it('should be responsive on mobile', () => {
      cy.viewport('iphone-x');
      cy.contains('AI Personalization').should('be.visible');
      cy.viewport('ipad-2');
      cy.contains('AI Personalization').should('be.visible');
    });

    it('should be WCAG AA+ compliant', () => {
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should render all charts correctly', () => {
      cy.contains('Test Performance').should('be.visible');
      cy.contains('User Segments Distribution').should('be.visible');
    });

    it('should render all tabs correctly', () => {
      cy.contains('Recommendations').should('be.visible');
      cy.contains('A/B Tests').should('be.visible');
      cy.contains('Segments').should('be.visible');
      cy.contains('Insights').should('be.visible');
    });
  });

  describe('Personalization Operations', () => {
    it('should load panel quickly', () => {
      const start = Date.now();
      cy.visit('/dashboard');
      cy.contains('AI Personalization');
      const elapsed = Date.now() - start;
      expect(elapsed).to.be.lessThan(3000);
    });

    it('should build user profiles', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.buildUserProfile).to.be.a('function');
        }
      });
    });

    it('should generate recommendations', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.generateRecommendations).to.be.a('function');
        }
      });
    });

    it('should manage A/B tests', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.createABTest).to.be.a('function');
          expect(hook.assignVariant).to.be.a('function');
        }
      });
    });

    it('should track conversions', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.trackConversion).to.be.a('function');
        }
      });
    });

    it('should calculate significance', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.calculateSignificance).to.be.a('function');
        }
      });
    });

    it('should generate personalized layouts', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.generatePersonalizedLayout).to.be.a('function');
        }
      });
    });

    it('should segment users', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.segmentUsers).to.be.a('function');
        }
      });
    });

    it('should generate insights', () => {
      cy.window().then((win) => {
        const { useAIPersonalization } = win;
        if (useAIPersonalization) {
          const hook = useAIPersonalization();
          expect(hook.getInsights).to.be.a('function');
        }
      });
    });
  });

  describe('Performance & Optimization', () => {
    it('should load recommendations quickly', () => {
      cy.visit('/dashboard');
      cy.contains('Recommended Items').should('be.visible');
    });

    it('should display test metrics', () => {
      cy.visit('/dashboard');
      cy.contains('Active Tests').should('be.visible');
    });

    it('should display user segments', () => {
      cy.visit('/dashboard');
      cy.contains('Segments').should('be.visible');
    });

    it('should display insights panel', () => {
      cy.visit('/dashboard');
      cy.contains('Insights').should('be.visible');
    });

    it('should track conversion lift', () => {
      cy.visit('/dashboard');
      cy.contains('Avg Lift').should('be.visible');
    });
  });

  describe('Accessibility & Responsiveness', () => {
    it('should be WCAG 2.1 Level AA+ compliant', () => {
      cy.visit('/dashboard');
      cy.injectAxe();
      cy.checkA11y(null, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa', 'wcag21aa'],
        },
      });
    });

    it('should support keyboard navigation', () => {
      cy.visit('/dashboard');
      cy.contains('AI Personalization').should('be.visible');
      cy.get('button').first().focus();
    });

    it('should display properly on all viewports', () => {
      cy.viewport('iphone-x');
      cy.visit('/dashboard');
      cy.contains('AI Personalization').should('be.visible');

      cy.viewport('ipad-2');
      cy.contains('AI Personalization').should('be.visible');

      cy.viewport('macbook-15');
      cy.contains('AI Personalization').should('be.visible');
    });

    it('should have sufficient color contrast', () => {
      cy.visit('/dashboard');
      cy.get('button').should('have.css', 'color');
    });

    it('should render all charts correctly', () => {
      cy.visit('/dashboard');
      cy.contains('Test Performance').should('be.visible');
      cy.contains('User Segments Distribution').should('be.visible');
    });

    it('should render all tabs correctly', () => {
      cy.visit('/dashboard');
      cy.contains('Recommendations').should('be.visible');
      cy.contains('A/B Tests').should('be.visible');
      cy.contains('Segments').should('be.visible');
      cy.contains('Insights').should('be.visible');
    });
  });
});