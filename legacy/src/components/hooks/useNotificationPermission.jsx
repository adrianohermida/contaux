/**
 * useNotificationPermission Hook
 * Manage browser notification permissions
 */

import { useState, useCallback, useEffect } from 'react';

export function useNotificationPermission() {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  // Check support and current permission
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      setIsDenied(Notification.permission === 'denied');
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      setIsDenied(true);
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setIsDenied(result === 'denied');
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Check if can send notifications
  const canNotify = useCallback(() => {
    return isSupported && permission === 'granted';
  }, [isSupported, permission]);

  return {
    permission,
    isSupported,
    isDenied,
    requestPermission,
    canNotify,
  };
}

export default useNotificationPermission;