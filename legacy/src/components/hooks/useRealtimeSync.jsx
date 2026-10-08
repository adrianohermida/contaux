/**
 * useRealtimeSync Hook
 * Real-time data synchronization with conflict resolution
 */

import { useState, useCallback, useEffect } from 'react';

export function useRealtimeSync() {
  const [syncState, setSyncState] = useState({
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    conflicts: [],
    activeUsers: [],
  });

  const [data, setData] = useState({});
  const [changeLog, setChangeLog] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);

  // Track local changes
  const trackChange = useCallback((key, value, userId) => {
    const change = {
      id: Date.now() + Math.random(),
      key,
      value,
      userId,
      timestamp: Date.now(),
      synced: false,
    };

    setChangeLog((prev) => [change, ...prev]);
    setPendingChanges((prev) => [...prev, change]);
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Sync with remote
  const syncWithRemote = useCallback(async (remoteData) => {
    setSyncState((prev) => ({ ...prev, isSyncing: true }));

    try {
      // Detect conflicts
      const conflicts = [];
      pendingChanges.forEach((local) => {
        if (remoteData[local.key] && remoteData[local.key].value !== local.value) {
          conflicts.push({
            key: local.key,
            local: local.value,
            remote: remoteData[local.key].value,
            timestamp: Date.now(),
          });
        }
      });

      setSyncState((prev) => ({
        ...prev,
        conflicts,
        isSyncing: false,
        lastSync: new Date(),
      }));

      // Merge changes (remote takes precedence by default)
      const merged = { ...data };
      Object.entries(remoteData).forEach(([key, val]) => {
        merged[key] = val.value;
      });

      setData(merged);

      // Clear synced changes
      setPendingChanges([]);

      return { conflicts, merged };
    } catch (error) {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, [data, pendingChanges]);

  // Resolve conflict
  const resolveConflict = useCallback((key, resolution) => {
    setSyncState((prev) => ({
      ...prev,
      conflicts: prev.conflicts.filter((c) => c.key !== key),
    }));

    setData((prev) => ({
      ...prev,
      [key]: resolution === 'local' ? prev[key] : syncState.conflicts.find((c) => c.key === key)?.remote,
    }));
  }, [syncState.conflicts]);

  // Broadcast presence
  const updatePresence = useCallback((userId, info) => {
    setSyncState((prev) => {
      const others = prev.activeUsers.filter((u) => u.id !== userId);
      return {
        ...prev,
        activeUsers: [{ id: userId, ...info, lastSeen: Date.now() }, ...others],
      };
    });
  }, []);

  // Get sync status
  const getSyncStatus = useCallback(() => {
    return {
      ...syncState,
      pendingChanges: pendingChanges.length,
      changeLogSize: changeLog.length,
    };
  }, [syncState, pendingChanges, changeLog]);

  // Cleanup offline changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setChangeLog((prev) => prev.slice(0, 100)); // Keep only last 100 changes
    }, 60000);

    return () => clearTimeout(timeout);
  }, []);

  // Handle online/offline
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

  return {
    data,
    syncState,
    changeLog,
    pendingChanges,
    trackChange,
    syncWithRemote,
    resolveConflict,
    updatePresence,
    getSyncStatus,
  };
}

export default useRealtimeSync;