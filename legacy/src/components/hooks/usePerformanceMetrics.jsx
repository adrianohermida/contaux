/**
 * usePerformanceMetrics Hook
 * Track page performance metrics and send to analytics
 */

import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export function usePerformanceMetrics(pageName) {
  const metricsRef = useRef({
    pageLoadTime: 0,
    dataFetchTime: 0,
    renderTime: 0,
    memoryUsed: 0,
  });

  useEffect(() => {
    // Measure page load
    const navigationStart = performance.timing.navigationStart;
    const navigationEnd = performance.timing.loadEventEnd;
    metricsRef.current.pageLoadTime = navigationEnd - navigationStart;

    // Measure memory
    if (performance.memory) {
      metricsRef.current.memoryUsed = performance.memory.usedJSHeapSize;
    }

    // Measure First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metricsRef.current.renderTime = entry.startTime;
        }
      }
    });

    observer.observe({ entryTypes: ['paint', 'measure'] });

    // Send metrics after load
    const timeout = setTimeout(() => {
      sendMetrics();
      observer.disconnect();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [pageName]);

  const sendMetrics = async () => {
    try {
      await base44.analytics.track({
        eventName: 'page_performance',
        properties: {
          page: pageName,
          loadTime: Math.round(metricsRef.current.pageLoadTime),
          renderTime: Math.round(metricsRef.current.renderTime),
          memoryUsed: Math.round(metricsRef.current.memoryUsed / 1024 / 1024), // MB
        },
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  };

  return {
    metrics: metricsRef.current,
    sendMetrics,
  };
}

export default usePerformanceMetrics;