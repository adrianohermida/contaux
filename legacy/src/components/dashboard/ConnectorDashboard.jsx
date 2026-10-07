/**
 * ConnectorDashboard Component
 * Connector status and health monitoring
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function ConnectorDashboard() {
  const [connectorStats] = useState({
    totalConnectors: 12,
    activeConnectors: 11,
    failedConnectors: 1,
    totalSyncs: 2845,
    successRate: 99.8,
  });

  const [connectors] = useState([
    {
      id: 'conn_001',
      name: 'Stripe Payment API',
      status: 'active',
      health: 'healthy',
      lastSync: '3 min ago',
      syncCount: 456,
    },
    {
      id: 'conn_002',
      name: 'Slack Bot API',
      status: 'active',
      health: 'healthy',
      lastSync: '1 min ago',
      syncCount: 234,
    },
    {
      id: 'conn_003',
      name: 'GitHub API',
      status: 'warning',
      health: 'degraded',
      lastSync: '12 min ago',
      syncCount: 167,
    },
    {
      id: 'conn_004',
      name: 'Google Sheets API',
      status: 'active',
      health: 'healthy',
      lastSync: '8 min ago',
      syncCount: 312,
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900';
    }
  };

  const getHealthIcon = (health) => {
    return health === 'healthy' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-600" />
    );
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Connector Dashboard</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {connectorStats.activeConnectors}/{connectorStats.totalConnectors} Active
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Connectors</p>
            <p className="text-2xl font-bold dark:text-slate-100">{connectorStats.totalConnectors}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Syncs</p>
            <p className="text-2xl font-bold dark:text-slate-100">
              {connectorStats.totalSyncs.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {connectorStats.successRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connectors List */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Activity className="w-4 h-4" />
            Connector Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {connectors.map((conn) => (
              <div
                key={conn.id}
                className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex justify-between items-center"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getHealthIcon(conn.health)}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{conn.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {conn.syncCount} syncs • {conn.lastSync}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(conn.status)}>
                  {conn.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}