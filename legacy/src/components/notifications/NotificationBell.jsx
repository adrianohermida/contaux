/**
 * Notification Bell Icon
 * Header notification indicator with badge
 */

import React from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function NotificationBell({ workspaceId, userId, onClick }) {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', workspaceId, userId],
    queryFn: async () => {
      return await base44.entities.Notification.filter({
        workspace_id: workspaceId,
        user_id: userId,
        is_read: false,
      });
    },
    enabled: !!workspaceId && !!userId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const unreadCount = notifications.length;
  const hasUnread = unreadCount > 0;

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="icon"
      className="relative min-h-[44px] min-w-[44px]"
      aria-label={`Notificações${hasUnread ? ` (${unreadCount} não lida)` : ''}`}
      title="Ver notificações"
    >
      <Bell className="w-5 h-5" aria-hidden="true" />

      {/* Badge */}
      {hasUnread && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full"
          aria-label={`${unreadCount} notificação não lida`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
}