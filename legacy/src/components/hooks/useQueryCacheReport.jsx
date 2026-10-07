/**
 * Query Cache Report Hook
 * Provides detailed analytics about cache performance and query usage
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';

export function useQueryCacheReport() {
  const queryClient = useQueryClient();
  const [cacheReport, setCacheReport] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Generate detailed cache report
  const generateReport = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const allQueries = cache.getAll();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalQueries: allQueries.length,
        activeQueries: allQueries.filter(q => q.getObserversCount() > 0).length,
        stalQueries: allQueries.filter(q => q.isStale()).length,
        invalidatingQueries: allQueries.filter(q => q.state.fetchStatus === 'fetching').length,
      },
      queries: allQueries.map(q => ({
        key: JSON.stringify(q.queryKey),
        status: q.state.status,
        fetchStatus: q.state.fetchStatus,
        dataUpdatedAt: new Date(q.state.dataUpdatedAt).toLocaleString('pt-BR'),
        observers: q.getObserversCount(),
        isStale: q.isStale(),
        hasData: !!q.state.data,
      })),
      cacheMetrics: {
        estimatedSize: allQueries.reduce((sum, q) => {
          const size = new Blob([JSON.stringify(q.state.data)]).size;
          return sum + size;
        }, 0),
        averageDataAge: allQueries.length > 0 
          ? (Date.now() - allQueries.reduce((sum, q) => sum + q.state.dataUpdatedAt, 0) / allQueries.length) / 1000
          : 0,
      },
    };

    return report;
  }, [queryClient]);

  // Start monitoring cache
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    const interval = setInterval(() => {
      setCacheReport(generateReport());
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [generateReport]);

  // Get cache hit rate
  const getCacheHitRate = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const allQueries = cache.getAll();
    
    const successQueries = allQueries.filter(q => q.state.status === 'success').length;
    const totalQueries = allQueries.length;

    return totalQueries > 0 ? (successQueries / totalQueries) * 100 : 0;
  }, [queryClient]);

  // Get queries by type
  const getQueriesByType = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const allQueries = cache.getAll();

    const byType = {};
    allQueries.forEach(q => {
      const type = q.queryKey[0] || 'unknown';
      if (!byType[type]) {
        byType[type] = { count: 0, stale: 0, active: 0 };
      }
      byType[type].count++;
      if (q.isStale()) byType[type].stale++;
      if (q.getObserversCount() > 0) byType[type].active++;
    });

    return byType;
  }, [queryClient]);

  // Get slowest queries (most stale)
  const getSlowestQueries = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const allQueries = cache.getAll();

    return allQueries
      .map(q => ({
        key: JSON.stringify(q.queryKey),
        age: Date.now() - q.state.dataUpdatedAt,
        isStale: q.isStale(),
      }))
      .sort((a, b) => b.age - a.age)
      .slice(0, 10);
  }, [queryClient]);

  // Manual report generation
  const getReport = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      cacheHitRate: getCacheHitRate(),
      queriesByType: getQueriesByType(),
      slowestQueries: getSlowestQueries(),
      detailed: generateReport(),
    };
  }, [getCacheHitRate, getQueriesByType, getSlowestQueries, generateReport]);

  return {
    cacheReport,
    generateReport,
    startMonitoring,
    isMonitoring,
    getCacheHitRate,
    getQueriesByType,
    getSlowestQueries,
    getReport,
  };
}

export default useQueryCacheReport;