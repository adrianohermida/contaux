import { useCallback, useRef, useState } from 'react';

/**
 * Hook para state otimizado com batching
 * Agrupa múltiplas updates em uma única render
 */
export function useOptimizedState(initialState) {
  const [state, setState] = useState(initialState);
  const batchRef = useRef({});
  const timerRef = useRef(null);

  const batchUpdate = useCallback((updates) => {
    batchRef.current = { ...batchRef.current, ...updates };

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Batch updates within 16ms (one frame)
    timerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...batchRef.current }));
      batchRef.current = {};
    }, 16);
  }, []);

  const immediateUpdate = useCallback((updates) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    batchRef.current = {};
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return [state, batchUpdate, immediateUpdate];
}