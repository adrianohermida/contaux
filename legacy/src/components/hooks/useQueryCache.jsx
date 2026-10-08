import { useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook for query result caching with automatic invalidation
 * Provides caching strategy for contacts, notes, activities, etc.
 */
export function useQueryCache(
  queryKey,
  queryFn,
  options = {}
) {
  const cacheConfigRef = useRef(null);

  // Determine TTL based on query type
  const getTTL = useCallback(() => {
    const key = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    
    const ttlMap = {
      'contact': 30 * 60 * 1000, // 30 min
      'notes': 15 * 60 * 1000, // 15 min
      'activities': 60 * 60 * 1000, // 60 min
      'list': 5 * 60 * 1000, // 5 min
      'config': 24 * 60 * 60 * 1000, // 24h
    };

    return ttlMap[key] || ttlMap['config'];
  }, [queryKey]);

  // Execute query with react-query caching
  const query = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn,
    staleTime: getTTL(),
    gcTime: getTTL() * 2, // Keep in memory 2x the stale time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  // Manual invalidation function
  const invalidateCache = useCallback(async () => {
    const { queryClient } = options;
    if (queryClient) {
      await queryClient.invalidateQueries({
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      });
    }
  }, [queryKey, options]);

  return { ...query, invalidateCache };
}

/**
 * Hook for managing related cache invalidations
 * When entity changes, invalidate related caches
 */
export function useCacheInvalidation(queryClient) {
  const invalidateEntity = useCallback(
    async (entityType, workspaceId, entityId) => {
      const keysToInvalidate = [
        ['contact', workspaceId, entityId],
        ['contacts', workspaceId, 'list'],
        [`${entityType}-notes`, workspaceId, entityId],
        [`${entityType}-activities`, workspaceId, entityId],
      ];

      for (const key of keysToInvalidate) {
        await queryClient.invalidateQueries({ queryKey: key });
      }
    },
    [queryClient]
  );

  const invalidateList = useCallback(
    async (entityType, workspaceId) => {
      await queryClient.invalidateQueries({
        queryKey: [entityType, workspaceId, 'list'],
      });
    },
    [queryClient]
  );

  const clearWorkspace = useCallback(
    async (workspaceId) => {
      await queryClient.removeQueries({
        queryKey: [workspaceId], // Removes all queries containing this workspace
      });
    },
    [queryClient]
  );

  return { invalidateEntity, invalidateList, clearWorkspace };
}