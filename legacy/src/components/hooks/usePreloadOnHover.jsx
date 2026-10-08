import { useCallback } from 'react';

/**
 * Hook para pré-carregar componentes lazy ao hover
 * Reduz delay quando usuário interage com sidebar
 */
export function usePreloadOnHover(lazyComponent) {
  return useCallback(() => {
    // Trigger module loading by accessing the lazy component
    if (lazyComponent && lazyComponent._result === undefined) {
      lazyComponent.preload?.();
    }
  }, [lazyComponent]);
}