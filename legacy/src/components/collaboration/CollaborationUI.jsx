/**
 * CollaborationUI Component
 * Real-time collaboration interface
 */

import React, { useState } from 'react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, AlertCircle } from 'lucide-react';

export default function CollaborationUI() {
  const { data, syncState, trackChange, syncWithRemote, resolveConflict } =
    useRealtimeSync();

  const [selectedConflict, setSelectedConflict] = useState(null);

  const handleResolve = (key, resolution) => {
    resolveConflict(key, resolution);
    setSelectedConflict(null);
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Real-time Collaboration</h2>
        <Badge
          className={`${
            syncState.isOnline
              ? 'bg-green-100 text-green-800 dark:bg-green-900'
              : 'bg-red-100 text-red-800 dark:bg-red-900'
          }`}
        >
          {syncState.isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* Active Users */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Users className="w-4 h-4" />
            Active Users ({syncState.activeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {syncState.activeUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {user.name}
                  </span>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {user.editing && <Activity className="w-3 h-3 inline" />}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Activity className="w-4 h-4" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
            <Badge
              className={`${
                syncState.isSyncing
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900'
                  : 'bg-green-100 text-green-800 dark:bg-green-900'
              }`}
            >
              {syncState.isSyncing ? 'Syncing...' : 'Synced'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Pending Changes
            </span>
            <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
              {syncState.activeUsers.length > 0 ? 'Synchronized' : 'Ready'}
            </Badge>
          </div>

          {syncState.lastSync && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Last Sync</span>
              <span className="text-slate-700 dark:text-slate-300">
                {new Date(syncState.lastSync).toLocaleTimeString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conflicts */}
      {syncState.conflicts.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-800 dark:text-red-200">
              <AlertCircle className="w-4 h-4" />
              Conflicts Found ({syncState.conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {syncState.conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-red-200 dark:border-red-700"
              >
                <p className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                  {conflict.key}
                </p>
                <div className="grid md:grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Local</p>
                    <p className="text-sm font-mono text-slate-800 dark:text-slate-100">
                      {JSON.stringify(conflict.local)}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Remote</p>
                    <p className="text-sm font-mono text-slate-800 dark:text-slate-100">
                      {JSON.stringify(conflict.remote)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(conflict.key, 'local')}
                    className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded transition-colors"
                  >
                    Keep Local
                  </button>
                  <button
                    onClick={() => handleResolve(conflict.key, 'remote')}
                    className="flex-1 px-2 py-1 text-xs bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded transition-colors"
                  >
                    Accept Remote
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {syncState.activeUsers.map((user, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 text-xs text-slate-600 dark:text-slate-400"
              >
                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                <span>
                  <strong>{user.name}</strong> {user.action || 'viewing document'}
                </span>
                <span className="text-slate-500">just now</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}