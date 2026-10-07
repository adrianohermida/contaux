import { useEffect, useRef, useState } from 'react';
import wsService from '../services/WebSocketService';

/**
 * Hook para detectar e resolver conflitos de edição multi-usuário
 */
export function useMultiUserSync(entityId, entityName, workspaceId) {
  const [conflict, setConflict] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const localVersionRef = useRef(0);

  useEffect(() => {
    if (!workspaceId || !entityId) return;

    wsService.connect(workspaceId);

    // Notificar que este usuário está editando
    wsService.send('entity:lock', {
      entity: entityName,
      entity_id: entityId,
      action: 'lock'
    });

    // Escutar bloqueios de outros usuários
    const unsubscribeLock = wsService.on('entity:lock', (payload) => {
      if (payload.entity_id === entityId) {
        setActiveUsers(prev => 
          payload.action === 'lock'
            ? [...prev, payload.user_id]
            : prev.filter(u => u !== payload.user_id)
        );
      }
    });

    // Detectar conflitos
    const unsubscribeConflict = wsService.on(`conflict:${entityId}`, (payload) => {
      setConflict({
        version: payload.version,
        remoteData: payload.data,
        remoteUser: payload.user_id,
        timestamp: payload.timestamp
      });
    });

    return () => {
      unsubscribeLock();
      unsubscribeConflict();
      wsService.send('entity:lock', {
        entity: entityName,
        entity_id: entityId,
        action: 'unlock'
      });
    };
  }, [entityId, entityName, workspaceId]);

  const resolveConflict = (strategy = 'local') => {
    wsService.send('conflict:resolve', {
      entity_id: entityId,
      strategy,
      local_version: localVersionRef.current
    });
    setConflict(null);
  };

  return {
    conflict,
    activeUsers,
    resolveConflict,
    hasConflict: !!conflict
  };
}