import React, { Suspense, lazy, memo } from 'react';

/**
 * Code splitting utilities for PHASE 14.2
 * Lazy load components and pages to reduce initial bundle
 */

// Lazy load dashboard pages (~300KB each)
export const DashboardPages = {
  Contact: lazy(() => import('pages/Contact')),
  ContactDetails: lazy(() => import('pages/ContactDetails')),
  Invoicing: lazy(() => import('pages/Invoicing')),
  Payments: lazy(() => import('pages/Payments')),
  Reports: lazy(() => import('pages/Reports')),
  Sales: lazy(() => import('pages/Sales')),
  CashFlow: lazy(() => import('pages/CashFlow')),
  VirtualCounter: lazy(() => import('pages/VirtualCounter')),
};

// Lazy load admin pages
export const AdminPages = {
  SettingsPage: lazy(() => import('pages/SettingsPage')),
  SecurityCenter: lazy(() => import('pages/SecurityCenter')),
  AuditLogs: lazy(() => import('pages/AuditLogs')),
};

// Lazy load dashboard components
export const DashboardComponents = {
  ContactNotesList: lazy(() => import('components/dashboard/ContactNotesList')),
  ContactActivityTimeline: lazy(() => import('components/dashboard/ContactActivityTimeline')),
  ContactAttachments: lazy(() => import('components/dashboard/ContactAttachments')),
  SecurityGatewayMonitor: lazy(() => import('components/dashboard/SecurityGatewayMonitor')),
};

/**
 * Fallback component for lazy-loaded content
 */
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600" />
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Wrapper for lazy-loaded pages with fallback
 */
export function LazyPage({ component: Component, fallback = <LoadingSpinner /> }) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}

/**
 * Memoized component wrapper to prevent unnecessary re-renders
 */
export function memoizeComponent(Component, propsAreEqual) {
  return memo(Component, (prevProps, nextProps) => {
    if (propsAreEqual) {
      return propsAreEqual(prevProps, nextProps);
    }
    
    // Default: compare all props
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    for (const key of prevKeys) {
      if (prevProps[key] !== nextProps[key]) return false;
    }
    
    return true;
  });
}

/**
 * Image lazy loading wrapper
 */
export const LazyImage = memo(({ src, alt, className, width, height }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    width={width}
    height={height}
    loading="lazy"
    decoding="async"
  />
));
LazyImage.displayName = 'LazyImage';

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  static measurePageLoad(pageName) {
    const navigationStart = performance.getEntriesByType('navigation')[0];
    if (!navigationStart) return null;

    return {
      page: pageName,
      fcp: this.getMetric('first-contentful-paint'),
      lcp: this.getMetric('largest-contentful-paint'),
      tti: navigationStart.loadEventEnd - navigationStart.loadEventStart,
      dns: navigationStart.domainLookupEnd - navigationStart.domainLookupStart,
      tcp: navigationStart.connectEnd - navigationStart.connectStart,
      ttfb: navigationStart.responseStart - navigationStart.fetchStart,
    };
  }

  static getMetric(entryName) {
    const entry = performance.getEntriesByName(entryName)[0];
    return entry ? Math.round(entry.startTime) : null;
  }

  static measureComponentRender(componentName, duration) {
    console.log(`⏱️ ${componentName} rendered in ${duration}ms`);
    
    // Report to analytics
    if (window.analytics) {
      window.analytics.track({
        eventName: 'component_render_time',
        properties: { component: componentName, duration },
      });
    }
  }

  static analyzeBundle() {
    const scripts = Array.from(document.querySelectorAll('script'));
    const totalSize = scripts.reduce((sum, script) => {
      return sum + (script.textContent?.length || 0);
    }, 0);

    return {
      scriptCount: scripts.length,
      totalSize: Math.round(totalSize / 1024), // KB
      avgSize: Math.round(totalSize / scripts.length / 1024), // KB
    };
  }
}

/**
 * Hook for performance tracking
 */
export function usePerformanceTracking(componentName) {
  const startTimeRef = React.useRef(Date.now());

  React.useEffect(() => {
    const duration = Date.now() - startTimeRef.current;
    PerformanceMonitor.measureComponentRender(componentName, duration);
  }, [componentName]);
}