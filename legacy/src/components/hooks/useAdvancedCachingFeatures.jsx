/**
 * useAdvancedCachingFeatures Hook
 * Advanced caching with compression, persistence, and analytics
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useAdvancedCachingFeatures(options = {}) {
  const {
    enableCompression = true,
    enablePersistence = true,
    compressionThreshold = 1024,
    persistenceKey = 'app_cache',
  } = options;

  const [cacheStats, setCacheStats] = useState({
    originalSize: 0,
    compressedSize: 0,
    compressionRatio: 0,
    itemsStored: 0,
    persistenceEnabled: enablePersistence,
  });

  const [persistedData, setPersistedData] = useState({});
  const cacheRef = useRef(new Map());
  const compressionRef = useRef({});

  // Simple compression (reduce object size)
  const compressData = useCallback((data) => {
    if (!enableCompression) return data;

    const str = JSON.stringify(data);
    if (str.length < compressionThreshold) return data;

    // Basic compression: remove whitespace
    const compressed = str
      .replace(/\s+/g, ' ')
      .replace(/:\s+/g, ':')
      .replace(/,\s+/g, ',');

    return {
      __compressed: true,
      data: compressed,
    };
  }, [enableCompression, compressionThreshold]);

  // Decompress data
  const decompressData = useCallback((data) => {
    if (data.__compressed) {
      return JSON.parse(data.data);
    }
    return data;
  }, []);

  // Set cache with compression
  const setCache = useCallback((key, value) => {
    const originalSize = JSON.stringify(value).length;
    const compressed = compressData(value);
    const compressedSize = JSON.stringify(compressed).length;

    cacheRef.current.set(key, compressed);
    compressionRef.current[key] = {
      original: originalSize,
      compressed: compressedSize,
    };

    setCacheStats((prev) => ({
      ...prev,
      originalSize: prev.originalSize + originalSize,
      compressedSize: prev.compressedSize + compressedSize,
      compressionRatio: (
        ((prev.originalSize + originalSize - (prev.compressedSize + compressedSize)) /
          (prev.originalSize + originalSize)) *
        100
      ).toFixed(2),
      itemsStored: cacheRef.current.size,
    }));

    // Persist to localStorage if enabled
    if (enablePersistence) {
      try {
        const allData = Object.fromEntries(cacheRef.current);
        localStorage.setItem(persistenceKey, JSON.stringify(allData));
        setPersistedData(allData);
      } catch (error) {
        console.warn('Failed to persist cache:', error);
      }
    }
  }, [compressData, enablePersistence, persistenceKey]);

  // Get cache with decompression
  const getCache = useCallback((key) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    return decompressData(cached);
  }, [decompressData]);

  // Load persisted cache on mount
  useEffect(() => {
    if (enablePersistence) {
      try {
        const stored = localStorage.getItem(persistenceKey);
        if (stored) {
          const data = JSON.parse(stored);
          Object.entries(data).forEach(([key, value]) => {
            cacheRef.current.set(key, value);
          });

          setCacheStats((prev) => ({
            ...prev,
            itemsStored: cacheRef.current.size,
          }));
        }
      } catch (error) {
        console.warn('Failed to load persisted cache:', error);
      }
    }
  }, [enablePersistence, persistenceKey]);

  // Get compression stats
  const getCompressionStats = useCallback(() => {
    return {
      ...cacheStats,
      compressionRatio: `${cacheStats.compressionRatio}%`,
      savings: `${(cacheStats.originalSize - cacheStats.compressedSize).toLocaleString()} bytes`,
    };
  }, [cacheStats]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    compressionRef.current = {};
    setCacheStats({
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      itemsStored: 0,
      persistenceEnabled: enablePersistence,
    });

    if (enablePersistence) {
      try {
        localStorage.removeItem(persistenceKey);
        setPersistedData({});
      } catch (error) {
        console.warn('Failed to clear persisted cache:', error);
      }
    }
  }, [enablePersistence, persistenceKey]);

  // Export cache to file
  const exportCache = useCallback(() => {
    const data = Object.fromEntries(cacheRef.current);
    return {
      timestamp: new Date().toISOString(),
      stats: cacheStats,
      data,
    };
  }, [cacheStats]);

  // Import cache from file
  const importCache = useCallback((importedData) => {
    if (importedData.data) {
      Object.entries(importedData.data).forEach(([key, value]) => {
        setCache(key, value);
      });
      return true;
    }
    return false;
  }, [setCache]);

  return {
    cacheStats,
    persistedData,
    setCache,
    getCache,
    clearCache,
    getCompressionStats,
    exportCache,
    importCache,
  };
}

export default useAdvancedCachingFeatures;