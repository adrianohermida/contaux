/**
 * useAuditLog Hook
 * Log user actions for compliance and security
 */

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useAuditLog(workspaceId) {
  const queryClient = useQueryClient();

  // Fetch audit logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs', workspaceId],
    queryFn: async () => {
      // In production, fetch from base44.entities.AuditLog
      return [];
    },
    enabled: !!workspaceId,
  });

  // Log action mutation
  const logActionMutation = useMutation({
    mutationFn: async (logData) => {
      // In production, save to base44.entities.AuditLog
      const auditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        workspace_id: workspaceId,
        timestamp: new Date().toISOString(),
        user_email: logData.userEmail,
        action: logData.action,
        entity_type: logData.entityType,
        entity_id: logData.entityId,
        entity_name: logData.entityName,
        old_values: logData.oldValues,
        new_values: logData.newValues,
        ip_address: logData.ipAddress || 'unknown',
        user_agent: logData.userAgent || navigator.userAgent,
        status: logData.status || 'success',
        reason_denied: logData.reasonDenied,
      };

      return auditEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs', workspaceId] });
    },
  });

  // Log action
  const logAction = useCallback(
    async (action, entityType, entityId, options = {}) => {
      logActionMutation.mutate({
        action,
        entityType,
        entityId,
        entityName: options.entityName,
        userEmail: options.userEmail,
        oldValues: options.oldValues,
        newValues: options.newValues,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        status: options.status || 'success',
        reasonDenied: options.reasonDenied,
      });
    },
    [logActionMutation]
  );

  // Log create action
  const logCreate = useCallback(
    (entityType, entityId, entityName, newValues, userEmail) => {
      logAction('create', entityType, entityId, {
        entityName,
        userEmail,
        newValues,
      });
    },
    [logAction]
  );

  // Log update action
  const logUpdate = useCallback(
    (entityType, entityId, entityName, oldValues, newValues, userEmail) => {
      logAction('update', entityType, entityId, {
        entityName,
        userEmail,
        oldValues,
        newValues,
      });
    },
    [logAction]
  );

  // Log delete action
  const logDelete = useCallback(
    (entityType, entityId, entityName, oldValues, userEmail) => {
      logAction('delete', entityType, entityId, {
        entityName,
        userEmail,
        oldValues,
      });
    },
    [logAction]
  );

  // Log export action
  const logExport = useCallback(
    (entityType, count, userEmail) => {
      logAction('export', entityType, 'bulk', {
        entityName: `${count} records`,
        userEmail,
      });
    },
    [logAction]
  );

  // Log login action
  const logLogin = useCallback(
    (userEmail, ipAddress) => {
      logAction('login', 'user', userEmail, {
        entityName: userEmail,
        userEmail,
        ipAddress,
      });
    },
    [logAction]
  );

  // Log logout action
  const logLogout = useCallback(
    (userEmail, ipAddress) => {
      logAction('logout', 'user', userEmail, {
        entityName: userEmail,
        userEmail,
        ipAddress,
      });
    },
    [logAction]
  );

  // Get logs for entity
  const getEntityLogs = useCallback(
    (entityType, entityId) => {
      return auditLogs.filter(
        (log) => log.entity_type === entityType && log.entity_id === entityId
      );
    },
    [auditLogs]
  );

  // Get logs for user
  const getUserLogs = useCallback(
    (userEmail) => {
      return auditLogs.filter((log) => log.user_email === userEmail);
    },
    [auditLogs]
  );

  // Get logs by action
  const getActionLogs = useCallback(
    (action) => {
      return auditLogs.filter((log) => log.action === action);
    },
    [auditLogs]
  );

  // Get logs by date range
  const getLogsByDateRange = useCallback(
    (startDate, endDate) => {
      return auditLogs.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });
    },
    [auditLogs]
  );

  return {
    auditLogs,
    logAction,
    logCreate,
    logUpdate,
    logDelete,
    logExport,
    logLogin,
    logLogout,
    getEntityLogs,
    getUserLogs,
    getActionLogs,
    getLogsByDateRange,
    isLoading: logActionMutation.isPending,
  };
}

export default useAuditLog;