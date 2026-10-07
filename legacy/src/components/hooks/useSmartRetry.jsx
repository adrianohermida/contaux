/**
 * useSmartRetry Hook
 * Intelligent retry logic with exponential backoff and error strategies
 */

import { useCallback, useState } from 'react';

export function useSmartRetry(maxRetries = 3, baseDelay = 1000) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Exponential backoff calculation
  const calculateDelay = useCallback((attempt) => {
    return baseDelay * Math.pow(2, attempt);
  }, [baseDelay]);

  // Determine if error is retryable
  const isRetryable = useCallback((error) => {
    // Retryable errors: network, timeout, 5xx, 429
    if (error?.response?.status) {
      return error.response.status >= 500 || error.response.status === 429;
    }
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return true;
    }
    return false;
  }, []);

  // Execute with retry
  const executeWithRetry = useCallback(async (fn, onRetry) => {
    let lastErr = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        setRetryCount(attempt);
        const result = await fn();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        lastErr = error;
        setLastError(error);

        if (!isRetryable(error) || attempt === maxRetries - 1) {
          break;
        }

        // Calculate delay and wait
        const delay = calculateDelay(attempt);
        onRetry?.(attempt + 1, delay);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastErr;
  }, [maxRetries, isRetryable, calculateDelay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    lastError,
    reset,
    isRetryable,
  };
}

export default useSmartRetry;