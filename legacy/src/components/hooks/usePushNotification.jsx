/**
 * usePushNotification Hook
 * Send and manage push notifications
 */

import { useCallback, useState } from 'react';

export function usePushNotification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Send notification
  const notify = useCallback(async (options = {}) => {
    const {
      title = 'Notification',
      body = '',
      icon = '/icon-192x192.png',
      badge = '/icon-192x192.png',
      tag = 'notification',
      requireInteraction = false,
      actions = [],
      data = {},
    } = options;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker?.ready;
      
      if (registration) {
        await registration.showNotification(title, {
          body,
          icon,
          badge,
          tag,
          requireInteraction,
          actions,
          data,
        });
      } else {
        // Fallback for non-service-worker environments
        if ('Notification' in window) {
          new Notification(title, {
            body,
            icon,
            tag,
          });
        }
      }

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Failed to send notification:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send notification with delay
  const notifyLater = useCallback((options, delayMs = 3000) => {
    setTimeout(() => notify(options), delayMs);
  }, [notify]);

  // Close all notifications with tag
  const closeNotification = useCallback((tag) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({
        type: 'CLOSE_NOTIFICATION',
        tag,
      });
    }
  }, []);

  return {
    notify,
    notifyLater,
    closeNotification,
    isLoading,
    error,
  };
}

export default usePushNotification;