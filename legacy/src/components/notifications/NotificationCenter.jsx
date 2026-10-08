/**
 * Notification Center
 * Dashboard for managing all notifications
 */

import React, { useState, useMemo } from 'react';
import { Loader2, Trash2, CheckCircle, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TYPE_CONFIG = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  warning: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
};

export default function NotificationCenter({ workspaceId, userId }) {
  const [filter, setFilter] = useState('unread'); // 'unread', 'read', 'all'
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: allNotifications = [], isLoading } = useQuery({
    queryKey: ['notifications', workspaceId, userId],
    queryFn: async () => {
      return await base44.entities.Notification.filter({
        workspace_id: workspaceId,
        user_id: userId,
      });
    },
    enabled: !!workspaceId && !!userId,
  });

  // Filter notifications
  const notifications = useMemo(() => {
    let filtered = allNotifications;

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [allNotifications, filter]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) =>
      base44.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', workspaceId, userId] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', workspaceId, userId] });
    },
  });

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadIds = allNotifications.filter(n => !n.is_read).map(n => n.id);
    for (const id of unreadIds) {
      await base44.entities.Notification.update(id, { is_read: true });
    }
    queryClient.invalidateQueries({ queryKey: ['notifications', workspaceId, userId] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span>Carregando notificações...</span>
      </div>
    );
  }

  const unreadCount = allNotifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Centro de Notificações
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Marcar todas como lidas"
          >
            <CheckCheck className="w-4 h-4" aria-hidden="true" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['unread', 'read', 'all'].map(tab => (
          <Button
            key={tab}
            onClick={() => setFilter(tab)}
            variant={filter === tab ? 'default' : 'outline'}
            size="sm"
            className="capitalize"
          >
            {tab === 'unread' && `Não Lidas (${unreadCount})`}
            {tab === 'read' && `Lidas (${allNotifications.filter(n => n.is_read).length})`}
            {tab === 'all' && `Todas (${allNotifications.length})`}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhuma notificação nesta categoria
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => {
            const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.is_read
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    : `${config.bg} border-slate-200 dark:border-slate-700`
                }`}
                role="article"
              >
                <div className="flex gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${config.color}`} aria-hidden="true" />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 break-words">
                      {notification.message}
                    </p>

                    {notification.action_url && notification.action_label && (
                      <a
                        href={notification.action_url}
                        className="inline-block text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-2 underline"
                      >
                        {notification.action_label}
                      </a>
                    )}

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {format(new Date(notification.created_date), 'dd MMM, HH:mm', { locale: ptBR })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    {!notification.is_read && (
                      <Button
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={markAsReadMutation.isPending}
                        aria-label="Marcar como lida"
                        title="Marcar como lida"
                      >
                        <CheckCircle className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteMutation.mutate(notification.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={deleteMutation.isPending}
                      aria-label="Deletar notificação"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}