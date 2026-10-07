/**
 * APIGatewayMonitoringDashboard Component
 * GraphQL API monitoring with request metrics, performance analysis, and query optimization
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  Activity,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Gauge,
  Database,
  Network,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useGraphQLClient } from '@/components/hooks/useGraphQLClient';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function APIGatewayMonitoringDashboard() {
  const { clientState, getCacheStats, clearCache } = useGraphQLClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('1h');

  const cacheStats = getCacheStats();

  // Mock performance data
  const performanceData = [
    { time: '00:00', latency: 45, throughput: 120, errors: 2 },
    { time: '04:00', latency: 38, throughput: 150, errors: 1 },
    { time: '08:00', latency: 52, throughput: 200, errors: 3 },
    { time: '12:00', latency: 41, throughput: 280, errors: 0 },
    { time: '16:00', latency: 48, throughput: 350, errors: 2 },
    { time: '20:00', latency: 35, throughput: 450, errors: 1 },
  ];

  const queryTypeData = [
    { name: 'Read', value: 65, count: 1300 },
    { name: 'Mutation', value: 20, count: 400 },
    { name: 'Subscription', value: 10, count: 200 },
    { name: 'Batch', value: 5, count: 100 },
  ];

  const endpointData = [
    { endpoint: '/graphql', requests: 1200, avgLatency: 42, errors: 2 },
    { endpoint: '/api/v1', requests: 800, avgLatency: 38, errors: 1 },
    { endpoint: '/api/batch', requests: 500, avgLatency: 55, errors: 3 },
  ];

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          <Network className="w-6 h-6 text-blue-500" />
          API Gateway Monitoring
        </h2>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded dark:text-slate-100"
          >
            <option value="1h">Last 1 hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
          <Badge className={clientState.isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-gray-100 text-gray-800 dark:bg-gray-900'}>
            {clientState.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Requests</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{clientState.requestCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Latency</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">42ms</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Gauge className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Cache Hit Rate</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{cacheStats.hitRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Error Rate</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">0.2%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="dark:bg-slate-800 dark:border-slate-700 grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="dark:text-slate-300">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="dark:text-slate-300">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="queries" className="dark:text-slate-300">
            <Database className="w-4 h-4 mr-2" />
            Queries
          </TabsTrigger>
          <TabsTrigger value="cache" className="dark:text-slate-300">
            <Gauge className="w-4 h-4 mr-2" />
            Cache
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Request Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-700" />
                  <XAxis dataKey="time" className="text-slate-600 dark:text-slate-400" />
                  <YAxis className="text-slate-600 dark:text-slate-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Area type="monotone" dataKey="latency" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLatency)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Query Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={queryTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {queryTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-700" />
                  <XAxis dataKey="time" className="text-slate-600 dark:text-slate-400" />
                  <YAxis className="text-slate-600 dark:text-slate-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="latency" stroke="#3b82f6" name="Latency (ms)" />
                  <Line type="monotone" dataKey="throughput" stroke="#10b981" name="Throughput (req/s)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Endpoint Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpointData.map((endpoint) => (
                  <div key={endpoint.endpoint} className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium dark:text-slate-100">{endpoint.endpoint}</p>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
                        {endpoint.requests} req
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Avg Latency</p>
                        <p className="font-medium dark:text-slate-100">{endpoint.avgLatency}ms</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Errors</p>
                        <p className="font-medium dark:text-slate-100">{endpoint.errors}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queries Tab */}
        <TabsContent value="queries" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Query Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={queryTypeData}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" className="text-slate-600 dark:text-slate-400" />
                  <YAxis className="text-slate-600 dark:text-slate-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Top Slow Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  { query: 'getUserWithPosts', latency: 234 },
                  { query: 'getComments', latency: 189 },
                  { query: 'getNotifications', latency: 156 },
                ].map((item) => (
                  <div key={item.query} className="flex justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded">
                    <span className="dark:text-slate-100">{item.query}</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{item.latency}ms</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cache Tab */}
        <TabsContent value="cache" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Cache Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-100 dark:bg-slate-700 rounded">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Cache Size</p>
                  <p className="text-2xl font-bold dark:text-slate-100">{cacheStats.cacheSize}</p>
                </div>
                <div className="text-center p-3 bg-slate-100 dark:bg-slate-700 rounded">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Cache Hits</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{cacheStats.cacheHits}</p>
                </div>
                <div className="text-center p-3 bg-slate-100 dark:bg-slate-700 rounded">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Cache Misses</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{cacheStats.cacheMisses}</p>
                </div>
                <div className="text-center p-3 bg-slate-100 dark:bg-slate-700 rounded">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Hit Rate</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cacheStats.hitRate}%</p>
                </div>
              </div>

              <Button
                onClick={clearCache}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 dark:bg-opacity-80"
              >
                Clear Cache
              </Button>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Cache Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium dark:text-slate-100">Cache Efficiency</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {cacheStats.hitRate > 70 ? '✓ Excellent' : '⚠ Needs optimization'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium dark:text-slate-100">Active Subscriptions</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {clientState.activeSubscriptions} active connection(s)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}