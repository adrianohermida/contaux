/**
 * useSmartNotifications Hook
 * Smart, context-aware notification system
 */

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useSmartNotifications(workspaceId) {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications
  const { data: storedNotifications = [] } = useQuery({
    queryKey: ['notifications', workspaceId],
    queryFn: async () => {
      // In production, fetch from base44.entities.Notification
      return [];
    },
    enabled: !!workspaceId,
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData) => {
      const notification = {
        id: Math.random().toString(36).substr(2, 9),
        workspace_id: workspaceId,
        ...notificationData,
        created_at: new Date().toISOString(),
        status: 'unread',
        read_at: null,
      };
      return notification;
    },
    onSuccess: (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['notifications', workspaceId] });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      return { id: notificationId, status: 'read', read_at: new Date().toISOString() };
    },
    onSuccess: (updated) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
      );
      queryClient.invalidateQueries({ queryKey: ['notifications', workspaceId] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      return notificationId;
    },
    onSuccess: (deletedId) => {
      setNotifications((prev) => prev.filter((n) => n.id !== deletedId));
      queryClient.invalidateQueries({ queryKey: ['notifications', workspaceId] });
    },
  });

  // Send smart notification
  const sendSmartNotification = useCallback(
    (title, message, type = 'info', options = {}) => {
      const notification = {
        title,
        message,
        type, // 'info', 'success', 'warning', 'error'
        priority: options.priority || 'normal', // 'low', 'normal', 'high', 'urgent'
        channel: options.channel || 'in-app', // 'in-app', 'email', 'push'
        action_url: options.action_url || null,
        action_label: options.action_label || null,
        expires_at: options.expires_at || null,
      };

      createNotificationMutation.mutate(notification);
      return notification.id;
    },
    [createNotificationMutation]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    (notificationId) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  // Delete notification
  const deleteNotification = useCallback(
    (notificationId) => {
      deleteNotificationMutation.mutate(notificationId);
    },
    [deleteNotificationMutation]
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    notifications
      .filter((n) => n.status === 'unread')
      .forEach((n) => markAsRead(n.id));
  }, [notifications, markAsRead]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => n.status === 'unread').length;
  }, [notifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications]
  );

  // Get notifications by priority
  const getNotificationsByPriority = useCallback(
    (priority) => {
      return notifications.filter((n) => n.priority === priority);
    },
    [notifications]
  );

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => n.status === 'unread').length,
      read: notifications.filter((n) => n.status === 'read').length,
      byType: {
        info: notifications.filter((n) => n.type === 'info').length,
        success: notifications.filter((n) => n.type === 'success').length,
        warning: notifications.filter((n) => n.type === 'warning').length,
        error: notifications.filter((n) => n.type === 'error').length,
      },
      byPriority: {
        low: notifications.filter((n) => n.priority === 'low').length,
        normal: notifications.filter((n) => n.priority === 'normal').length,
        high: notifications.filter((n) => n.priority === 'high').length,
        urgent: notifications.filter((n) => n.priority === 'urgent').length,
      },
    };
  }, [notifications]);

  // Get smart suggestions for notifications
  const getSmartSuggestions = useCallback((context = {}) => {
    const suggestions = [];

    if (context.newContact) {
      suggestions.push({
        id: 'welcome-contact',
        type: 'info',
        title: 'New Contact Added',
        message: `Welcome ${context.newContact.name || 'new contact'}!`,
        priority: 'normal',
      });
    }

    if (context.overdueInvoice) {
      suggestions.push({
        id: 'overdue-alert',
        type: 'warning',
        title: 'Overdue Invoice',
        message: `Invoice #${context.overdueInvoice.number} is overdue`,
        priority: 'high',
      });
    }

    if (context.paymentReceived) {
      suggestions.push({
        id: 'payment-received',
        type: 'success',
        title: 'Payment Received',
        message: `Payment of ${context.paymentReceived.amount} received`,
        priority: 'normal',
      });
    }

    if (context.opportunityClose) {
      suggestions.push({
        id: 'deal-closing',
        type: 'warning',
        title: 'Deal Closing Soon',
        message: `${context.opportunityClose.name} closing in ${context.opportunityClose.days} days`,
        priority: 'high',
      });
    }

    return suggestions;
  }, []);

  return {
    notifications: notifications.length > 0 ? notifications : storedNotifications,
    sendSmartNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    getUnreadCount,
    getNotificationsByType,
    getNotificationsByPriority,
    getNotificationStats,
    getSmartSuggestions,
    isLoading: createNotificationMutation.isPending,
  };
}

export default useSmartNotifications;