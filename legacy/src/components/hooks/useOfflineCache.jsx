import { useEffect, useState, useCallback } from 'react';

/**
 * Hook para Offline Mode - cache fallback
 * Persiste dados em localStorage para fallback offline
 */
export function useOfflineCache(key, data, options = {}) {
  const { ttl = 24 * 60 * 60 * 1000 } = options; // 24h default
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Salvar dados no cache
  useEffect(() => {
    if (data) {
      const cached = {
        data,
        timestamp: Date.now(),
        ttl
      };
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cached));
      } catch (error) {
        console.error('Erro ao salvar cache:', error);
      }
    }
  }, [key, data, ttl]);

  // Detectar online/offline
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Recuperar dados do cache
  const getCached = useCallback(() => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data: cachedData, timestamp, ttl } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > ttl;

      return isExpired ? null : cachedData;
    } catch (error) {
      console.error('Erro ao recuperar cache:', error);
      return null;
    }
  }, [key]);

  return { isOffline, getCached };
}