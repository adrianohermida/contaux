import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, GitBranch, Users, Zap } from 'lucide-react';

export default function ObservabilityEngine({ workspaceId }) {
  const [selectedService, setSelectedService] = useState(null);

  const { data: observability = {} } = useQuery({
    queryKey: ['observability-engine', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        return await base44.functions.invoke('getObservabilityData', {
          workspaceId: workspaceId
        }).then(res => res.data || {});
      } catch (err) {
        console.error('Error loading observability:', err);
        return {};
      }
    },
    enabled: !!workspaceId,
    refetchInterval: 15000
  });

  return (
    <div className="space-y-6">
      {/* Service Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Mapa de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {observability.services?.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{service.name}</h4>
                    <p className="text-xs text-slate-600 mt-1">{service.type}</p>
                  </div>
                  <Badge className={service.healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {service.healthy ? 'Saudável' : 'Degradado'}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <p>Latência: <strong>{service.latency}ms</strong></p>
                  <p>Taxa de erro: <strong>{service.errorRate}%</strong></p>
                  <p>Dependências: <strong>{service.dependencies?.length || 0}</strong></p>
                </div>
              </div>
            )) || (
              <p className="text-slate-600">Nenhum serviço monitorado</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distributed Tracing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Rastreamento Distribuído
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {observability.traces?.map((trace, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4 py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{trace.name}</p>
                    <p className="text-xs text-slate-600 mt-1">ID: {trace.traceId}</p>
                  </div>
                  <Badge className={
                    trace.duration < 100 ? 'bg-green-100 text-green-800' :
                    trace.duration < 500 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {trace.duration}ms
                  </Badge>
                </div>
                <div className="mt-2 bg-slate-50 rounded p-2 text-xs font-mono">
                  <p className="text-slate-700">Spans: {trace.spanCount}</p>
                </div>
              </div>
            )) || (
              <p className="text-slate-600 text-sm">Nenhum trace disponível</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Session Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sessões de Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'user-001', activeFor: '12m', pages: 5, status: 'Ativa' },
              { id: 'user-002', activeFor: '3m', pages: 2, status: 'Ativa' },
              { id: 'user-003', activeFor: '45s', pages: 1, status: 'Nova' }
            ].map((session) => (
              <div key={session.id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{session.id}</p>
                    <p className="text-xs text-slate-600">Páginas visitadas: {session.pages}</p>
                  </div>
                  <Badge className={session.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {session.status} - {session.activeFor}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Métricas em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 font-medium">Taxa de Requisições</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">{observability.requestRate || 0}/s</p>
              <p className="text-xs text-slate-600 mt-2">Pico: {observability.peakRate || 0}/s</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 font-medium">Usuários Ativos</p>
              <p className="text-3xl font-bold mt-2 text-green-600">{observability.activeUsers || 0}</p>
              <p className="text-xs text-slate-600 mt-2">Online agora</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 font-medium">Uptime</p>
              <p className="text-3xl font-bold mt-2 text-purple-600">99.99%</p>
              <p className="text-xs text-slate-600 mt-2">Últimos 7 dias</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 font-medium">Taxa de Erro P95</p>
              <p className="text-3xl font-bold mt-2 text-amber-600">{observability.errorRateP95 || 0.2}%</p>
              <p className="text-xs text-slate-600 mt-2">Percentil 95</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}