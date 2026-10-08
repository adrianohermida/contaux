import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para Optimistic Updates
 * Atualiza UI imediatamente, depois confirma no servidor
 */
export function useOptimisticUpdate(queryKey, apiCall) {
  const queryClient = useQueryClient();
  const [optimisticData, setOptimisticData] = useState(null);
  const [error, setError] = useState(null);

  const update = useCallback(async (newData) => {
    // 1. Guardar dados atuais
    const previousData = queryClient.getQueryData(queryKey);
    
    try {
      // 2. Atualizar UI imediatamente
      setOptimisticData(newData);
      queryClient.setQueryData(queryKey, (old) => {
        if (Array.isArray(old)) {
          return old.map(item => 
            item.id === newData.id ? { ...item, ...newData } : item
          );
        }
        return { ...old, ...newData };
      });

      // 3. Chamar API
      const result = await apiCall(newData);

      // 4. Confirmar no servidor
      queryClient.setQueryData(queryKey, (old) => {
        if (Array.isArray(old)) {
          return old.map(item =>
            item.id === result.id ? result : item
          );
        }
        return result;
      });

      setOptimisticData(null);
      setError(null);
      return result;
    } catch (err) {
      // 5. Reverter em caso de erro
      queryClient.setQueryData(queryKey, previousData);
      setOptimisticData(null);
      setError(err);
      throw err;
    }
  }, [queryKey, queryClient, apiCall]);

  return { update, optimisticData, error };
}