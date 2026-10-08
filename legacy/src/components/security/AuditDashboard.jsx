/**
 * AuditDashboard Component
 * Display and analyze audit logs
 */

import React, { useState, useMemo } from 'react';
import { useAuditLog } from '../hooks/useAuditLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Search, Clock } from 'lucide-react';

const ACTION_COLORS = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  read: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  export: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  login: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  logout: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
};

export default function AuditDashboard({ workspaceId }) {
  const { auditLogs } = useAuditLog(workspaceId);
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('');
  const [searchText, setSearchText] = useState('');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchAction = filterAction === 'all' || log.action === filterAction;
      const matchUser =
        !filterUser || log.user_email.toLowerCase().includes(filterUser.toLowerCase());
      const matchSearch =
        !searchText ||
        JSON.stringify(log).toLowerCase().includes(searchText.toLowerCase());
      return matchAction && matchUser && matchSearch;
    });
  }, [auditLogs, filterAction, filterUser, searchText]);

  const getUniqueUsers = () => {
    return [...new Set(auditLogs.map((log) => log.user_email))];
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Status', 'IP'],
      ...filteredLogs.map((log) => [
        log.timestamp,
        log.user_email,
        log.action,
        log.entity_type,
        log.entity_id,
        log.status,
        log.ip_address,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6 dark:text-slate-400" />
        <h2 className="text-2xl font-bold dark:text-slate-100">Audit Logs</h2>
      </div>

      {/* Filters */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium dark:text-slate-300">
                Search
              </label>
              <Input
                placeholder="Search logs..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-300">
                Action
              </label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-300">
                User
              </label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  <SelectItem value={null}>All Users</SelectItem>
                  {getUniqueUsers().map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={exportLogs}
                className="w-full gap-2 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">
            {filteredLogs.length} Log Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left p-3 font-semibold dark:text-slate-200">
                    Timestamp
                  </th>
                  <th className="text-left p-3 font-semibold dark:text-slate-200">
                    User
                  </th>
                  <th className="text-left p-3 font-semibold dark:text-slate-200">
                    Action
                  </th>
                  <th className="text-left p-3 font-semibold dark:text-slate-200">
                    Entity
                  </th>
                  <th className="text-left p-3 font-semibold dark:text-slate-200">
                    Status
                  </th>
                  <th className="text-left p-3 font-semibold dark:text-slate-200">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="p-3">{log.user_email}</td>
                      <td className="p-3">
                        <Badge className={ACTION_COLORS[log.action] || ''}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="dark:text-slate-300">
                          {log.entity_type} ({log.entity_id})
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            log.status === 'success' ? 'default' : 'destructive'
                          }
                          className="dark:bg-slate-700 dark:text-slate-200"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}