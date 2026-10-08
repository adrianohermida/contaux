/**
 * useRateLimiter Hook
 * API rate limiting and request throttling
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useRateLimiter(options = {}) {
  const {
    requestsPerSecond = 100,
    requestsPerMinute = 5000,
    burstSize = 50,
  } = options;

  const [limits, setLimits] = useState({
    perSecond: requestsPerSecond,
    perMinute: requestsPerMinute,
    burstSize: burstSize,
  });

  const [metrics, setMetrics] = useState({
    requestsThisSecond: 0,
    requestsThisMinute: 0,
    throttledRequests: 0,
    totalRequests: 0,
    rejectedRequests: 0,
  });

  const requestQueueRef = useRef([]);
  const ipLimitsRef = useRef(new Map());
  const userLimitsRef = useRef(new Map());

  // Check rate limit for IP
  const checkIPLimit = useCallback((ip) => {
    if (!ipLimitsRef.current.has(ip)) {
      ipLimitsRef.current.set(ip, {
        count: 0,
        lastReset: Date.now(),
        burst: 0,
      });
    }

    const limit = ipLimitsRef.current.get(ip);
    const now = Date.now();
    const timeSinceReset = now - limit.lastReset;

    // Reset if minute has passed
    if (timeSinceReset > 60000) {
      limit.count = 0;
      limit.lastReset = now;
      limit.burst = 0;
    }

    if (limit.count >= requestsPerMinute) {
      return { allowed: false, reason: 'minute_limit_exceeded' };
    }

    if (limit.burst >= burstSize) {
      return { allowed: false, reason: 'burst_limit_exceeded' };
    }

    limit.count++;
    limit.burst++;

    setTimeout(() => {
      limit.burst = Math.max(0, limit.burst - 1);
    }, 100);

    return { allowed: true };
  }, [requestsPerMinute, burstSize]);

  // Check rate limit for user
  const checkUserLimit = useCallback((userId) => {
    if (!userLimitsRef.current.has(userId)) {
      userLimitsRef.current.set(userId, {
        count: 0,
        lastReset: Date.now(),
      });
    }

    const limit = userLimitsRef.current.get(userId);
    const now = Date.now();
    const timeSinceReset = now - limit.lastReset;

    // Reset if minute has passed
    if (timeSinceReset > 60000) {
      limit.count = 0;
      limit.lastReset = now;
    }

    if (limit.count >= requestsPerMinute) {
      return { allowed: false, reason: 'user_limit_exceeded' };
    }

    limit.count++;
    return { allowed: true };
  }, [requestsPerMinute]);

  // Process request with rate limiting
  const processRequest = useCallback((request) => {
    const { ip, userId } = request;
    const timestamp = Date.now();

    // Check both IP and user limits
    const ipCheck = checkIPLimit(ip);
    const userCheck = userId ? checkUserLimit(userId) : { allowed: true };

    let result = {
      allowed: ipCheck.allowed && userCheck.allowed,
      timestamp,
      request,
    };

    if (result.allowed) {
      setMetrics((prev) => ({
        ...prev,
        requestsThisSecond: prev.requestsThisSecond + 1,
        requestsThisMinute: prev.requestsThisMinute + 1,
        totalRequests: prev.totalRequests + 1,
      }));
    } else {
      setMetrics((prev) => ({
        ...prev,
        rejectedRequests: prev.rejectedRequests + 1,
        throttledRequests: prev.throttledRequests + 1,
      }));
    }

    return result;
  }, [checkIPLimit, checkUserLimit]);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return {
      ...metrics,
      ipLimitCount: ipLimitsRef.current.size,
      userLimitCount: userLimitsRef.current.size,
    };
  }, [metrics]);

  // Get limit status for IP
  const getIPStatus = useCallback((ip) => {
    const limit = ipLimitsRef.current.get(ip);
    if (!limit) return null;

    return {
      ip,
      requestsUsed: limit.count,
      requestsLimit: requestsPerMinute,
      percentageUsed: (limit.count / requestsPerMinute) * 100,
      burstUsed: limit.burst,
      burstLimit: burstSize,
    };
  }, [requestsPerMinute, burstSize]);

  // Reset all limits
  const resetLimits = useCallback(() => {
    ipLimitsRef.current.clear();
    userLimitsRef.current.clear();
    setMetrics({
      requestsThisSecond: 0,
      requestsThisMinute: 0,
      throttledRequests: 0,
      totalRequests: 0,
      rejectedRequests: 0,
    });
  }, []);

  // Clean up old entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oldEntries = [];

      ipLimitsRef.current.forEach((value, key) => {
        if (now - value.lastReset > 120000) {
          oldEntries.push(key);
        }
      });

      oldEntries.forEach((key) => ipLimitsRef.current.delete(key));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Reset per-second counter
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        requestsThisSecond: 0,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    limits,
    metrics,
    processRequest,
    checkIPLimit,
    checkUserLimit,
    getMetrics,
    getIPStatus,
    resetLimits,
  };
}

export default useRateLimiter;