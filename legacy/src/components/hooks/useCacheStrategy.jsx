import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para gerenciar estratégias de cache avançadas
 * Implementa invalidation patterns e prefetching
 */
export function useCacheStrategy() {
  const queryClient = useQueryClient();

  const invalidateRelated = useCallback((entity, entityId) => {
    // Invalidar caches relacionados quando uma entidade muda
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return key[0]?.includes(entity) || key.includes(entityId);
      }
    });
  }, [queryClient]);

  const prefetchEntity = useCallback(async (queryKey, queryFn) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000
    });
  }, [queryClient]);

  const clearCache = useCallback((pattern) => {
    queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && key.includes(pattern);
      }
    });
  }, [queryClient]);

  const getCachedData = useCallback((queryKey) => {
    return queryClient.getQueryData(queryKey);
  }, [queryClient]);

  return {
    invalidateRelated,
    prefetchEntity,
    clearCache,
    getCachedData
  };
}