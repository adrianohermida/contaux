/**
 * useRBAC Hook
 * Role-based access control management
 */

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Default role definitions
const DEFAULT_ROLES = {
  admin: {
    name: 'Administrator',
    permissions: {
      users: ['create', 'read', 'update', 'delete'],
      roles: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete', 'export'],
      audit: ['read', 'export'],
      settings: ['read', 'update'],
    },
  },
  manager: {
    name: 'Manager',
    permissions: {
      users: ['read', 'update'],
      roles: ['read'],
      reports: ['create', 'read', 'update', 'export'],
      audit: ['read'],
      settings: ['read'],
    },
  },
  user: {
    name: 'User',
    permissions: {
      users: ['read'],
      roles: [],
      reports: ['read'],
      audit: [],
      settings: [],
    },
  },
  guest: {
    name: 'Guest',
    permissions: {
      users: [],
      roles: [],
      reports: [],
      audit: [],
      settings: [],
    },
  },
};

export function useRBAC(workspaceId, currentUserRole = 'user') {
  // Fetch roles from database
  const { data: roles = DEFAULT_ROLES } = useQuery({
    queryKey: ['roles', workspaceId],
    queryFn: async () => {
      // In production, fetch from base44.entities.Role
      return DEFAULT_ROLES;
    },
    enabled: !!workspaceId,
  });

  // Check if user has permission
  const hasPermission = useCallback(
    (resource, action) => {
      const rolePermissions = roles[currentUserRole]?.permissions || {};
      const resourcePermissions = rolePermissions[resource] || [];
      return resourcePermissions.includes(action);
    },
    [roles, currentUserRole]
  );

  // Check multiple permissions (all required)
  const hasAllPermissions = useCallback(
    (permissions) => {
      return permissions.every(({ resource, action }) =>
        hasPermission(resource, action)
      );
    },
    [hasPermission]
  );

  // Check multiple permissions (any required)
  const hasAnyPermission = useCallback(
    (permissions) => {
      return permissions.some(({ resource, action }) =>
        hasPermission(resource, action)
      );
    },
    [hasPermission]
  );

  // Get all permissions for current role
  const currentPermissions = useMemo(() => {
    return roles[currentUserRole]?.permissions || {};
  }, [roles, currentUserRole]);

  // Get role details
  const getRoleDetails = useCallback(
    (roleName) => {
      return roles[roleName];
    },
    [roles]
  );

  // Get all roles
  const getAllRoles = useCallback(() => {
    return Object.entries(roles).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }, [roles]);

  return {
    currentUserRole,
    currentPermissions,
    roles,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getRoleDetails,
    getAllRoles,
  };
}

export default useRBAC;