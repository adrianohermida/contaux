/**
 * Web Vitals Monitor
 * Tracks LCP, FID, CLS, TTFB for performance monitoring
 * Integrated with dashboard for real-time metrics
 */

import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, fair: 4000 },      // Largest Contentful Paint (ms)
  FID: { good: 100, fair: 300 },        // First Input Delay (ms)
  CLS: { good: 0.1, fair: 0.25 },       // Cumulative Layout Shift
  TTFB: { good: 600, fair: 1800 },      // Time to First Byte (ms)
  INP: { good: 200, fair: 500 },        // Interaction to Next Paint (ms)
};

const VITALS_STORE = [];

/**
 * Hook para monitorar Web Vitals
 */
export function useWebVitals() {
  const [metrics, setMetrics] = useState({
    LCP: null,
    FID: null,
    CLS: null,
    TTFB: null,
    INP: null,
  });

  const getVitalStatus = useCallback((metric, value) => {
    const threshold = WEB_VITALS_THRESHOLDS[metric];
    if (!threshold) return 'unknown';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.fair) return 'fair';
    return 'poor';
  }, []);

  useEffect(() => {
    // Observe LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcpValue = lastEntry.renderTime || lastEntry.loadTime;
      
      setMetrics(prev => ({
        ...prev,
        LCP: lcpValue,
      }));

      VITALS_STORE.push({
        metric: 'LCP',
        value: lcpValue,
        timestamp: new Date().toISOString(),
        status: getVitalStatus('LCP', lcpValue),
      });
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP not supported
    }

    // Observe CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      setMetrics(prev => ({
        ...prev,
        CLS: clsValue,
      }));

      VITALS_STORE.push({
        metric: 'CLS',
        value: clsValue,
        timestamp: new Date().toISOString(),
        status: getVitalStatus('CLS', clsValue),
      });
    });

    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // CLS not supported
    }

    // Observe INP (Interaction to Next Paint)
    const inpObserver = new PerformanceObserver((list) => {
      let worst = 0;
      list.getEntries().forEach(entry => {
        worst = Math.max(worst, entry.duration);
      });

      setMetrics(prev => ({
        ...prev,
        INP: worst,
      }));

      VITALS_STORE.push({
        metric: 'INP',
        value: worst,
        timestamp: new Date().toISOString(),
        status: getVitalStatus('INP', worst),
      });
    });

    try {
      inpObserver.observe({ type: 'interaction', buffered: true });
    } catch (e) {
      // INP not supported
    }

    // Get TTFB (Time to First Byte)
    if (window.performance && window.performance.timing) {
      const ttfb = window.performance.timing.responseStart - window.performance.timing.fetchStart;
      setMetrics(prev => ({
        ...prev,
        TTFB: ttfb,
      }));

      VITALS_STORE.push({
        metric: 'TTFB',
        value: ttfb,
        timestamp: new Date().toISOString(),
        status: getVitalStatus('TTFB', ttfb),
      });
    }

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      inpObserver.disconnect();
    };
  }, [getVitalStatus]);

  const getMetricsReport = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        LCP: { value: metrics.LCP, status: metrics.LCP ? getVitalStatus('LCP', metrics.LCP) : null },
        FID: { value: metrics.FID, status: metrics.FID ? getVitalStatus('FID', metrics.FID) : null },
        CLS: { value: metrics.CLS, status: metrics.CLS ? getVitalStatus('CLS', metrics.CLS) : null },
        TTFB: { value: metrics.TTFB, status: metrics.TTFB ? getVitalStatus('TTFB', metrics.TTFB) : null },
        INP: { value: metrics.INP, status: metrics.INP ? getVitalStatus('INP', metrics.INP) : null },
      },
      history: VITALS_STORE.slice(-50), // Last 50 entries
    };
  }, [metrics, getVitalStatus]);

  const sendMetricsToServer = useCallback(async (workspaceId) => {
    try {
      const report = getMetricsReport();
      await base44.analytics.track({
        eventName: 'web_vitals_snapshot',
        properties: {
          workspace_id: workspaceId,
          ...report.metrics,
        },
      });
    } catch (error) {
      console.error('Failed to send web vitals:', error);
    }
  }, [getMetricsReport]);

  return {
    metrics,
    getVitalStatus,
    getMetricsReport,
    sendMetricsToServer,
    VITALS_STORE,
  };
}

export default useWebVitals;