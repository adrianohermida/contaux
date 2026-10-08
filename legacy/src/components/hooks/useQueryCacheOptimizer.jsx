/**
 * Query Cache Optimization Hook
 * Manages cache presets and provides utilities for optimized query configurations
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/**
 * Cache presets organized by data type and update frequency
 */
const CACHE_PRESETS = {
  // Real-time critical data (contacts, invoices, payments)
  critical: {
    staleTime: 5 * 60 * 1000,      // 5 minutos
    gcTime: 15 * 60 * 1000,        // 15 minutos
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  },
  
  // Frequently updated data
  short: {
    staleTime: 2 * 60 * 1000,      // 2 minutos
    gcTime: 5 * 60 * 1000,         // 5 minutos
    retry: 1,
    retryDelay: 1000,
  },
  
  // Moderately updated data (tags, categories, settings)
  long: {
    staleTime: 30 * 60 * 1000,     // 30 minutos
    gcTime: 60 * 60 * 1000,        // 1 hora
    retry: 1,
    retryDelay: 1000,
  },
  
  // Static data (never changes during session)
  static: {
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,        // 1 hora
    retry: false,
  },
};

/**
 * Hook para otimizar queries com cache automático
 * Monitora e invalida queries inteligentemente
 */
export function useQueryCacheOptimizer() {
  const queryClient = useQueryClient();

  // Invalida múltiplas queries relacionadas
  const invalidateRelated = useCallback((entityType, entityId) => {
    const patterns = {
      contacts: [
        ['contacts'],
        ['contact-tags'],
        ['all-contact-tag-assignments'],
        ['contact-details', entityId]
      ],
      invoices: [
        ['invoices', 'Invoice-list'],
        ['invoices-for-payments'],
        ['Invoice-detail', entityId]
      ],
      payments: [
        ['payments'],
        ['invoices-for-payments'],
      ],
      quotes: [
        ['quotes'],
        ['clients'],
      ],
    };

    const keysToInvalidate = patterns[entityType] || [];
    
    keysToInvalidate.forEach(pattern => {
      if (Array.isArray(pattern)) {
        queryClient.invalidateQueries({ 
          queryKey: pattern 
        });
      }
    });
  }, [queryClient]);

  // Prefetch related queries (eager loading)
  const prefetchRelated = useCallback((entityType, entityId) => {
    // Pode ser expandido conforme necessário
    const prefetchPatterns = {
      invoices: [
        ['invoices'],
        ['clients'],
      ],
      quotes: [
        ['quotes'],
        ['clients'],
      ],
    };

    // Implementar prefetch logic se necessário
  }, [queryClient]);

  // Limpa cache completamente
  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  // Obtem cache info para debugging
  const getCacheMetrics = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const allQueries = cache.getAll();
    
    return {
      totalQueries: allQueries.length,
      activeQueries: allQueries.filter(q => q.getObserversCount() > 0).length,
      stalQueries: allQueries.filter(q => q.isStale()).length,
      totalCacheSize: allQueries.reduce((sum, q) => sum + (q.state.data?.length || 0), 0),
    };
  }, [queryClient]);

  return {
    invalidateRelated,
    prefetchRelated,
    clearCache,
    getCacheMetrics,
    CACHE_PRESETS,
  };
}

/**
 * Hook para gerenciar prefetching automático
 */
export function useQueryPrefetch() {
  const queryClient = useQueryClient();

  const prefetch = useCallback((queryKey, queryFn, options = {}) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...options,
    });
  }, [queryClient]);

  return { prefetch };
}

export default useQueryCacheOptimizer;