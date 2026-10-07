/**
 * useCacheManager Hook
 * Advanced multi-tier caching with TTL and invalidation strategies
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useCacheManager(options = {}) {
  const {
    maxSize = 100,
    maxAge = 3600000, // 1 hour
    warningThreshold = 80,
  } = options;

  const [cache, setCache] = useState(new Map());
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
  });

  const cacheRef = useRef(new Map());
  const expirationRef = useRef(new Map());

  // Set cache entry
  const set = useCallback((key, value, ttl = maxAge) => {
    // Check size limit
    if (cacheRef.current.size >= maxSize && !cacheRef.current.has(key)) {
      // Evict oldest entry
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
      expirationRef.current.delete(firstKey);
      setStats((prev) => ({ ...prev, evictions: prev.evictions + 1 }));
    }

    cacheRef.current.set(key, value);
    expirationRef.current.set(key, Date.now() + ttl);

    setCache(new Map(cacheRef.current));
    setStats((prev) => ({ ...prev, size: cacheRef.current.size }));
  }, [maxAge, maxSize]);

  // Get cache entry
  const get = useCallback((key) => {
    // Check expiration
    const expiration = expirationRef.current.get(key);
    if (expiration && Date.now() > expiration) {
      cacheRef.current.delete(key);
      expirationRef.current.delete(key);
      setStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    const value = cacheRef.current.get(key);
    if (value) {
      setStats((prev) => ({ ...prev, hits: prev.hits + 1 }));
      return value;
    }

    setStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, []);

  // Invalidate by key
  const invalidate = useCallback((key) => {
    cacheRef.current.delete(key);
    expirationRef.current.delete(key);
    setCache(new Map(cacheRef.current));
    setStats((prev) => ({ ...prev, size: cacheRef.current.size }));
  }, []);

  // Invalidate by pattern
  const invalidatePattern = useCallback((pattern) => {
    const regex = new RegExp(pattern);
    const keysToDelete = Array.from(cacheRef.current.keys()).filter((key) =>
      regex.test(key)
    );

    keysToDelete.forEach((key) => {
      cacheRef.current.delete(key);
      expirationRef.current.delete(key);
    });

    setCache(new Map(cacheRef.current));
    setStats((prev) => ({ ...prev, size: cacheRef.current.size }));
  }, []);

  // Clear all cache
  const clear = useCallback(() => {
    cacheRef.current.clear();
    expirationRef.current.clear();
    setCache(new Map());
    setStats((prev) => ({ ...prev, size: 0, hits: 0, misses: 0, evictions: 0 }));
  }, []);

  // Get statistics
  const getStats = useCallback(() => {
    const hitRate = stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses)) * 100 
      : 0;

    return {
      ...stats,
      hitRate: hitRate.toFixed(1),
      totalRequests: stats.hits + stats.misses,
      isCritical: stats.size >= warningThreshold,
    };
  }, [stats, warningThreshold]);

  // Get all cache entries
  const getEntries = useCallback(() => {
    const entries = [];
    cacheRef.current.forEach((value, key) => {
      const expiration = expirationRef.current.get(key);
      const isExpired = expiration && Date.now() > expiration;
      entries.push({
        key,
        value,
        expiration,
        isExpired,
        createdAt: expiration - maxAge,
      });
    });
    return entries;
  }, [maxAge]);

  // Cache warming
  const warmCache = useCallback((entries) => {
    entries.forEach(({ key, value, ttl }) => {
      set(key, value, ttl);
    });
  }, [set]);

  // Cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expiredKeys = Array.from(expirationRef.current.entries())
        .filter(([, expTime]) => now > expTime)
        .map(([key]) => key);

      expiredKeys.forEach((key) => {
        cacheRef.current.delete(key);
        expirationRef.current.delete(key);
      });

      if (expiredKeys.length > 0) {
        setCache(new Map(cacheRef.current));
        setStats((prev) => ({ ...prev, size: cacheRef.current.size }));
      }
    }, 60000); // Clean every minute

    return () => clearInterval(interval);
  }, []);

  return {
    cache,
    stats,
    set,
    get,
    invalidate,
    invalidatePattern,
    clear,
    getStats,
    getEntries,
    warmCache,
  };
}

export default useCacheManager;