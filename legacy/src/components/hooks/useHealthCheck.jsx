/**
 * useHealthCheck Hook
 * Application health monitoring and status tracking
 */

import { useState, useCallback, useEffect } from 'react';

export function useHealthCheck() {
  const [healthStatus, setHealthStatus] = useState({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
  });
  const [uptime, setUptime] = useState(100);
  const [responseTime, setResponseTime] = useState(0);
  const [history, setHistory] = useState([]);

  // Check API health
  const checkAPIHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const response = await fetch('/api/health');
      const time = performance.now() - start;
      setResponseTime(time);
      return {
        status: response.ok ? 'healthy' : 'degraded',
        responseTime: time,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: performance.now() - start,
      };
    }
  }, []);

  // Check database health
  const checkDatabaseHealth = useCallback(async () => {
    try {
      // Simulated database check
      const start = performance.now();
      await new Promise((resolve) => setTimeout(resolve, 50));
      return {
        status: 'healthy',
        responseTime: performance.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }, []);

  // Check service dependencies
  const checkDependencies = useCallback(async () => {
    const dependencies = {
      database: 'healthy',
      cache: 'healthy',
      externalAPIs: 'healthy',
    };

    try {
      // Simulate dependency checks
      return Object.entries(dependencies).reduce(
        (acc, [dep, status]) => {
          acc[dep] = { status, lastChecked: new Date().toISOString() };
          return acc;
        },
        {}
      );
    } catch (error) {
      return { error: error.message };
    }
  }, []);

  // Check memory usage
  const checkMemory = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const mem = performance.memory;
      return {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
        percentUsed: (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  }, []);

  // Perform full health check
  const performHealthCheck = useCallback(async () => {
    const apiHealth = await checkAPIHealth();
    const dbHealth = await checkDatabaseHealth();
    const deps = await checkDependencies();
    const memory = checkMemory();

    const overallStatus =
      apiHealth.status === 'healthy' && dbHealth.status === 'healthy' ? 'healthy' : 'degraded';

    const check = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        api: apiHealth,
        database: dbHealth,
        dependencies: deps,
        memory,
      },
    };

    setHealthStatus(check);
    setHistory((prev) => [...prev.slice(-99), check]); // Keep last 100 checks

    return check;
  }, [checkAPIHealth, checkDatabaseHealth, checkDependencies, checkMemory]);

  // Calculate uptime
  const calculateUptime = useCallback(() => {
    if (history.length === 0) return 100;

    const healthyChecks = history.filter((check) => check.status === 'healthy').length;
    const uptimePercent = (healthyChecks / history.length) * 100;

    setUptime(uptimePercent);
    return uptimePercent;
  }, [history]);

  // Get health status
  const getHealthStatus = useCallback(() => {
    return {
      ...healthStatus,
      uptime,
      responseTime,
    };
  }, [healthStatus, uptime, responseTime]);

  // Get health history
  const getHealthHistory = useCallback(() => {
    return history;
  }, [history]);

  // Auto-check on interval
  useEffect(() => {
    performHealthCheck();
    const interval = setInterval(() => {
      performHealthCheck();
      calculateUptime();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [performHealthCheck, calculateUptime]);

  return {
    healthStatus,
    uptime,
    responseTime,
    history,
    performHealthCheck,
    checkAPIHealth,
    checkDatabaseHealth,
    checkDependencies,
    checkMemory,
    getHealthStatus,
    getHealthHistory,
    calculateUptime,
  };
}

export default useHealthCheck;