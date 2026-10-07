/**
 * useNotification Hook
 * Trigger notifications programmatically
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useNotification(workspaceId, userId) {
  const queryClient = useQueryClient();

  const notify = useCallback(
    async ({
      title,
      message,
      type = 'info',
      actionUrl = null,
      actionLabel = null,
      icon = null,
    }) => {
      if (!workspaceId || !userId) return null;

      try {
        const notification = await base44.entities.Notification.create({
          workspace_id: workspaceId,
          user_id: userId,
          title,
          message,
          type,
          action_url: actionUrl,
          action_label: actionLabel,
          icon,
          is_read: false,
        });

        // Invalidate notifications query
        queryClient.invalidateQueries({ queryKey: ['notifications', workspaceId, userId] });

        // Send push if subscribed
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            if (registration.pushManager) {
              const subscription = await registration.pushManager.getSubscription();
              if (subscription) {
                // Trigger push notification
                if (registration.showNotification) {
                  registration.showNotification(title, {
                    body: message,
                    icon: icon || '/icon-192.png',
                    tag: notification.id,
                    requireInteraction: type === 'warning' || type === 'error',
                  });
                }
              }
            }
          } catch (err) {
            console.warn('Push notification failed:', err);
          }
        }

        return notification;
      } catch (err) {
        console.error('Notification creation failed:', err);
        return null;
      }
    },
    [workspaceId, userId, queryClient]
  );

  return { notify };
}