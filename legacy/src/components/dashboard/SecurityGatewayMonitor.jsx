import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, TrendingUp, Shield } from 'lucide-react';

export default function SecurityGatewayMonitor() {
  const [metrics, setMetrics] = useState({
    requestsPerMinute: 0,
    rateLimitHits: 0,
    invalidRequests: 0,
    avgResponseTime: 0,
    activeUsers: 0,
    lastUpdate: new Date(),
  });

  useEffect(() => {
    // Placeholder for real metrics
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        requestsPerMinute: Math.floor(Math.random() * 100),
        rateLimitHits: Math.floor(Math.random() * 5),
        invalidRequests: Math.floor(Math.random() * 2),
        avgResponseTime: Math.floor(Math.random() * 200) + 50,
        activeUsers: Math.floor(Math.random() * 50) + 10,
        lastUpdate: new Date(),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statusColor = metrics.rateLimitHits === 0 && metrics.invalidRequests === 0 ? 'green' : 'yellow';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">API Gateway Monitor</h2>
        <Badge className={`bg-${statusColor}-100 text-${statusColor}-800`}>
          {statusColor === 'green' ? '✓ Normal' : '⚠ Watch'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Requests/min
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.requestsPerMinute}</div>
            <p className="text-xs text-slate-500 mt-1">Atualizado agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              Rate Limit Hits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.rateLimitHits}</div>
            <p className="text-xs text-slate-500 mt-1">Último minuto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Invalid Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.invalidRequests}</div>
            <p className="text-xs text-slate-500 mt-1">Bloqueadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
            <p className="text-xs text-slate-500 mt-1">Latência média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-slate-500 mt-1">Conectados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            API Gateway Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Rate Limiting</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Ativo</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Request Validation</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Ativo</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Security Headers</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Ativo</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Centralized Logging</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Ativo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}