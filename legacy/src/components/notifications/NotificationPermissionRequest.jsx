/**
 * Notification Permission Request Component
 * Request user permission for push notifications
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { useNotificationPermission } from '../hooks/useNotificationPermission';

export default function NotificationPermissionRequest({
  onPermissionGranted,
  dismissible = true,
}) {
  const { permission, isSupported, requestPermission } = useNotificationPermission();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isSupported || isDismissed || permission === 'granted') {
    return null;
  }

  const handleRequest = async () => {
    const granted = await requestPermission();
    if (granted && onPermissionGranted) {
      onPermissionGranted();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 flex items-center gap-4">
      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      
      <div className="flex-1">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200">
          Stay Updated
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          Get notifications for important updates and messages.
        </p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          onClick={handleRequest}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Enable
        </Button>
        {dismissible && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-blue-600 dark:text-blue-400"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}