/**
 * useAlertScheduler Hook
 * Schedule alerts at specific times or intervals
 */

import { useCallback, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useAlertScheduler(workspaceId) {
  const queryClient = useQueryClient();
  const [scheduledAlerts, setScheduledAlerts] = useState([]);
  const [activeTimers, setActiveTimers] = useState(new Map());

  // Fetch scheduled alerts
  const { data: storedAlerts = [] } = useQuery({
    queryKey: ['scheduled-alerts', workspaceId],
    queryFn: async () => {
      // In production, fetch from database
      return [];
    },
    enabled: !!workspaceId,
  });

  // Create scheduled alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData) => {
      const alert = {
        id: Math.random().toString(36).substr(2, 9),
        workspace_id: workspaceId,
        ...alertData,
        created_at: new Date().toISOString(),
        status: 'scheduled',
        executed_at: null,
      };
      return alert;
    },
    onSuccess: (newAlert) => {
      setScheduledAlerts((prev) => [...prev, newAlert]);
      queryClient.invalidateQueries({ queryKey: ['scheduled-alerts', workspaceId] });
    },
  });

  // Schedule alert at specific time
  const scheduleAlertAt = useCallback(
    (title, message, scheduledTime, options = {}) => {
      const now = new Date().getTime();
      const scheduleTime = new Date(scheduledTime).getTime();
      const delay = scheduleTime - now;

      if (delay <= 0) {
        console.warn('Scheduled time is in the past');
        return null;
      }

      const alertId = Math.random().toString(36).substr(2, 9);

      createAlertMutation.mutate({
        title,
        message,
        scheduled_time: scheduledTime,
        type: options.type || 'info',
        priority: options.priority || 'normal',
        recurrence: options.recurrence || null, // null, 'daily', 'weekly', 'monthly'
      });

      // Set timer
      const timer = setTimeout(() => {
        // Alert triggered callback
        if (options.onAlertTriggered) {
          options.onAlertTriggered({
            id: alertId,
            title,
            message,
          });
        }

        // Clean up timer
        setActiveTimers((prev) => {
          const next = new Map(prev);
          next.delete(alertId);
          return next;
        });
      }, delay);

      setActiveTimers((prev) => new Map(prev).set(alertId, timer));

      return alertId;
    },
    [createAlertMutation]
  );

  // Schedule alert with interval
  const scheduleAlertEvery = useCallback(
    (title, message, interval, unit = 'minutes', options = {}) => {
      const intervalMs = {
        minutes: interval * 60 * 1000,
        hours: interval * 60 * 60 * 1000,
        days: interval * 24 * 60 * 60 * 1000,
      }[unit];

      if (!intervalMs) {
        console.warn('Invalid unit:', unit);
        return null;
      }

      const alertId = Math.random().toString(36).substr(2, 9);

      createAlertMutation.mutate({
        title,
        message,
        interval,
        interval_unit: unit,
        type: options.type || 'info',
        priority: options.priority || 'normal',
        recurrence: 'custom',
      });

      // Set recurring timer
      const timer = setInterval(() => {
        if (options.onAlertTriggered) {
          options.onAlertTriggered({
            id: alertId,
            title,
            message,
          });
        }
      }, intervalMs);

      setActiveTimers((prev) => new Map(prev).set(alertId, timer));

      return alertId;
    },
    [createAlertMutation]
  );

  // Cancel scheduled alert
  const cancelAlert = useCallback((alertId) => {
    setActiveTimers((prev) => {
      const next = new Map(prev);
      const timer = next.get(alertId);
      if (timer) {
        clearTimeout(timer);
        clearInterval(timer);
      }
      next.delete(alertId);
      return next;
    });

    setScheduledAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'cancelled' } : a))
    );
  }, []);

  // Get pending alerts
  const getPendingAlerts = useCallback(() => {
    return scheduledAlerts.filter((a) => a.status === 'scheduled');
  }, [scheduledAlerts]);

  // Get alert statistics
  const getAlertStats = useCallback(() => {
    return {
      total: scheduledAlerts.length,
      scheduled: scheduledAlerts.filter((a) => a.status === 'scheduled').length,
      executed: scheduledAlerts.filter((a) => a.status === 'executed').length,
      cancelled: scheduledAlerts.filter((a) => a.status === 'cancelled').length,
    };
  }, [scheduledAlerts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeTimers.forEach((timer) => {
        clearTimeout(timer);
        clearInterval(timer);
      });
    };
  }, []);

  return {
    scheduledAlerts: scheduledAlerts.length > 0 ? scheduledAlerts : storedAlerts,
    scheduleAlertAt,
    scheduleAlertEvery,
    cancelAlert,
    getPendingAlerts,
    getAlertStats,
    isLoading: createAlertMutation.isPending,
  };
}

export default useAlertScheduler;