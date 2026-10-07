/**
 * Push Notification Manager Component
 * Centralized notification management
 */

import React, { useEffect, useState } from 'react';
import { usePushNotification } from '../hooks/usePushNotification';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import NotificationPermissionRequest from './NotificationPermissionRequest';

export default function PushNotificationManager() {
  const { notify, error: notifyError } = usePushNotification();
  const { permission, canNotify } = useNotificationPermission();
  const [notificationHistory, setNotificationHistory] = useState([]);

  // Listen for notification events
  useEffect(() => {
    if (!canNotify()) return;

    const handleNotificationClick = (event) => {
      event.notification.close();
      if (event.notification.data?.url) {
        window.location.href = event.notification.data.url;
      }
    };

    navigator.serviceWorker?.addEventListener('notificationclick', handleNotificationClick);

    return () => {
      navigator.serviceWorker?.removeEventListener('notificationclick', handleNotificationClick);
    };
  }, [canNotify]);

  // Track sent notifications
  const sendNotification = React.useCallback(async (options) => {
    const result = await notify(options);
    if (result) {
      setNotificationHistory(prev => [
        ...prev,
        { ...options, timestamp: new Date(), id: Math.random() }
      ]);
    }
    return result;
  }, [notify]);

  return (
    <div className="space-y-4">
      {/* Permission Request */}
      {permission !== 'granted' && (
        <NotificationPermissionRequest
          onPermissionGranted={() => {
            // Permission granted, can now send notifications
          }}
        />
      )}

      {/* Error Display */}
      {notifyError && (
        <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          Notification error: {notifyError}
        </div>
      )}

      {/* Notification History (optional) */}
      {notificationHistory.length > 0 && (
        <div className="p-3 rounded bg-slate-50 dark:bg-slate-900/20 space-y-2">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Recent Notifications
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {notificationHistory.slice(-3).map(notification => (
              <div
                key={notification.id}
                className="text-xs text-slate-600 dark:text-slate-400 p-2 rounded bg-white dark:bg-slate-800"
              >
                <div className="font-medium">{notification.title}</div>
                <div>{notification.body}</div>
                <div className="text-xs text-slate-500">
                  {notification.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export hook for external use
export function usePushNotificationManager() {
  const { notify } = usePushNotification();
  const { canNotify } = useNotificationPermission();

  const sendNotification = React.useCallback(async (options) => {
    if (!canNotify()) {
      console.warn('Notifications not enabled');
      return false;
    }
    return notify(options);
  }, [notify, canNotify]);

  return { sendNotification, canNotify };
}