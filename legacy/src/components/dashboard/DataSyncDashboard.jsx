/**
 * DataSyncDashboard Component
 * Real-time sync status, conflict resolution, and change tracking interface
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Cloud,
  CloudOff,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  GitBranch,
  TrendingUp,
  Wifi,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRealtimeDataSync } from '@/components/hooks/useRealtimeDataSync';

export default function DataSyncDashboard() {
  const { performSync, getSyncStats, recordChange, optimisticUpdate, syncState, changeHistory } = useRealtimeDataSync();
  const [autoSync, setAutoSync] = useState(true);

  const stats = getSyncStats();

  const syncTrendData = [
    { time: '00:00', synced: 120, failed: 5, pending: 30 },
    { time: '04:00', synced: 150, failed: 3, pending: 20 },
    { time: '08:00', synced: 200, failed: 2, pending: 15 },
    { time: '12:00', synced: 280, failed: 1, pending: 10 },
    { time: '16:00', synced: 350, failed: 2, pending: 5 },
    { time: '20:00', synced: 450, failed: 1, pending: 2 },
  ];

  const handleManualSync = () => {
    performSync();
  };

  const handleTestChange = () => {
    optimisticUpdate(`entity-${Date.now()}`, {
      name: 'Test Update',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          {syncState.isOnline ? (
            <Cloud className="w-6 h-6 text-green-500" />
          ) : (
            <CloudOff className="w-6 h-6 text-red-500" />
          )}
          Data Synchronization
        </h2>
        <Badge className={syncState.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-red-100 text-red-800 dark:bg-red-900'}>
          {syncState.isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* Connection Status */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {syncState.isOnline ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : (
                <CloudOff className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-medium dark:text-slate-100">
                  {syncState.isOnline ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {syncState.lastSync
                    ? `Last sync: ${new Date(syncState.lastSync).toLocaleTimeString()}`
                    : 'No sync yet'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleManualSync}
              disabled={!syncState.isOnline || syncState.isSyncing}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-opacity-80 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
              {syncState.isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Synced Items</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.syncedItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Failed Items</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.failedItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingChanges}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Conflicts</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.conflictCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Success Rate</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.successRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Trend Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Synchronization Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={syncTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-700" />
              <XAxis dataKey="time" className="text-slate-600 dark:text-slate-400" />
              <YAxis className="text-slate-600 dark:text-slate-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line type="monotone" dataKey="synced" stroke="#10b981" name="Synced" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Change History */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-500" />
            Recent Changes ({changeHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {changeHistory.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                No changes yet. Create a test change to see it here.
              </p>
            ) : (
              changeHistory.slice(0, 10).map((change) => (
                <div
                  key={change.id}
                  className="flex items-start gap-3 p-2 bg-slate-100 dark:bg-slate-700 rounded text-sm"
                >
                  <div className="mt-1">
                    {change.synced ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-slate-100">{change.action.toUpperCase()}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {change.entityId} • {new Date(change.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={change.synced ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'}>
                    {change.synced ? 'Synced' : 'Pending'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Controls */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Sync Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded">
            <label className="text-sm font-medium dark:text-slate-100">Auto Sync</label>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4"
            />
          </div>

          <Button
            onClick={handleTestChange}
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-opacity-80"
          >
            Create Test Change
          </Button>

          <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 p-3 rounded">
            <p className="font-medium mb-2">Sync Status:</p>
            <ul className="space-y-1">
              <li>{syncState.isOnline ? '✓' : '✗'} Online Status</li>
              <li>{autoSync ? '✓' : '✗'} Auto Sync Enabled</li>
              <li>✓ Conflict Resolution Active</li>
              <li>✓ Offline Support Enabled</li>
              <li>✓ Change History Tracking</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Resolution Panel */}
      {stats.conflictCount > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-2 border-orange-200 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Conflicts Detected ({stats.conflictCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {stats.conflictCount} conflict(s) detected and resolved using last-write-wins strategy.
              All conflicts have been recorded in the history for audit purposes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}