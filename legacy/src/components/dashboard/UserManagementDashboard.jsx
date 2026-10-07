/**
 * UserManagementDashboard Component
 * Comprehensive user and workspace management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Activity, Shield } from 'lucide-react';

export default function UserManagementDashboard() {
  const [userStats] = useState({
    totalUsers: 199,
    activeUsers: 182,
    inactiveUsers: 17,
    lastActivityTime: '2 minutes ago',
  });

  const [roleDistribution] = useState([
    { role: 'Admin', users: 3, percentage: 1.5 },
    { role: 'Manager', users: 12, percentage: 6 },
    { role: 'Editor', users: 28, percentage: 14 },
    { role: 'Viewer', users: 156, percentage: 78.5 },
  ]);

  const [users] = useState([
    {
      id: 'user_001',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '5 min ago',
    },
    {
      id: 'user_002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Manager',
      status: 'active',
      lastLogin: '2 hours ago',
    },
    {
      id: 'user_003',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Editor',
      status: 'active',
      lastLogin: '1 day ago',
    },
    {
      id: 'user_004',
      name: 'Alice Williams',
      email: 'alice@example.com',
      role: 'Viewer',
      status: 'inactive',
      lastLogin: '7 days ago',
    },
  ]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900';
      case 'Manager':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900';
      case 'Editor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">User Management</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {userStats.activeUsers}/{userStats.totalUsers} Active
        </Badge>
      </div>

      {/* User Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
            <p className="text-2xl font-bold dark:text-slate-100">{userStats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active Users</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {userStats.activeUsers}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Inactive Users</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {userStats.inactiveUsers}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Last Activity</p>
            <p className="text-lg font-bold dark:text-slate-100">{userStats.lastActivityTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Shield className="w-4 h-4" />
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleDistribution}>
              <XAxis dataKey="role" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="users" fill="#3b82f6" name="User Count" />
              <Bar yAxisId="right" dataKey="percentage" fill="#10b981" name="Percentage (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Users className="w-4 h-4" />
            User Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Name</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Email</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Role</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">
                      {user.name}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{user.email}</td>
                    <td className="py-2 px-3">
                      <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    </td>
                    <td className="py-2 px-3">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      {user.lastLogin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}