import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Advanced RBAC Implementation - PHASE 15
 * Granular role-based access control with resource-level permissions
 */

class AdvancedRBACManager {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.roleAssignments = new Map();
    this.setupDefaultRoles();
  }

  /**
   * Setup default roles
   */
  setupDefaultRoles() {
    const defaultRoles = {
      admin: {
        name: 'Administrator',
        description: 'Full system access',
        permissions: ['*'], // Wildcard for all
      },
      manager: {
        name: 'Manager',
        description: 'Manage team and reports',
        permissions: ['contacts:read', 'contacts:write', 'invoices:read', 'invoices:write', 'reports:read'],
      },
      user: {
        name: 'User',
        description: 'Limited access',
        permissions: ['contacts:read', 'invoices:read'],
      },
      viewer: {
        name: 'Viewer',
        description: 'Read-only access',
        permissions: ['contacts:read', 'invoices:read', 'reports:read'],
      },
    };

    for (const [key, role] of Object.entries(defaultRoles)) {
      this.roles.set(key, role);
    }
  }

  /**
   * Create custom role
   */
  createCustomRole(roleId, name, description, permissions) {
    if (this.roles.has(roleId)) {
      throw new Error(`Role ${roleId} already exists`);
    }

    const role = {
      id: roleId,
      name,
      description,
      permissions,
      created_at: new Date().toISOString(),
      custom: true,
    };

    this.roles.set(roleId, role);
    return role;
  }

  /**
   * Assign role to user
   */
  assignRoleToUser(userId, roleId, resourceId = null, expiresAt = null) {
    if (!this.roles.has(roleId)) {
      throw new Error(`Role ${roleId} not found`);
    }

    const assignment = {
      user_id: userId,
      role_id: roleId,
      resource_id: resourceId, // null = global, or specific resource ID
      assigned_at: new Date().toISOString(),
      expires_at: expiresAt,
      status: 'active',
    };

    const key = `${userId}_${roleId}_${resourceId || 'global'}`;
    this.roleAssignments.set(key, assignment);

    return assignment;
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId, permission, resourceId = null) {
    // Get all roles for user
    const userRoles = [];
    for (const [key, assignment] of this.roleAssignments) {
      if (assignment.user_id === userId && assignment.status === 'active') {
        // Check expiration
        if (assignment.expires_at && new Date(assignment.expires_at) < new Date()) {
          continue;
        }
        // Check resource match
        if (resourceId && assignment.resource_id && assignment.resource_id !== resourceId) {
          continue;
        }
        userRoles.push(assignment.role_id);
      }
    }

    // Check permissions for each role
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      // Check for wildcard or exact permission
      if (role.permissions.includes('*') || role.permissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get user permissions
   */
  getUserPermissions(userId) {
    const permissions = new Set();

    for (const [key, assignment] of this.roleAssignments) {
      if (assignment.user_id === userId && assignment.status === 'active') {
        // Check expiration
        if (assignment.expires_at && new Date(assignment.expires_at) < new Date()) {
          continue;
        }

        const role = this.roles.get(assignment.role_id);
        if (!role) continue;

        if (role.permissions.includes('*')) {
          return ['all_permissions'];
        }

        role.permissions.forEach(perm => permissions.add(perm));
      }
    }

    return Array.from(permissions);
  }

  /**
   * Enforce IP whitelist
   */
  enforceIPWhitelist(userId, clientIP, whitelist) {
    return {
      user_id: userId,
      client_ip: clientIP,
      whitelist,
      allowed: whitelist.includes(clientIP),
      message: whitelist.includes(clientIP) ? 'Access granted' : 'IP not whitelisted',
    };
  }
}

/**
 * Backend handler for RBAC operations
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.workspace_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userId, roleId, permission, resourceId, name, description, permissions: perms, clientIP, whitelist } = await req.json();

    const rbac = new AdvancedRBACManager();

    switch (action) {
      case 'create-custom-role':
        const customRole = rbac.createCustomRole(roleId, name, description, perms);
        return Response.json({ success: true, role: customRole });

      case 'assign-role':
        const assignment = rbac.assignRoleToUser(userId, roleId, resourceId);
        return Response.json({ success: true, ...assignment });

      case 'check-permission':
        const hasPermission = rbac.hasPermission(userId, permission, resourceId);
        return Response.json({ success: true, has_permission: hasPermission });

      case 'get-permissions':
        const userPermissions = rbac.getUserPermissions(userId);
        return Response.json({ success: true, permissions: userPermissions });

      case 'enforce-ip-whitelist':
        const ipCheck = rbac.enforceIPWhitelist(userId, clientIP, whitelist);
        return Response.json({ success: true, ...ipCheck });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

export { AdvancedRBACManager };