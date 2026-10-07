import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook otimizado para cache de entidades
 * Suporta CRUD com invalidation automática
 */
export function useEntityCache(entityName, tenantId) {
  const queryClient = useQueryClient();
  
  const listKey = [`${entityName}-list`, tenantId];
  const detailKey = (id) => [`${entityName}-detail`, id];

  // Listar entidades com cache
  const useListEntities = (filters = {}) => {
    return useQuery({
      queryKey: [...listKey, JSON.stringify(filters)],
      queryFn: async () => {
        const base44 = (await import('@/api/base44Client')).base44;
        return base44.entities[entityName].filter({ 
          workspace_id: tenantId,
          ...filters 
        });
      },
      enabled: !!tenantId,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Get entidade individual
  const useGetEntity = (id) => {
    return useQuery({
      queryKey: detailKey(id),
      queryFn: async () => {
        const base44 = (await import('@/api/base44Client')).base44;
        return base44.entities[entityName].read(id);
      },
      enabled: !!id,
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Create com invalidation
  const useCreateEntity = () => {
    return useMutation({
      mutationFn: async (data) => {
        const base44 = (await import('@/api/base44Client')).base44;
        return base44.entities[entityName].create({
          workspace_id: tenantId,
          ...data
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: listKey });
      }
    });
  };

  // Update com cache update otimizado
  const useUpdateEntity = () => {
    return useMutation({
      mutationFn: async ({ id, data }) => {
        const base44 = (await import('@/api/base44Client')).base44;
        return base44.entities[entityName].update(id, data);
      },
      onSuccess: (updatedData, { id }) => {
        // Atualizar cache local
        queryClient.setQueryData(detailKey(id), updatedData);
        queryClient.invalidateQueries({ queryKey: listKey });
      }
    });
  };

  // Delete com cleanup
  const useDeleteEntity = () => {
    return useMutation({
      mutationFn: async (id) => {
        const base44 = (await import('@/api/base44Client')).base44;
        return base44.entities[entityName].delete(id);
      },
      onSuccess: (_, id) => {
        queryClient.removeQueries({ queryKey: detailKey(id) });
        queryClient.invalidateQueries({ queryKey: listKey });
      }
    });
  };

  const invalidateEntity = useCallback((id) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: detailKey(id) });
    } else {
      queryClient.invalidateQueries({ queryKey: listKey });
    }
  }, [queryClient]);

  return {
    useListEntities,
    useGetEntity,
    useCreateEntity,
    useUpdateEntity,
    useDeleteEntity,
    invalidateEntity
  };
}