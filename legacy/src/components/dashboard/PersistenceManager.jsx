/**
 * PersistenceManager Component
 * Cache persistence and recovery management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function PersistenceManager() {
  const [storageMetrics] = useState({
    totalUsed: '45.2 MB',
    totalAvailable: '50 MB',
    percentageUsed: 90.4,
    lastSync: '2 seconds ago',
    syncStatus: 'synced',
  });

  const [storageItems] = useState([
    {
      key: 'user_session',
      type: 'Session Data',
      size: '2.3 MB',
      lastModified: '1 min ago',
      status: 'synced',
    },
    {
      key: 'app_cache',
      type: 'Cache',
      size: '18.5 MB',
      lastModified: '2 min ago',
      status: 'synced',
    },
    {
      key: 'offline_queue',
      type: 'Pending Requests',
      size: '1.2 MB',
      lastModified: '5 min ago',
      status: 'pending',
    },
    {
      key: 'user_preferences',
      type: 'Settings',
      size: '456 KB',
      lastModified: '1 hour ago',
      status: 'synced',
    },
  ]);

  const [syncLog] = useState([
    { timestamp: '14:32:15', action: 'Sync completed', status: 'success', items: 342 },
    { timestamp: '14:30:42', action: 'Sync started', status: 'success', items: 340 },
    { timestamp: '14:28:19', action: 'Conflict resolved', status: 'warning', items: 5 },
    { timestamp: '14:25:01', action: 'Offline sync queue', status: 'pending', items: 12 },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Persistence Manager</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {storageMetrics.syncStatus.toUpperCase()}
        </Badge>
      </div>

      {/* Storage Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Storage Used</p>
            <p className="text-2xl font-bold dark:text-slate-100">{storageMetrics.totalUsed}</p>
            <div className="mt-2 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${storageMetrics.percentageUsed}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {storageMetrics.percentageUsed}% of {storageMetrics.totalAvailable}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Last Sync</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <p className="text-lg font-bold dark:text-slate-100">{storageMetrics.lastSync}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Sync Status</p>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-lg font-bold text-green-600 dark:text-green-400">All Synced</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Items */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Database className="w-4 h-4" />
            Storage Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {storageItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{item.type}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{item.key}</p>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Size: {item.size}</span>
                  <span>Modified: {item.lastModified}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Log */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Sync Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Timestamp</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Action</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Items</th>
                </tr>
              </thead>
              <tbody>
                {syncLog.map((log, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {log.timestamp}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{log.action}</td>
                    <td className="py-2 px-3">
                      <Badge className={getStatusColor(log.status)}>
                        {log.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{log.items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Storage Management</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Force Sync</Button>
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">Clear Offline Queue</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">Clear All Storage</Button>
        </CardContent>
      </Card>
    </div>
  );
}