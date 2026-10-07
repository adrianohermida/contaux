/**
 * useErrorTracking Hook
 * Error tracking and event logging
 */

import { useState, useCallback, useEffect } from 'react';

export function useErrorTracking() {
  const [errors, setErrors] = useState([]);
  const [errorStats, setErrorStats] = useState({
    total: 0,
    byType: {},
    byLevel: {},
  });
  const [lastError, setLastError] = useState(null);

  // Track error
  const trackError = useCallback(
    (error, context = {}) => {
      const errorEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: error.message || String(error),
        type: error.name || 'Error',
        level: context.level || 'error',
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        context,
        stack: error.stack,
      };

      setErrors((prev) => [...prev.slice(-499), errorEntry]); // Keep last 500 errors
      setLastError(errorEntry);

      // Update stats
      setErrorStats((prev) => ({
        total: prev.total + 1,
        byType: {
          ...prev.byType,
          [errorEntry.type]: (prev.byType[errorEntry.type] || 0) + 1,
        },
        byLevel: {
          ...prev.byLevel,
          [errorEntry.level]: (prev.byLevel[errorEntry.level] || 0) + 1,
        },
      }));

      // Send to error tracking service
      if (typeof window !== 'undefined') {
        // Could integrate with Sentry, LogRocket, etc.
        console.error(`[${errorEntry.level}] ${errorEntry.message}`, errorEntry);
      }

      return errorEntry;
    },
    []
  );

  // Track unhandled promise rejections
  const trackUnhandledRejection = useCallback(
    (event) => {
      trackError(event.reason, {
        level: 'error',
        type: 'UnhandledRejection',
      });
    },
    [trackError]
  );

  // Track global errors
  const trackGlobalError = useCallback(
    (event) => {
      trackError(event.error || new Error(event.message), {
        level: 'error',
        type: 'GlobalError',
      });
    },
    [trackError]
  );

  // Get error frequency
  const getErrorFrequency = useCallback(() => {
    const frequency = {};

    errors.forEach((error) => {
      const key = error.type;
      if (!frequency[key]) {
        frequency[key] = { type: key, count: 0, lastOccurrence: null };
      }
      frequency[key].count++;
      frequency[key].lastOccurrence = error.timestamp;
    });

    return Object.values(frequency).sort((a, b) => b.count - a.count);
  }, [errors]);

  // Get error by level
  const getErrorsByLevel = useCallback(
    (level) => {
      return errors.filter((error) => error.level === level);
    },
    [errors]
  );

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
    setErrorStats({ total: 0, byType: {}, byLevel: {} });
    setLastError(null);
  }, []);

  // Clear specific error
  const clearError = useCallback((errorId) => {
    setErrors((prev) => prev.filter((err) => err.id !== errorId));
  }, []);

  // Setup global error listeners
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', trackGlobalError);
      window.addEventListener('unhandledrejection', trackUnhandledRejection);

      return () => {
        window.removeEventListener('error', trackGlobalError);
        window.removeEventListener('unhandledrejection', trackUnhandledRejection);
      };
    }
  }, [trackGlobalError, trackUnhandledRejection]);

  return {
    errors,
    errorStats,
    lastError,
    trackError,
    trackUnhandledRejection,
    trackGlobalError,
    getErrorFrequency,
    getErrorsByLevel,
    clearErrors,
    clearError,
  };
}

export default useErrorTracking;