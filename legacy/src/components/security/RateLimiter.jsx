import React from 'react';

/**
 * RateLimiter - Throttling and rate limiting para API calls
 * Previne abuso e DDoS
 */

class RateLimitManager {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Verifica se requisição está permitida
   */
  isAllowed() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove requisições fora da janela
    this.requests = this.requests.filter(time => time > windowStart);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  /**
   * Retorna quantos requests sobraram
   */
  getRemaining() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const validRequests = this.requests.filter(time => time > windowStart);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Retorna tempo até reset
   */
  getResetTime() {
    if (this.requests.length === 0) return 0;
    const oldestRequest = this.requests[0];
    const resetTime = oldestRequest + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Reset manual
   */
  reset() {
    this.requests = [];
  }
}

// Instâncias por endpoint
const limitersByEndpoint = new Map();

export function getRateLimiter(endpoint, maxRequests = 10, windowMs = 60000) {
  if (!limitersByEndpoint.has(endpoint)) {
    limitersByEndpoint.set(endpoint, new RateLimitManager(maxRequests, windowMs));
  }
  return limitersByEndpoint.get(endpoint);
}

/**
 * Hook para rate limiting
 */
export function useRateLimit(endpoint, maxRequests = 10, windowMs = 60000) {
  const [isLimited, setIsLimited] = React.useState(false);
  const [remaining, setRemaining] = React.useState(maxRequests);
  const [resetTime, setResetTime] = React.useState(0);

  const limiter = React.useMemo(
    () => getRateLimiter(endpoint, maxRequests, windowMs),
    [endpoint, maxRequests, windowMs]
  );

  const checkLimit = React.useCallback(() => {
    const allowed = limiter.isAllowed();
    setIsLimited(!allowed);
    setRemaining(limiter.getRemaining());
    setResetTime(limiter.getResetTime());
    return allowed;
  }, [limiter]);

  return {
    isLimited,
    remaining,
    resetTime,
    checkLimit,
    reset: () => limiter.reset(),
  };
}

/**
 * HOC para proteger funções com rate limiting
 */
export function withRateLimit(fn, endpoint, maxRequests = 10, windowMs = 60000) {
  const limiter = getRateLimiter(endpoint, maxRequests, windowMs);

  return async function limitedFn(...args) {
    if (!limiter.isAllowed()) {
      const resetTime = limiter.getResetTime();
      const error = new Error(`Rate limit exceeded. Reset in ${Math.ceil(resetTime / 1000)}s`);
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.resetTime = resetTime;
      throw error;
    }

    return fn(...args);
  };
}

/**
 * Component para mostrar rate limit status
 */
export const RateLimitIndicator = React.memo(function RateLimitIndicator({
  endpoint,
  maxRequests = 10,
}) {
  const { isLimited, remaining, resetTime } = useRateLimit(endpoint, maxRequests);

  if (!isLimited) {
    return null; // Não mostra se não está limitado
  }

  const seconds = Math.ceil(resetTime / 1000);

  return (
    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
      ⚠️ Muitas requisições. Aguarde {seconds}s para tentar novamente.
    </div>
  );
});

RateLimitIndicator.displayName = 'RateLimitIndicator';

/**
 * Debounce helper (delay entre chamadas)
 */
export function debounce(fn, delay) {
  let timeoutId;

  return function debouncedFn(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle helper (máximo de chamadas por período)
 */
export function throttle(fn, limit) {
  let inThrottle;

  return function throttledFn(...args) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}