/**
 * Offline Status Display Component
 * Shows offline indicator and sync status
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { useSyncQueue } from './SyncQueue';

export default function OfflineStatusDisplay() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { queue, syncing, syncError, pendingCount, processQueue } = useSyncQueue();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && pendingCount === 0) {
    return null; // No indicator when online and synced
  }

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 max-w-sm">
      {!isOnline && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-yellow-900 dark:text-yellow-100 text-sm">
              You're offline
            </p>
            <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
              Changes will sync when you're back online
            </p>
          </div>
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 flex items-start gap-3">
          {syncing ? (
            <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
          ) : (
            <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">
              {syncing ? 'Syncing changes...' : `${pendingCount} pending change${pendingCount !== 1 ? 's' : ''}`}
            </p>
            {!syncing && pendingCount > 0 && (
              <button
                onClick={processQueue}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
              >
                Sync now
              </button>
            )}
          </div>
        </div>
      )}

      {syncError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 flex items-start gap-3 mt-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-red-900 dark:text-red-100 text-sm">
              Sync error
            </p>
            <p className="text-xs text-red-800 dark:text-red-200 mt-1">
              {syncError}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}