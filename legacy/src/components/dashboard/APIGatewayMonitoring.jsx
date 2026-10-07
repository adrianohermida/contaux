import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Activity, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function APIGatewayMonitoring() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [timeRange, setTimeRange] = useState('1h'); // 1h, 24h, 7d

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, logsRes] = await Promise.all([
          base44.functions.invoke('apiGateway', { action: 'stats' }),
          base44.functions.invoke('apiGateway', { action: 'logs', filters: { endpoint: selectedEndpoint } })
        ]);

        setStats(statsRes.data);
        setLogs(logsRes.data || []);
      } catch (error) {
        console.error('Error fetching gateway data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [selectedEndpoint]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando dados do gateway...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">API Gateway Monitoring</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time traffic analysis and security metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Requests</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {stats?.totalRequests || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Requests/Hour</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {stats?.requestsLastHour || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Latency</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {stats?.averageLatency || 0}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
                <p className={`text-3xl font-bold mt-2 ${
                  stats?.successRate >= 95 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {stats?.successRate || 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.topEndpoints?.map((ep, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{ep.endpoint}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-400"
                          style={{ width: `${(ep.count / stats.requestsLastHour) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12 text-right">
                        {ep.count} req
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gateway Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">Status</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">✓ Operational</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Failed Requests (1h)</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats?.failedRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'clients.list', limit: '100 req/user/min', timeout: '30s', method: 'GET' },
                  { name: 'clients.create', limit: '20 req/user/min', timeout: '30s', method: 'POST' },
                  { name: 'clients.update', limit: '50 req/user/min', timeout: '30s', method: 'PUT' },
                  { name: 'contacts.list', limit: '100 req/user/min', timeout: '30s', method: 'GET' }
                ].map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    onClick={() => setSelectedEndpoint(ep.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{ep.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 px-2 py-1 rounded mr-2">
                            {ep.method}
                          </span>
                          <span className="text-slate-500">Rate: {ep.limit} | Timeout: {ep.timeout}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Requests Today</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">0</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Endpoint</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">User</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(-20).map((log, idx) => (
                      <tr key={idx} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{log.endpoint}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.user}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.statusCode < 400
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400'
                          }`}>
                            {log.statusCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{Math.round(log.duration)}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No requests logged yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}