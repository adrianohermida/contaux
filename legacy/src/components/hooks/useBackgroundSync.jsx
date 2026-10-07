/**
 * useBackgroundSync Hook
 * Background Sync API for offline operations
 */

import { useEffect, useCallback, useState } from 'react';

export function useBackgroundSync() {
  const [syncState, setSyncState] = useState('idle'); // idle, syncing, success, error
  const [error, setError] = useState(null);

  // Register background sync
  const registerSync = useCallback(async (tag, handler) => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.warn('Background Sync not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);

      // Listen for sync events
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_SUCCESS' && event.data.tag === tag) {
          setSyncState('success');
          setTimeout(() => setSyncState('idle'), 2000);
        } else if (event.data.type === 'SYNC_ERROR' && event.data.tag === tag) {
          setSyncState('error');
          setError(event.data.error);
        }
      });
    } catch (err) {
      setError(err.message);
      setSyncState('error');
    }
  }, []);

  // Trigger sync manually
  const triggerSync = useCallback(async (tag) => {
    setSyncState('syncing');
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
    } catch (err) {
      setError(err.message);
      setSyncState('error');
    }
  }, []);

  const resetState = useCallback(() => {
    setSyncState('idle');
    setError(null);
  }, []);

  return {
    syncState,
    error,
    registerSync,
    triggerSync,
    resetState,
    isSupported: 'serviceWorker' in navigator && 'SyncManager' in window,
  };
}

export default useBackgroundSync;