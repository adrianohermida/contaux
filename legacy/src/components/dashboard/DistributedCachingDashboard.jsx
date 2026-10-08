/**
 * DistributedCachingDashboard Component
 * Cluster replication and distributed cache monitoring
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Server, AlertCircle, CheckCircle } from 'lucide-react';

export default function DistributedCachingDashboard() {
  const [clusterStatus] = useState({
    totalNodes: 5,
    healthyNodes: 5,
    consistency: 'eventual',
    replicationFactor: 3,
    syncStatus: 'synced',
  });

  const [nodeData] = useState([
    { name: 'Node 1', dataSize: 45, replicas: 2, status: 'healthy' },
    { name: 'Node 2', dataSize: 48, replicas: 2, status: 'healthy' },
    { name: 'Node 3', dataSize: 42, replicas: 2, status: 'healthy' },
    { name: 'Node 4', dataSize: 50, replicas: 2, status: 'healthy' },
    { name: 'Node 5', dataSize: 46, replicas: 2, status: 'healthy' },
  ]);

  const [nodes] = useState([
    {
      id: 'node_0',
      status: 'healthy',
      dataSize: '45 MB',
      replicas: 2,
      lastHeartbeat: '2 sec ago',
      uptime: '99.98%',
    },
    {
      id: 'node_1',
      status: 'healthy',
      dataSize: '48 MB',
      replicas: 2,
      lastHeartbeat: '3 sec ago',
      uptime: '99.99%',
    },
    {
      id: 'node_2',
      status: 'healthy',
      dataSize: '42 MB',
      replicas: 2,
      lastHeartbeat: '1 sec ago',
      uptime: '99.97%',
    },
    {
      id: 'node_3',
      status: 'healthy',
      dataSize: '50 MB',
      replicas: 2,
      lastHeartbeat: '2 sec ago',
      uptime: '99.99%',
    },
    {
      id: 'node_4',
      status: 'healthy',
      dataSize: '46 MB',
      replicas: 2,
      lastHeartbeat: '4 sec ago',
      uptime: '99.96%',
    },
  ]);

  const getStatusIcon = (status) => {
    return status === 'healthy' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Distributed Caching</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {clusterStatus.healthyNodes}/{clusterStatus.totalNodes} Healthy
        </Badge>
      </div>

      {/* Cluster Status */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Nodes</p>
            <p className="text-2xl font-bold dark:text-slate-100">{clusterStatus.totalNodes}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Healthy Nodes</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {clusterStatus.healthyNodes}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Replication Factor</p>
            <p className="text-2xl font-bold dark:text-slate-100">{clusterStatus.replicationFactor}x</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Sync Status</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {clusterStatus.syncStatus.toUpperCase()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Node Distribution Chart */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Server className="w-4 h-4" />
            Data Distribution Across Nodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={nodeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="dataSize" fill="#3b82f6" name="Data (MB)" />
              <Bar dataKey="replicas" fill="#10b981" name="Replicas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Nodes Status Table */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Cluster Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Node</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Data Size</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Replicas</th>
                  <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Uptime</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {node.id}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(node.status)}
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
                          HEALTHY
                        </Badge>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{node.dataSize}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{node.replicas}x</td>
                    <td className="py-2 px-3 text-green-600 dark:text-green-400 font-medium">
                      {node.uptime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Replication Info */}
      <Card className="dark:bg-slate-800 dark:border-slate-700 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
        <CardHeader>
          <CardTitle className="text-base text-blue-900 dark:text-blue-100">
            Replication Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
          <p>
            <strong>Factor:</strong> 3x replication across nodes
          </p>
          <p>
            <strong>Consistency:</strong> Eventual consistency with conflict resolution
          </p>
          <p>
            <strong>Failover:</strong> Automatic failover to replica nodes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}