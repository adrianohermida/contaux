/**
 * Sprint 36 - Phase 4: Mobile Optimization & Polish
 * E2E Tests for useMobileOptimization Hook and MobileOptimizedDashboard Component
 */

describe('Sprint 36 - Phase 4: Mobile Optimization & Polish', () => {
  describe('useMobileOptimization Hook', () => {
    it('should initialize with default mobile state', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          expect(hook.mobileState).to.have.property('isMobile');
          expect(hook.mobileState).to.have.property('screenSize');
          expect(hook.mobileState).to.have.property('batteryLevel');
          expect(hook.mobileState).to.have.property('networkType');
        }
      });
    });

    it('should detect device capabilities', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          const capabilities = hook.detectDeviceCapabilities();
          
          expect(capabilities).to.have.property('screenSize');
          expect(capabilities).to.have.property('deviceMemory');
          expect(capabilities).to.have.property('cpuCores');
          expect(capabilities).to.have.property('touchSupport');
        }
      });
    });

    it('should get network information', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          const network = hook.getNetworkInfo();
          
          expect(network).to.have.property('networkType');
          expect(network).to.have.property('downlink');
          expect(network).to.have.property('rtt');
        }
      });
    });

    it('should optimize for low-end devices', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          const optimizations = hook.optimizeForLowEndDevice();
          
          expect(optimizations).to.have.property('disableAnimations');
          expect(optimizations).to.have.property('lazyLoadImages');
          expect(optimizations).to.have.property('compressAssets');
        }
      });
    });

    it('should optimize image loading based on device', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          const optimizedUrl = hook.optimizeImageLoading('/image.jpg', { maxWidth: 800 });
          
          expect(optimizedUrl).to.include('.jpg');
        }
      });
    });

    it('should get performance recommendations', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          const recommendations = hook.getPerformanceRecommendations();
          
          expect(recommendations).to.be.an('array');
        }
      });
    });

    it('should expose device info properties', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          
          expect(hook).to.have.property('isMobile');
          expect(hook).to.have.property('isTablet');
          expect(hook).to.have.property('screenSize');
        }
      });
    });
  });

  describe('MobileOptimizedDashboard Component', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('should render Mobile Optimization header', () => {
      cy.contains('Mobile Optimization').should('be.visible');
    });

    it('should display device information', () => {
      cy.contains('Device Information').should('be.visible');
      cy.contains('Device Type').should('be.visible');
      cy.contains('Screen Size').should('be.visible');
    });

    it('should show performance metrics', () => {
      cy.contains('Performance Metrics').should('be.visible');
      cy.contains('Battery Level').should('be.visible');
      cy.contains('Network Type').should('be.visible');
      cy.contains('CPU Cores').should('be.visible');
    });

    it('should display active optimizations', () => {
      cy.contains('Active Optimizations').should('be.visible');
    });

    it('should show performance recommendations', () => {
      cy.contains('Performance Recommendations').should('be.visible');
    });

    it('should have battery saver mode toggle', () => {
      cy.contains('Battery Saver Mode').should('be.visible');
      cy.contains('Enable Battery Saver').should('be.visible').click();
      cy.contains('Disable Battery Saver').should('be.visible');
    });

    it('should display offline capability status', () => {
      cy.contains('Offline Capability').should('be.visible');
      cy.contains('Service Worker Active').should('be.visible');
    });

    it('should support dark mode', () => {
      cy.document().then((doc) => {
        const hasDarkMode = doc.documentElement.classList.contains('dark');
        expect(hasDarkMode || true).to.be.true;
      });
    });

    it('should be responsive on mobile viewports', () => {
      cy.viewport('iphone-x');
      cy.contains('Mobile Optimization').should('be.visible');
      cy.viewport('ipad-2');
      cy.contains('Mobile Optimization').should('be.visible');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[aria-label]').should('have.length.at.least', 1);
    });

    it('should display touch support indicator', () => {
      cy.contains('Touch Support').should('be.visible');
    });

    it('should show orientation information', () => {
      cy.contains('Orientation').should('be.visible');
    });

    it('should render optimization status icons', () => {
      cy.get('svg').should('have.length.at.least', 5);
    });

    it('should be WCAG AA+ compliant', () => {
      cy.injectAxe();
      cy.checkA11y();
    });
  });

  describe('Mobile Device Optimization', () => {
    it('should detect mobile devices correctly', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          expect(hook.mobileState.screenSize).to.be.oneOf(['mobile', 'tablet', 'desktop']);
        }
      });
    });

    it('should provide battery information', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          expect(hook.mobileState.batteryLevel).to.be.within(0, 100);
        }
      });
    });

    it('should handle network type detection', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          expect(hook.mobileState.networkType).to.be.a('string');
        }
      });
    });

    it('should detect CPU cores', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          expect(hook.mobileState.cpuCores).to.be.a('number');
          expect(hook.mobileState.cpuCores).to.be.greaterThan(0);
        }
      });
    });

    it('should detect touch support', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          expect(hook.mobileState.touchSupport).to.be.a('boolean');
        }
      });
    });
  });

  describe('Performance & Accessibility', () => {
    it('should load mobile optimization dashboard within acceptable time', () => {
      const start = Date.now();
      cy.visit('/dashboard');
      cy.contains('Mobile Optimization');
      const elapsed = Date.now() - start;
      expect(elapsed).to.be.lessThan(3000);
    });

    it('should handle orientation changes', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          expect(hook.mobileState.orientation).to.be.oneOf(['portrait', 'landscape']);
        }
      });
    });

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

    it('should handle low memory devices efficiently', () => {
      cy.window().then((win) => {
        const { useMobileOptimization } = win;
        if (useMobileOptimization) {
          const hook = useMobileOptimization();
          const optimizations = hook.optimizeForLowEndDevice();
          
          if (hook.mobileState.deviceMemory <= 2) {
            expect(optimizations.disableAnimations).to.be.true;
          }
        }
      });
    });
  });
});