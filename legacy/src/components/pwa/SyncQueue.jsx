/**
 * Sync Queue Manager
 * Manages offline mutations queue and sync when online
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const SYNC_STORE_NAME = 'sync_queue';

/**
 * Hook para gerenciar fila de sincronização offline
 */
export function useSyncQueue() {
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const queueRef = useRef([]);

  // Initialize queue from IndexedDB
  useEffect(() => {
    const initQueue = async () => {
      try {
        const db = await openDatabase();
        const stored = await getFromDB(db, SYNC_STORE_NAME);
        setQueue(stored || []);
        queueRef.current = stored || [];
      } catch (error) {
        console.error('Failed to load sync queue:', error);
      }
    };

    initQueue();

    // Listen for online/offline events
    const handleOnline = () => {
      processQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Add item to queue
  const addToQueue = useCallback(async (item) => {
    const newItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      retries: 0,
      maxRetries: 3,
      ...item,
    };

    try {
      const db = await openDatabase();
      await saveToDB(db, SYNC_STORE_NAME, newItem);
      
      const updated = [...queueRef.current, newItem];
      queueRef.current = updated;
      setQueue(updated);
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      throw error;
    }
  }, []);

  // Process queue
  const processQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    if (syncing) return;

    setSyncing(true);
    setSyncError(null);

    const pendingItems = queueRef.current.filter(item => item.status === 'pending');

    for (const item of pendingItems) {
      try {
        // Execute the mutation
        await base44.functions.invoke(item.functionName, item.payload);

        // Mark as synced
        item.status = 'synced';
        await updateQueueItem(item);
      } catch (error) {
        item.retries += 1;

        if (item.retries >= item.maxRetries) {
          item.status = 'failed';
          setSyncError(`Failed to sync: ${item.functionName}`);
        } else {
          item.status = 'pending';
        }

        await updateQueueItem(item);
      }
    }

    // Update state
    const updated = [...queueRef.current];
    queueRef.current = updated;
    setQueue(updated);

    setSyncing(false);
  }, []);

  // Update item in queue
  const updateQueueItem = useCallback(async (item) => {
    try {
      const db = await openDatabase();
      await saveToDB(db, SYNC_STORE_NAME, item);
    } catch (error) {
      console.error('Failed to update queue item:', error);
    }
  }, []);

  // Clear synced items
  const clearSynced = useCallback(async () => {
    try {
      const db = await openDatabase();
      const pending = queueRef.current.filter(item => item.status !== 'synced');
      
      // Delete synced items
      for (const item of queueRef.current.filter(i => i.status === 'synced')) {
        await deleteFromDB(db, SYNC_STORE_NAME, item.id);
      }

      queueRef.current = pending;
      setQueue(pending);
    } catch (error) {
      console.error('Failed to clear synced items:', error);
    }
  }, []);

  return {
    queue,
    syncing,
    syncError,
    addToQueue,
    processQueue,
    clearSynced,
    pendingCount: queue.filter(i => i.status === 'pending').length,
    failedCount: queue.filter(i => i.status === 'failed').length,
  };
}

// IndexedDB utilities
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('base44_app', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
        db.createObjectStore(SYNC_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

function saveToDB(db, storeName, item) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function getFromDB(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteFromDB(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export default useSyncQueue;