import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Loader2, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InfrastructureManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    type: 'database',
    replicas: 1
  });

  const { data: infrastructure = {} } = useQuery({
    queryKey: ['infrastructure', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        return await base44.functions.invoke('getInfrastructureStatus', {
          workspaceId: workspaceId
        }).then(res => res.data || {});
      } catch (err) {
        console.error('Error loading infrastructure:', err);
        return {};
      }
    },
    enabled: !!workspaceId
  });

  const createServiceMutation = useMutation({
    mutationFn: async () => {
      if (!newService.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createInfrastructureService', {
        workspaceId: workspaceId,
        ...newService
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Serviço criado');
      setNewService({ name: '', type: 'database', replicas: 1 });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['infrastructure', workspaceId] });
    }
  });

  const scaleServiceMutation = useMutation({
    mutationFn: async ({ serviceId, replicas }) => {
      return base44.functions.invoke('scaleService', {
        serviceId: serviceId,
        replicas: replicas
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Serviço escalado');
      queryClient.invalidateQueries({ queryKey: ['infrastructure', workspaceId] });
    }
  });

  const SERVICES = {
    database: 'Banco de Dados',
    cache: 'Cache (Redis)',
    queue: 'Fila (Queue)',
    storage: 'Armazenamento',
    cdn: 'CDN'
  };

  return (
    <div className="space-y-6">
      {/* Infrastructure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Server className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Instâncias</p>
              <p className="text-2xl font-bold mt-1">{infrastructure.totalInstances || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Saudáveis</p>
              <p className="text-2xl font-bold mt-1">{infrastructure.healthyInstances || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Uptime Médio</p>
              <p className="text-2xl font-bold mt-1">99.9%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Service */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome do serviço"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <select
              value={newService.type}
              onChange={(e) => setNewService({ ...newService, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {Object.entries(SERVICES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Réplicas: {newService.replicas}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newService.replicas}
                onChange={(e) => setNewService({ ...newService, replicas: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => createServiceMutation.mutate()}
                disabled={createServiceMutation.isPending}
                className="flex-1"
              >
                {createServiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Novo Serviço
        </Button>
      )}

      {/* Services List */}
      <div className="space-y-3">
        {infrastructure.services?.map((service) => (
          <Card key={service.id}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-slate-600">{SERVICES[service.type]}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>

                <div className="bg-slate-50 p-3 rounded text-sm space-y-1">
                  <p><strong>Réplicas:</strong> {service.replicas}/{service.maxReplicas}</p>
                  <p><strong>CPU:</strong> {service.cpuUsage}%</p>
                  <p><strong>Memória:</strong> {service.memoryUsage}%</p>
                </div>

                <div className="flex gap-2">
                  <select
                    value={service.replicas}
                    onChange={(e) => scaleServiceMutation.mutate({ serviceId: service.id, replicas: parseInt(e.target.value) })}
                    className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} réplica{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}