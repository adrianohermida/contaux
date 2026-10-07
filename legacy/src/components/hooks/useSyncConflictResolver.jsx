import { useCallback } from 'react';

/**
 * Hook para resolver conflitos de sincronização
 * Strategy: Last-Write-Wins (LWW) com timestamp
 */
export function useSyncConflictResolver() {
  
  /**
   * Resolver conflito entre versão local e remota
   * Last-Write-Wins: a versão com timestamp mais recente vence
   */
  const resolveConflict = useCallback((localData, remoteData, strategy = 'lww') => {
    if (!localData || !remoteData) {
      return localData || remoteData;
    }

    if (strategy === 'lww') {
      // Last-Write-Wins
      const localTime = new Date(localData.updated_date || localData.created_date).getTime();
      const remoteTime = new Date(remoteData.updated_date || remoteData.created_date).getTime();
      
      return remoteTime > localTime ? remoteData : localData;
    }

    if (strategy === 'local-priority') {
      // Priorizar local
      return localData;
    }

    if (strategy === 'remote-priority') {
      // Priorizar remoto
      return remoteData;
    }

    if (strategy === 'merge') {
      // Merge inteligente
      return {
        ...remoteData,
        ...localData,
        _merged: true,
        _conflict: true
      };
    }

    return remoteData;
  }, []);

  /**
   * Detectar conflito
   */
  const hasConflict = useCallback((localData, remoteData) => {
    if (!localData || !remoteData) return false;

    const localTime = new Date(localData.updated_date || localData.created_date).getTime();
    const remoteTime = new Date(remoteData.updated_date || remoteData.created_date).getTime();
    
    // Considerar conflito se ambas foram modificadas em intervalos próximos
    return Math.abs(remoteTime - localTime) < 5000; // 5 segundos
  }, []);

  return { resolveConflict, hasConflict };
}