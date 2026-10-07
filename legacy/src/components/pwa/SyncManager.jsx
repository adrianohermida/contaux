/**
 * Background Sync Manager
 * Gerencia fila de operações offline e sincronização automática
 */

import { useEffect, useRef, useCallback } from 'react';

const SYNC_QUEUE_KEY = 'sync-queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Hook para gerenciar sincronização em background
 */
export function useSyncManager() {
  const queueRef = useRef([]);
  const processingRef = useRef(false);

  // Carregar fila do localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem(SYNC_QUEUE_KEY);
    if (savedQueue) {
      try {
        queueRef.current = JSON.parse(savedQueue);
      } catch (e) {
        console.error('Erro ao carregar fila de sincronização:', e);
      }
    }
  }, []);

  // Salvar fila no localStorage
  const saveQueue = useCallback(() => {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queueRef.current));
  }, []);

  // Adicionar operação à fila
  const addToQueue = useCallback((operation) => {
    queueRef.current.push({
      id: `${Date.now()}-${Math.random()}`,
      ...operation,
      retries: 0,
      createdAt: new Date().toISOString(),
    });
    saveQueue();
  }, [saveQueue]);

  // Processar fila
  const processQueue = useCallback(async () => {
    if (processingRef.current || !navigator.onLine) {
      return;
    }

    processingRef.current = true;

    while (queueRef.current.length > 0) {
      const operation = queueRef.current[0];

      try {
        // Executar operação
        if (operation.type === 'create' || operation.type === 'update') {
          await fetch(operation.url, {
            method: operation.method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(operation.data),
          });
        }

        // Remover da fila após sucesso
        queueRef.current.shift();
        saveQueue();
      } catch (error) {
        // Incrementar tentativas
        operation.retries = (operation.retries || 0) + 1;

        if (operation.retries >= MAX_RETRIES) {
          queueRef.current.shift();
          console.error(`Operação falhou após ${MAX_RETRIES} tentativas:`, operation);
        }

        saveQueue();
        break;
      }

      // Aguardar entre requisições
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    processingRef.current = false;
  }, [saveQueue]);

  // Sincronizar quando voltar online
  useEffect(() => {
    const handleOnline = () => {
      processQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [processQueue]);

  // Tentar sincronizar periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      processQueue();
    }, RETRY_DELAY);

    return () => clearInterval(interval);
  }, [processQueue]);

  return {
    addToQueue,
    processQueue,
    queueSize: queueRef.current.length,
  };
}

/**
 * Componente para exibir status da fila de sincronização
 * ✅ Dark mode, ARIA live region, network-first strategy indicator
 */
export function SyncStatus() {
  const { queueSize } = useSyncManager();

  if (queueSize === 0) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-40 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2 shadow-lg transition-colors"
      role="status"
      aria-live="polite"
      aria-label={`${queueSize} operação${queueSize > 1 ? 's' : ''} pendente${queueSize > 1 ? 's' : ''} de sincronização`}
    >
      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" aria-hidden="true" />
      <span>{queueSize} operação{queueSize > 1 ? 's' : ''} pendente{queueSize > 1 ? 's' : ''}</span>
    </div>
  );
}