import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Offline Indicator - Mostra status online/offline
 */
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  if (isOnline) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-300 dark:border-amber-700 p-3 sm:p-4 flex items-center justify-center gap-3"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <WifiOff className="w-5 h-5 sm:w-4 sm:h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm sm:text-base font-medium text-amber-800 dark:text-amber-200">
        Você está offline. Algumas funcionalidades podem não estar disponíveis.
      </span>
    </div>
  );
}