import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook para Sync Batching
 * Agrupa múltiplas operações em um único envio
 */
export function useSyncBatcher(onBatchReady, batchSize = 10, batchTimeout = 1000) {
  const batchRef = useRef([]);
  const timerRef = useRef(null);

  const flush = useCallback(() => {
    if (batchRef.current.length > 0) {
      onBatchReady(batchRef.current);
      batchRef.current = [];
    }
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [onBatchReady]);

  const add = useCallback((item) => {
    batchRef.current.push(item);

    // Flush se atingiu o tamanho máximo
    if (batchRef.current.length >= batchSize) {
      flush();
      return;
    }

    // Schedule flush se timeout não está ativo
    if (!timerRef.current) {
      timerRef.current = setTimeout(flush, batchTimeout);
    }
  }, [batchSize, batchTimeout, flush]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { add, flush, pending: batchRef.current.length };
}