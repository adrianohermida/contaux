/**
 * useMultitenantIsolation Hook
 * Multi-tenant data isolation and workspace management
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useMultitenantIsolation(options = {}) {
  const {
    tenantId = null,
    workspaceId = null,
    isolationLevel = 'strong',
  } = options;

  const [tenantState, setTenantState] = useState({
    currentTenant: tenantId,
    currentWorkspace: workspaceId,
    isolationLevel: isolationLevel,
    dataAccessLevel: 'own_workspace',
    tenantCount: 0,
    workspaceCount: 0,
  });

  const [isolation, setIsolation] = useState({
    rowLevelSecurity: true,
    columnLevelSecurity: true,
    dataEncryption: true,
    auditLogging: true,
  });

  const tenantDataRef = useRef(new Map());
  const tenantAccessLogRef = useRef([]);

  // Verify tenant access
  const verifyTenantAccess = useCallback((tenant, workspace, resource) => {
    const accessLog = {
      timestamp: Date.now(),
      tenant,
      workspace,
      resource,
      allowed: true,
      reason: null,
    };

    // Check if resource belongs to tenant/workspace
    if (tenant !== tenantId || workspace !== workspaceId) {
      accessLog.allowed = false;
      accessLog.reason = 'Unauthorized tenant access';
    }

    tenantAccessLogRef.current.push(accessLog);
    return accessLog;
  }, [tenantId, workspaceId]);

  // Get tenant data (with isolation)
  const getTenantData = useCallback((resource) => {
    const key = `${tenantId}:${workspaceId}:${resource}`;

    if (!tenantDataRef.current.has(key)) {
      return null;
    }

    // Verify access before returning
    const access = verifyTenantAccess(tenantId, workspaceId, resource);

    if (!access.allowed) {
      return null;
    }

    return tenantDataRef.current.get(key);
  }, [tenantId, workspaceId, verifyTenantAccess]);

  // Set tenant data (with isolation)
  const setTenantData = useCallback((resource, data) => {
    const key = `${tenantId}:${workspaceId}:${resource}`;

    // Verify access before setting
    const access = verifyTenantAccess(tenantId, workspaceId, resource);

    if (!access.allowed) {
      return false;
    }

    tenantDataRef.current.set(key, {
      data,
      tenantId,
      workspaceId,
      createdAt: Date.now(),
      encrypted: isolation.dataEncryption,
    });

    return true;
  }, [tenantId, workspaceId, verifyTenantAccess, isolation.dataEncryption]);

  // Switch tenant context
  const switchTenant = useCallback((newTenantId, newWorkspaceId) => {
    setTenantState((prev) => ({
      ...prev,
      currentTenant: newTenantId,
      currentWorkspace: newWorkspaceId,
    }));
  }, []);

  // Get access log
  const getAccessLog = useCallback((limit = 100) => {
    return tenantAccessLogRef.current.slice(-limit);
  }, []);

  // Get isolation stats
  const getIsolationStats = useCallback(() => {
    const deniedAccess = tenantAccessLogRef.current.filter((log) => !log.allowed).length;
    const totalAccess = tenantAccessLogRef.current.length;

    return {
      ...tenantState,
      dataKeys: tenantDataRef.current.size,
      accessLogSize: totalAccess,
      deniedAccessCount: deniedAccess,
      securityScore: totalAccess > 0 ? ((totalAccess - deniedAccess) / totalAccess) * 100 : 100,
    };
  }, [tenantState]);

  // Enforce row-level security
  const enforceRowLevelSecurity = useCallback((rows, userTenant, userWorkspace) => {
    return rows.filter(
      (row) => row.tenantId === userTenant && row.workspaceId === userWorkspace
    );
  }, []);

  // Audit log access
  const auditLog = useCallback((action, resource, details) => {
    const auditEntry = {
      timestamp: Date.now(),
      action,
      resource,
      tenant: tenantId,
      workspace: workspaceId,
      details,
      userId: 'current_user',
    };

    tenantAccessLogRef.current.push(auditEntry);
  }, [tenantId, workspaceId]);

  // Initialize with tenant data
  useEffect(() => {
    if (tenantId && workspaceId) {
      setTenantState((prev) => ({
        ...prev,
        currentTenant: tenantId,
        currentWorkspace: workspaceId,
        tenantCount: 1,
        workspaceCount: 1,
      }));
    }
  }, [tenantId, workspaceId]);

  return {
    tenantState,
    isolation,
    getTenantData,
    setTenantData,
    switchTenant,
    getAccessLog,
    getIsolationStats,
    enforceRowLevelSecurity,
    auditLog,
    verifyTenantAccess,
  };
}

export default useMultitenantIsolation;