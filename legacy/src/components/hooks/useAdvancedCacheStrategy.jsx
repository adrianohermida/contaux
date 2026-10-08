/**
 * useAdvancedCacheStrategy Hook
 * Multi-layer caching system with intelligent invalidation, compression, and TTL management
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useAdvancedCacheStrategy(options = {}) {
  const {
    enableMemoryCache = true,
    enableDiskCache = true,
    enableServiceWorker = true,
    defaultTTL = 3600000, // 1 hour
    maxMemorySize = 50 * 1024 * 1024, // 50MB
  } = options;

  const [cacheMetrics, setCacheMetrics] = useState({
    hits: 0,
    misses: 0,
    memoryUsed: 0,
    diskUsed: 0,
    totalItems: 0,
    hitRate: 0,
    missRate: 0,
  });

  const memoryCache = useRef(new Map());
  const cacheTimestamps = useRef(new Map());

  // Calculate hit rate
  const calculateHitRate = useCallback(() => {
    const total = cacheMetrics.hits + cacheMetrics.misses;
    return total > 0 ? ((cacheMetrics.hits / total) * 100).toFixed(2) : 0;
  }, [cacheMetrics.hits, cacheMetrics.misses]);

  // Compress data using JSON + base64
  const compressData = useCallback((data) => {
    try {
      const json = JSON.stringify(data);
      return btoa(json);
    } catch (e) {
      return data;
    }
  }, []);

  // Decompress data
  const decompressData = useCallback((compressed) => {
    try {
      const json = atob(compressed);
      return JSON.parse(json);
    } catch (e) {
      return compressed;
    }
  }, []);

  // Check if cache entry has expired
  const isExpired = useCallback((key) => {
    const timestamp = cacheTimestamps.current.get(key);
    if (!timestamp) return false;
    return Date.now() > timestamp;
  }, []);

  // Get from cache
  const getFromCache = useCallback(
    (key) => {
      if (isExpired(key)) {
        memoryCache.current.delete(key);
        cacheTimestamps.current.delete(key);
        setCacheMetrics((prev) => ({ ...prev, misses: prev.misses + 1 }));
        return null;
      }

      const cached = memoryCache.current.get(key);
      if (cached) {
        setCacheMetrics((prev) => ({
          ...prev,
          hits: prev.hits + 1,
          hitRate: calculateHitRate(),
        }));
        return decompressData(cached);
      }

      setCacheMetrics((prev) => ({
        ...prev,
        misses: prev.misses + 1,
        missRate: 100 - calculateHitRate(),
      }));
      return null;
    },
    [isExpired, decompressData, calculateHitRate]
  );

  // Set in cache
  const setInCache = useCallback(
    (key, value, ttl = defaultTTL) => {
      const compressed = compressData(value);
      memoryCache.current.set(key, compressed);
      cacheTimestamps.current.set(key, Date.now() + ttl);

      const size = new Blob([compressed]).size;
      setCacheMetrics((prev) => ({
        ...prev,
        memoryUsed: prev.memoryUsed + size,
        totalItems: prev.totalItems + 1,
      }));

      // Store in IndexedDB if available
      if (enableDiskCache && 'indexedDB' in window) {
        const db = indexedDB.open('CacheDB', 1);
        db.onsuccess = (e) => {
          const store = e.target.result.transaction('cache', 'readwrite').objectStore('cache');
          store.put({ key, value: compressed, timestamp: Date.now() + ttl });
        };
      }
    },
    [compressData, defaultTTL, enableDiskCache]
  );

  // Invalidate cache by pattern
  const invalidateCache = useCallback((pattern) => {
    const regex = new RegExp(pattern);
    const keysToDelete = Array.from(memoryCache.current.keys()).filter((key) =>
      regex.test(key)
    );

    keysToDelete.forEach((key) => {
      memoryCache.current.delete(key);
      cacheTimestamps.current.delete(key);
    });

    setCacheMetrics((prev) => ({
      ...prev,
      totalItems: prev.totalItems - keysToDelete.length,
    }));
  }, []);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    memoryCache.current.clear();
    cacheTimestamps.current.clear();
    setCacheMetrics({
      hits: 0,
      misses: 0,
      memoryUsed: 0,
      diskUsed: 0,
      totalItems: 0,
      hitRate: 0,
      missRate: 0,
    });

    // Clear IndexedDB
    if (enableDiskCache && 'indexedDB' in window) {
      const db = indexedDB.open('CacheDB', 1);
      db.onsuccess = (e) => {
        const store = e.target.result.transaction('cache', 'readwrite').objectStore('cache');
        store.clear();
      };
    }
  }, [enableDiskCache]);

  // Get cache metrics
  const getCacheMetrics = useCallback(() => {
    return {
      ...cacheMetrics,
      hitRate: parseFloat(calculateHitRate()),
      missRate: 100 - parseFloat(calculateHitRate()),
    };
  }, [cacheMetrics, calculateHitRate]);

  // Setup cache warming
  const setupCacheWarming = useCallback((warmupFn) => {
    warmupFn((key, value, ttl) => {
      setInCache(key, value, ttl);
    });
  }, [setInCache]);

  // Monitor cache health
  const monitorCacheHealth = useCallback(() => {
    const health = {
      itemCount: memoryCache.current.size,
      hitRate: calculateHitRate(),
      memoryUsage: cacheMetrics.memoryUsed,
      isHealthy: parseFloat(calculateHitRate()) > 60,
    };
    return health;
  }, [cacheMetrics.memoryUsed, calculateHitRate]);

  // Initialize IndexedDB
  useEffect(() => {
    if (!enableDiskCache) return;

    const db = indexedDB.open('CacheDB', 1);
    db.onupgradeneeded = (e) => {
      const store = e.target.result.createObjectStore('cache', { keyPath: 'key' });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    };

    db.onsuccess = (e) => {
      const store = e.target.result.transaction('cache', 'readonly').objectStore('cache');
      store.getAll().onsuccess = (event) => {
        event.target.result.forEach(({ key, value }) => {
          memoryCache.current.set(key, value);
        });
      };
    };
  }, [enableDiskCache]);

  // Cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const keysToDelete = Array.from(cacheTimestamps.current.entries())
        .filter(([, timestamp]) => Date.now() > timestamp)
        .map(([key]) => key);

      keysToDelete.forEach((key) => {
        memoryCache.current.delete(key);
        cacheTimestamps.current.delete(key);
      });

      if (keysToDelete.length > 0) {
        setCacheMetrics((prev) => ({
          ...prev,
          totalItems: prev.totalItems - keysToDelete.length,
        }));
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    getFromCache,
    setInCache,
    invalidateCache,
    clearAllCache,
    getCacheMetrics,
    setupCacheWarming,
    monitorCacheHealth,
    compressData,
    decompressData,
    cacheMetrics,
  };
}

export default useAdvancedCacheStrategy;