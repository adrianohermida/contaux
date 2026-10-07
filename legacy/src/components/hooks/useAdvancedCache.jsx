/**
 * useAdvancedCache Hook
 * Multi-tier caching strategy with TTL and invalidation
 */

import { useState, useCallback, useEffect } from 'react';

export function useAdvancedCache() {
  const [cache, setCache] = useState(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
  });

  // Generate cache key
  const generateCacheKey = useCallback((prefix, data) => {
    return `${prefix}:${JSON.stringify(data)}`;
  }, []);

  // Set cache with TTL
  const setCacheValue = useCallback(
    (key, value, ttl = 3600000) => {
      // ttl in milliseconds, default 1 hour
      const entry = {
        value,
        timestamp: Date.now(),
        ttl,
        expiresAt: Date.now() + ttl,
      };

      setCache((prev) => {
        const newCache = new Map(prev);
        newCache.set(key, entry);

        // Limit cache size to 100 entries
        if (newCache.size > 100) {
          const firstKey = newCache.keys().next().value;
          newCache.delete(firstKey);
          setCacheStats((s) => ({
            ...s,
            evictions: s.evictions + 1,
          }));
        }

        return newCache;
      });
    },
    []
  );

  // Get cache value
  const getCacheValue = useCallback(
    (key) => {
      const entry = cache.get(key);

      if (!entry) {
        setCacheStats((s) => ({
          ...s,
          misses: s.misses + 1,
        }));
        return null;
      }

      // Check expiration
      if (Date.now() > entry.expiresAt) {
        setCache((prev) => {
          const newCache = new Map(prev);
          newCache.delete(key);
          return newCache;
        });
        setCacheStats((s) => ({
          ...s,
          misses: s.misses + 1,
        }));
        return null;
      }

      setCacheStats((s) => ({
        ...s,
        hits: s.hits + 1,
      }));
      return entry.value;
    },
    [cache]
  );

  // Invalidate cache entry
  const invalidateCache = useCallback((key) => {
    setCache((prev) => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  // Invalidate cache by pattern
  const invalidateCachePattern = useCallback((pattern) => {
    setCache((prev) => {
      const newCache = new Map(prev);
      const regex = new RegExp(pattern);

      Array.from(newCache.keys()).forEach((key) => {
        if (regex.test(key)) {
          newCache.delete(key);
        }
      });

      return newCache;
    });
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    setCacheStats({
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
    });
  }, []);

  // Get cache hit rate
  const getCacheHitRate = useCallback(() => {
    const total = cacheStats.hits + cacheStats.misses;
    if (total === 0) return 0;
    return (cacheStats.hits / total) * 100;
  }, [cacheStats]);

  // Get cache size
  const getCacheSize = useCallback(() => {
    return cache.size;
  }, [cache]);

  // Get all cache entries
  const getCacheEntries = useCallback(() => {
    const entries = [];
    cache.forEach((value, key) => {
      entries.push({
        key,
        value: value.value,
        age: Date.now() - value.timestamp,
        ttl: value.ttl,
        expiresAt: value.expiresAt,
      });
    });
    return entries;
  }, [cache]);

  // Update stats
  useEffect(() => {
    setCacheStats((prev) => ({
      ...prev,
      size: cache.size,
    }));
  }, [cache]);

  // Cleanup expired entries
  useEffect(() => {
    const interval = setInterval(() => {
      setCache((prev) => {
        const newCache = new Map(prev);
        let expired = 0;

        newCache.forEach((entry, key) => {
          if (Date.now() > entry.expiresAt) {
            newCache.delete(key);
            expired++;
          }
        });

        if (expired > 0) {
          setCacheStats((s) => ({
            ...s,
            evictions: s.evictions + expired,
          }));
        }

        return newCache;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    setCacheValue,
    getCacheValue,
    invalidateCache,
    invalidateCachePattern,
    clearCache,
    getCacheHitRate,
    getCacheSize,
    getCacheEntries,
    cacheStats,
  };
}

export default useAdvancedCache;