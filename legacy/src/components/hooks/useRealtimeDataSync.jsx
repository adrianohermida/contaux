/**
 * useRealtimeDataSync Hook
 * Real-time bidirectional data synchronization with conflict resolution and offline support
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useRealtimeDataSync(options = {}) {
  const {
    enableOfflineSupport = true,
    enableConflictResolution = true,
    batchSize = 50,
    syncInterval = 5000,
  } = options;

  const [syncState, setSyncState] = useState({
    isSyncing: false,
    lastSync: null,
    syncedItems: 0,
    failedItems: 0,
    conflictCount: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingChanges: 0,
  });

  const [changeHistory, setChangeHistory] = useState([]);
  const pendingQueue = useRef([]);
  const conflictQueue = useRef([]);
  const syncTimestamp = useRef(null);

  // Track network status
  useEffect(() => {
    const handleOnline = () => setSyncState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Record change with timestamp
  const recordChange = useCallback((entityId, action, data, metadata = {}) => {
    const change = {
      id: `${entityId}-${Date.now()}`,
      entityId,
      action, // 'create', 'update', 'delete'
      data,
      timestamp: Date.now(),
      synced: false,
      metadata,
    };

    pendingQueue.current.push(change);
    setChangeHistory((prev) => [change, ...prev.slice(0, 99)]);
    setSyncState((prev) => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1,
    }));

    return change;
  }, []);

  // Detect conflicts using timestamp + version comparison
  const detectConflict = useCallback((localChange, remoteChange) => {
    if (!enableConflictResolution) return false;

    // Conflict if both changed the same entity after the last sync
    if (
      localChange.entityId === remoteChange.entityId &&
      localChange.timestamp > (syncTimestamp.current || 0) &&
      remoteChange.timestamp > (syncTimestamp.current || 0)
    ) {
      return true;
    }
    return false;
  }, [enableConflictResolution]);

  // Resolve conflicts using last-write-wins strategy
  const resolveConflict = useCallback((localChange, remoteChange) => {
    const conflict = {
      id: `conflict-${Date.now()}`,
      localChange,
      remoteChange,
      resolvedAt: Date.now(),
      strategy: 'last-write-wins',
      winner: localChange.timestamp > remoteChange.timestamp ? 'local' : 'remote',
    };

    conflictQueue.current.push(conflict);
    setSyncState((prev) => ({
      ...prev,
      conflictCount: prev.conflictCount + 1,
    }));

    return conflict.winner === 'local' ? localChange : remoteChange;
  }, []);

  // Batch and sync changes
  const batchSync = useCallback(
    async (changes) => {
      const batches = [];
      for (let i = 0; i < changes.length; i += batchSize) {
        batches.push(changes.slice(i, i + batchSize));
      }

      let synced = 0;
      let failed = 0;

      for (const batch of batches) {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 100));
          synced += batch.length;
        } catch (error) {
          failed += batch.length;
        }
      }

      return { synced, failed };
    },
    [batchSize]
  );

  // Apply remote changes locally
  const applyRemoteChange = useCallback((remoteChange) => {
    // Check for conflicts
    const conflictingLocal = pendingQueue.current.find((change) =>
      detectConflict(change, remoteChange)
    );

    if (conflictingLocal) {
      const resolved = resolveConflict(conflictingLocal, remoteChange);
      return resolved;
    }

    return remoteChange;
  }, [detectConflict, resolveConflict]);

  // Perform sync operation
  const performSync = useCallback(async () => {
    if (!syncState.isOnline || syncState.isSyncing) return;

    setSyncState((prev) => ({ ...prev, isSyncing: true }));
    syncTimestamp.current = Date.now();

    try {
      const { synced, failed } = await batchSync(pendingQueue.current);

      // Clear synced items
      pendingQueue.current = pendingQueue.current.slice(synced);

      setSyncState((prev) => ({
        ...prev,
        syncedItems: prev.syncedItems + synced,
        failedItems: prev.failedItems + failed,
        pendingChanges: Math.max(0, prev.pendingChanges - synced),
        lastSync: new Date(),
        isSyncing: false,
      }));
    } catch (error) {
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        failedItems: prev.failedItems + pendingQueue.current.length,
      }));
    }
  }, [syncState.isOnline, syncState.isSyncing, batchSync]);

  // Optimistic update
  const optimisticUpdate = useCallback((entityId, data) => {
    const change = recordChange(entityId, 'update', data, { optimistic: true });
    return change;
  }, [recordChange]);

  // Get sync statistics
  const getSyncStats = useCallback(() => {
    return {
      ...syncState,
      pendingItems: pendingQueue.current.length,
      conflictItems: conflictQueue.current.length,
      totalChanges: changeHistory.length,
      successRate: syncState.syncedItems > 0 
        ? ((syncState.syncedItems / (syncState.syncedItems + syncState.failedItems)) * 100).toFixed(2)
        : 0,
    };
  }, [syncState, changeHistory]);

  // Auto-sync on interval
  useEffect(() => {
    if (!syncState.isOnline) return;

    const interval = setInterval(() => {
      if (pendingQueue.current.length > 0) {
        performSync();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [syncState.isOnline, syncInterval, performSync]);

  // Store pending changes in IndexedDB for offline support
  useEffect(() => {
    if (!enableOfflineSupport || typeof window === 'undefined') return;

    const db = indexedDB.open('SyncDB', 1);
    db.onupgradeneeded = (e) => {
      const store = e.target.result.createObjectStore('pending', { keyPath: 'id' });
      store.createIndex('entityId', 'entityId', { unique: false });
    };

    db.onsuccess = (e) => {
      const store = e.target.result.transaction('pending', 'readwrite').objectStore('pending');
      pendingQueue.current.forEach((change) => {
        store.put(change);
      });
    };
  }, [enableOfflineSupport, changeHistory]);

  return {
    recordChange,
    optimisticUpdate,
    performSync,
    applyRemoteChange,
    resolveConflict,
    getSyncStats,
    syncState,
    changeHistory,
    pendingQueue: pendingQueue.current,
    conflictQueue: conflictQueue.current,
  };
}

export default useRealtimeDataSync;