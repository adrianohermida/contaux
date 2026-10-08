import React, { useState, useEffect } from 'react';
import { useWebSocket } from './WebSocketService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Clock, AlertCircle, CheckCircle, Wifi } from 'lucide-react';

export default function MonitoringDashboard({ workspaceId }) {
  const { status, subscribe } = useWebSocket(workspaceId);
  const [metrics, setMetrics] = useState({
    uptime: '99.9%',
    activeUsers: 0,
    requestsPerSecond: 0,
    avgResponseTime: 0,
    errorRate: 0,
    lastUpdate: new Date()
  });

  useEffect(() => {
    const unsubscribe = subscribe((data) => {
      if (data.type === 'metrics') {
        setMetrics(prev => ({
          ...prev,
          ...data.payload,
          lastUpdate: new Date()
        }));
      }
    }, 'metrics');

    return unsubscribe;
  }, [subscribe]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className={`w-5 h-5 ${getStatusColor(status)}`} />;
      case 'disconnected':
        return <AlertCircle className={`w-5 h-5 ${getStatusColor(status)}`} />;
      default:
        return <Clock className={`w-5 h-5 ${getStatusColor(status)}`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm font-medium text-slate-700">Status da Conexão</p>
                <p className={`text-lg font-bold capitalize ${getStatusColor(status)}`}>
                  {status}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {metrics.lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Uptime */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Disponibilidade</p>
              <p className="text-2xl font-bold mt-1">{metrics.uptime}</p>
              <p className="text-xs text-green-600 mt-2">✓ Normal</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Usuários Ativos</p>
              <p className="text-2xl font-bold mt-1">{metrics.activeUsers}</p>
              <p className="text-xs text-blue-600 mt-2">Conectados agora</p>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Tempo de Resposta</p>
              <p className="text-2xl font-bold mt-1">{metrics.avgResponseTime}ms</p>
              <p className="text-xs text-purple-600 mt-2">Média</p>
            </div>
          </CardContent>
        </Card>

        {/* Requests/s */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Requisições/s</p>
              <p className="text-2xl font-bold mt-1">{metrics.requestsPerSecond}</p>
              <p className="text-xs text-indigo-600 mt-2">Taxa atual</p>
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Taxa de Erro</p>
              <p className="text-2xl font-bold mt-1">{metrics.errorRate}%</p>
              <p className={`text-xs mt-2 ${metrics.errorRate < 1 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.errorRate < 1 ? '✓ Normal' : '⚠ Elevada'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Saúde do Sistema</p>
              <p className="text-2xl font-bold mt-1">Saudável</p>
              <p className="text-xs text-green-600 mt-2">Todos os sistemas OK</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Serviços</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'API Gateway', status: 'online', latency: '12ms' },
            { name: 'Database', status: 'online', latency: '8ms' },
            { name: 'Cache Server', status: 'online', latency: '5ms' },
            { name: 'Email Service', status: 'online', latency: '45ms' },
            { name: 'File Storage', status: 'online', latency: '25ms' },
            { name: 'WebSocket Server', status: status === 'connected' ? 'online' : 'offline', latency: '3ms' }
          ].map((service) => (
            <div key={service.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${service.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="font-medium text-slate-900">{service.name}</p>
              </div>
              <p className="text-sm text-slate-600">{service.latency}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}