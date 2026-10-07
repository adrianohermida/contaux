/**
 * RoleBasedAccessControl Component
 * Role-based access control and permission management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Users, Shield } from 'lucide-react';

export default function RoleBasedAccessControl() {
  const [roles] = useState([
    {
      name: 'Admin',
      level: 5,
      users: 3,
      permissions: 45,
      permissions_list: ['all'],
      status: 'active',
    },
    {
      name: 'Manager',
      level: 4,
      users: 12,
      permissions: 32,
      permissions_list: ['read', 'write', 'delete', 'manage_users'],
      status: 'active',
    },
    {
      name: 'Editor',
      level: 3,
      users: 28,
      permissions: 18,
      permissions_list: ['read', 'write', 'comment'],
      status: 'active',
    },
    {
      name: 'Viewer',
      level: 1,
      users: 156,
      permissions: 5,
      permissions_list: ['read', 'comment'],
      status: 'active',
    },
  ]);

  const [permissions] = useState([
    { name: 'read', description: 'View content and data' },
    { name: 'write', description: 'Create and edit content' },
    { name: 'delete', description: 'Delete content and data' },
    { name: 'manage_users', description: 'Manage user accounts' },
    { name: 'manage_roles', description: 'Manage roles and permissions' },
    { name: 'audit_log', description: 'Access audit logs' },
    { name: 'export', description: 'Export data' },
    { name: 'api_access', description: 'Access API' },
  ]);

  const getLevelColor = (level) => {
    switch (level) {
      case 5:
        return 'bg-red-100 text-red-800 dark:bg-red-900';
      case 4:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900';
      case 3:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900';
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">RBAC Management</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {roles.length} Roles Active
        </Badge>
      </div>

      {/* Roles Overview */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Shield className="w-4 h-4" />
            Roles & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roles.map((role, idx) => (
              <div key={idx} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge className={getLevelColor(role.level)}>
                      LEVEL {role.level}
                    </Badge>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{role.name}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
                    {role.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{role.users} Users</span>
                  <span>{role.permissions} Permissions</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Lock className="w-4 h-4" />
            Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Permission
                  </th>
                  <th className="text-center py-2 px-3 text-slate-700 dark:text-slate-300">
                    Admin
                  </th>
                  <th className="text-center py-2 px-3 text-slate-700 dark:text-slate-300">
                    Manager
                  </th>
                  <th className="text-center py-2 px-3 text-slate-700 dark:text-slate-300">
                    Editor
                  </th>
                  <th className="text-center py-2 px-3 text-slate-700 dark:text-slate-300">
                    Viewer
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{perm.name}</td>
                    <td className="text-center py-2 px-3">✅</td>
                    <td className="text-center py-2 px-3">
                      {['write', 'delete', 'manage_users'].includes(perm.name) ? '✅' : '—'}
                    </td>
                    <td className="text-center py-2 px-3">
                      {['read', 'write', 'comment'].includes(perm.name) ? '✅' : '—'}
                    </td>
                    <td className="text-center py-2 px-3">
                      {['read', 'comment'].includes(perm.name) ? '✅' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Users className="w-4 h-4" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add User</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">Assign Role</Button>
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">Edit Permissions</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">Remove Access</Button>
        </CardContent>
      </Card>
    </div>
  );
}