import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para observer pattern com automatic cleanup
 * Evita memory leaks em subscriptions
 */
export function useObserverPattern() {
  const observersRef = useRef(new Map());

  const subscribe = useCallback((event, callback) => {
    if (!observersRef.current.has(event)) {
      observersRef.current.set(event, new Set());
    }
    observersRef.current.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      observersRef.current.get(event).delete(callback);
      if (observersRef.current.get(event).size === 0) {
        observersRef.current.delete(event);
      }
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (observersRef.current.has(event)) {
      observersRef.current.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Observer error for ${event}:`, err);
        }
      });
    }
  }, []);

  const useSubscribe = (event, callback) => {
    useEffect(() => {
      return subscribe(event, callback);
    }, [event, callback, subscribe]);
  };

  return {
    subscribe,
    emit,
    useSubscribe,
    cleanup: () => observersRef.current.clear()
  };
}