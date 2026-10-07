/**
 * RoleManager Component
 * RBAC role and permission management interface
 */

import React, { useState } from 'react';
import { useRBAC } from '../hooks/useRBAC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, Users, Edit2, Plus, Trash2 } from 'lucide-react';

const RESOURCE_ACTIONS = {
  users: ['create', 'read', 'update', 'delete'],
  roles: ['create', 'read', 'update', 'delete'],
  reports: ['create', 'read', 'update', 'delete', 'export'],
  audit: ['read', 'export'],
  settings: ['read', 'update'],
};

export default function RoleManager({ workspaceId, onRoleSaved }) {
  const { getAllRoles } = useRBAC(workspaceId);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});

  const roles = getAllRoles();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setPermissions(role.permissions || {});
  };

  const handlePermissionChange = (resource, action, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: checked
        ? [...(prev[resource] || []), action]
        : (prev[resource] || []).filter((a) => a !== action),
    }));
  };

  const handleSave = () => {
    if (onRoleSaved) {
      onRoleSaved({
        ...selectedRole,
        permissions,
      });
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lock className="w-6 h-6 dark:text-slate-400" />
        <h2 className="text-2xl font-bold dark:text-slate-100">Role Management</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="space-y-3">
          <h3 className="font-semibold dark:text-slate-200">Available Roles</h3>
          <div className="space-y-2">
            {roles.map((role) => (
              <Card
                key={role.id}
                className={`cursor-pointer transition-colors dark:bg-slate-800 dark:border-slate-700 ${
                  selectedRole?.id === role.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-slate-700'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                onClick={() => handleRoleSelect(role)}
              >
                <CardContent className="p-3">
                  <p className="font-medium dark:text-slate-200">{role.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {Object.values(role.permissions || {})
                      .flat()
                      .length || 0} permissions
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button className="w-full gap-2 dark:bg-slate-700 dark:hover:bg-slate-600">
            <Plus className="w-4 h-4" />
            Create Role
          </Button>
        </div>

        {/* Permissions Matrix */}
        <div className="md:col-span-2">
          {selectedRole ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">
                  Permissions for {selectedRole.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(RESOURCE_ACTIONS).map(([resource, actions]) => (
                    <div key={resource} className="space-y-2">
                      <h4 className="font-medium capitalize dark:text-slate-200">
                        {resource}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 pl-4">
                        {actions.map((action) => (
                          <label
                            key={`${resource}-${action}`}
                            className="flex items-center gap-2 cursor-pointer dark:text-slate-300"
                          >
                            <Checkbox
                              checked={
                                permissions[resource]?.includes(action) || false
                              }
                              onCheckedChange={(checked) =>
                                handlePermissionChange(resource, action, checked)
                              }
                            />
                            <span className="text-sm capitalize">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      onClick={handleSave}
                      className="flex-1 dark:bg-green-700 dark:hover:bg-green-600"
                    >
                      Save Permissions
                    </Button>
                    <Button
                      variant="outline"
                      className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
              Select a role to view and edit permissions
            </div>
          )}
        </div>
      </div>

      {/* Permission Summary */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-slate-100">
            Permission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(permissions).map(([resource, actions]) => (
              <div key={resource} className="space-y-2">
                <p className="font-medium capitalize dark:text-slate-200">
                  {resource}
                </p>
                <div className="flex flex-wrap gap-1">
                  {actions.map((action) => (
                    <Badge
                      key={`${resource}-${action}`}
                      variant="secondary"
                      className="dark:bg-slate-700 dark:text-slate-200"
                    >
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}