/**
 * ScalabilityMonitor Component
 * System scalability and capacity monitoring
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Server, Cpu, HardDrive } from 'lucide-react';

export default function ScalabilityMonitor() {
  const [scalabilityStats] = useState({
    currentLoad: 34,
    maxCapacity: 100,
    activeConnections: 2845,
    maxConnections: 5000,
    requestsPerSecond: 1250,
    maxRPS: 2000,
  });

  const [resourceUsage] = useState([
    { resource: 'CPU', used: 34, available: 66, unit: '%' },
    { resource: 'Memory', used: 58, available: 42, unit: 'GB' },
    { resource: 'Storage', used: 72, available: 28, unit: '%' },
    { resource: 'Bandwidth', used: 45, available: 55, unit: '%' },
  ]);

  const getHealthColor = (percentage) => {
    if (percentage < 60) return 'bg-green-100 text-green-800 dark:bg-green-900';
    if (percentage < 80) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
    return 'bg-red-100 text-red-800 dark:bg-red-900';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Scalability Monitor</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">HEALTHY</Badge>
      </div>

      {/* Capacity Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">System Load</p>
            <p className="text-2xl font-bold dark:text-slate-100">
              {scalabilityStats.currentLoad}%
            </p>
            <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2 mt-2">
              <div
                style={{ width: `${scalabilityStats.currentLoad}%` }}
                className="bg-green-600 h-2 rounded-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active Connections</p>
            <p className="text-2xl font-bold dark:text-slate-100">
              {scalabilityStats.activeConnections.toLocaleString()}/
              {scalabilityStats.maxConnections.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {Math.round((scalabilityStats.activeConnections / scalabilityStats.maxConnections) * 100)}%
              capacity
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Requests/sec</p>
            <p className="text-2xl font-bold dark:text-slate-100">
              {scalabilityStats.requestsPerSecond.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Limit: {scalabilityStats.maxRPS.toLocaleString()} RPS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Cpu className="w-4 h-4" />
            Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceUsage}>
              <XAxis dataKey="resource" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="used" fill="#3b82f6" name="Used" />
              <Bar dataKey="available" fill="#10b981" name="Available" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resource Details */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Server className="w-4 h-4" />
            Detailed Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {resourceUsage.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {item.resource}
                </span>
                <Badge className={getHealthColor((item.used / (item.used + item.available)) * 100)}>
                  {item.used}/{item.used + item.available} {item.unit}
                </Badge>
              </div>
              <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2">
                <div
                  style={{ width: `${(item.used / (item.used + item.available)) * 100}%` }}
                  className="bg-blue-600 h-2 rounded-full"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}