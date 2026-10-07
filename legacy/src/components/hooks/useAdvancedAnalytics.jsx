/**
 * useAdvancedAnalytics Hook
 * Advanced analytics and metrics calculation
 */

import { useState, useCallback, useEffect } from 'react';

export function useAdvancedAnalytics() {
  const [metrics, setMetrics] = useState({
    pageViews: 0,
    uniqueUsers: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    conversionRate: 0,
  });

  const [reportData, setReportData] = useState([]);
  const [customMetrics, setCustomMetrics] = useState(new Map());

  // Calculate aggregate metrics
  const calculateAggregateMetrics = useCallback((data) => {
    if (!data || data.length === 0) return metrics;

    const aggregated = {
      pageViews: data.reduce((sum, d) => sum + (d.pageViews || 0), 0),
      uniqueUsers: new Set(data.map((d) => d.userId)).size,
      bounceRate: (
        data.filter((d) => d.sessions === 1).length / data.length
      ) * 100,
      avgSessionDuration:
        data.reduce((sum, d) => sum + (d.sessionDuration || 0), 0) / data.length,
      conversionRate: (
        data.filter((d) => d.converted).length / data.length
      ) * 100,
    };

    setMetrics(aggregated);
    return aggregated;
  }, [metrics]);

  // Create custom metric
  const createCustomMetric = useCallback((name, formula) => {
    setCustomMetrics((prev) => {
      const newMetrics = new Map(prev);
      newMetrics.set(name, { formula, createdAt: Date.now() });
      return newMetrics;
    });
  }, []);

  // Calculate custom metric
  const calculateCustomMetric = useCallback((name, data) => {
    const metric = customMetrics.get(name);
    if (!metric) return null;

    try {
      // Simple formula evaluation (should be sandboxed in production)
      const result = metric.formula(data);
      return result;
    } catch (error) {
      console.error(`Error calculating metric ${name}:`, error);
      return null;
    }
  }, [customMetrics]);

  // Build report
  const buildReport = useCallback((data, options = {}) => {
    const {
      groupBy = 'day',
      includeMetrics = ['pageViews', 'uniqueUsers', 'bounceRate'],
      filters = {},
    } = options;

    // Filter data
    let filtered = data;
    Object.entries(filters).forEach(([key, value]) => {
      filtered = filtered.filter((item) => item[key] === value);
    });

    // Group data
    const grouped = {};
    filtered.forEach((item) => {
      const key = item[groupBy] || 'total';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    // Calculate metrics for each group
    const report = Object.entries(grouped).map(([period, items]) => {
      const result = { period };
      includeMetrics.forEach((metric) => {
        switch (metric) {
          case 'pageViews':
            result.pageViews = items.reduce((sum, i) => sum + (i.pageViews || 0), 0);
            break;
          case 'uniqueUsers':
            result.uniqueUsers = new Set(items.map((i) => i.userId)).size;
            break;
          case 'bounceRate':
            result.bounceRate =
              (items.filter((i) => i.sessions === 1).length / items.length) * 100;
            break;
          case 'avgSessionDuration':
            result.avgSessionDuration =
              items.reduce((sum, i) => sum + (i.sessionDuration || 0), 0) /
              items.length;
            break;
          case 'conversionRate':
            result.conversionRate =
              (items.filter((i) => i.converted).length / items.length) * 100;
            break;
          default:
            break;
        }
      });
      return result;
    });

    setReportData(report);
    return report;
  }, []);

  // Export report
  const exportReport = useCallback((format = 'csv') => {
    if (format === 'csv') {
      const headers = Object.keys(reportData[0] || {});
      const csv = [
        headers.join(','),
        ...reportData.map((row) =>
          headers.map((h) => {
            const value = row[h];
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value;
          }).join(',')
        ),
      ].join('\n');
      return csv;
    }

    if (format === 'json') {
      return JSON.stringify(reportData, null, 2);
    }

    return null;
  }, [reportData]);

  // Compare periods
  const comparePeriods = useCallback((period1, period2) => {
    const p1 = reportData.find((r) => r.period === period1);
    const p2 = reportData.find((r) => r.period === period2);

    if (!p1 || !p2) return null;

    const comparison = {};
    Object.keys(p1).forEach((key) => {
      if (key !== 'period' && typeof p1[key] === 'number') {
        comparison[key] = {
          period1: p1[key],
          period2: p2[key],
          change: p2[key] - p1[key],
          changePercent: ((p2[key] - p1[key]) / p1[key]) * 100,
        };
      }
    });

    return comparison;
  }, [reportData]);

  // Trend analysis
  const analyzeTrend = useCallback((metric) => {
    if (reportData.length < 2) return null;

    const values = reportData.map((r) => r[metric]).filter((v) => v !== undefined);
    if (values.length < 2) return null;

    const avg = values.reduce((a, b) => a + b) / values.length;
    const trend = values[values.length - 1] - values[0];
    const direction = trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable';

    return {
      metric,
      average: avg,
      trend,
      direction,
      changePercent: (trend / values[0]) * 100,
    };
  }, [reportData]);

  // Get metrics summary
  const getMetricsSummary = useCallback(() => {
    return {
      ...metrics,
      customMetricsCount: customMetrics.size,
      reportDataPoints: reportData.length,
    };
  }, [metrics, customMetrics, reportData]);

  return {
    metrics,
    reportData,
    customMetrics,
    calculateAggregateMetrics,
    createCustomMetric,
    calculateCustomMetric,
    buildReport,
    exportReport,
    comparePeriods,
    analyzeTrend,
    getMetricsSummary,
  };
}

export default useAdvancedAnalytics;