import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Loader2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MetricsCollector({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newCollector, setNewCollector] = useState({
    name: '',
    metricType: 'cpu',
    interval: 60,
    retention: 7
  });

  const { data: collectors = [] } = useQuery({
    queryKey: ['metrics-collectors', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listMetricsCollectors', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        console.error('Error loading collectors:', err);
        return [];
      }
    },
    enabled: !!workspaceId
  });

  const createCollectorMutation = useMutation({
    mutationFn: async () => {
      if (!newCollector.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createMetricsCollector', {
        workspaceId: workspaceId,
        ...newCollector
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Coletor criado');
      setNewCollector({ name: '', metricType: 'cpu', interval: 60, retention: 7 });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['metrics-collectors', workspaceId] });
    }
  });

  const deleteCollectorMutation = useMutation({
    mutationFn: async (id) => {
      return base44.functions.invoke('deleteMetricsCollector', { collectorId: id }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Coletor removido');
      queryClient.invalidateQueries({ queryKey: ['metrics-collectors', workspaceId] });
    }
  });

  const METRIC_TYPES = {
    cpu: 'CPU',
    memory: 'Memória',
    disk: 'Disco',
    network: 'Rede',
    database: 'Banco de Dados',
    api: 'API',
    cache: 'Cache'
  };

  return (
    <div className="space-y-6">
      {/* Create Collector */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Coletor de Métricas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome do coletor"
              value={newCollector.name}
              onChange={(e) => setNewCollector({ ...newCollector, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <select
              value={newCollector.metricType}
              onChange={(e) => setNewCollector({ ...newCollector, metricType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {Object.entries(METRIC_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Intervalo (segundos)</label>
                <input
                  type="number"
                  min="10"
                  max="3600"
                  value={newCollector.interval}
                  onChange={(e) => setNewCollector({ ...newCollector, interval: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Retenção (dias)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={newCollector.retention}
                  onChange={(e) => setNewCollector({ ...newCollector, retention: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createCollectorMutation.mutate()}
                disabled={createCollectorMutation.isPending}
                className="flex-1"
              >
                {createCollectorMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Novo Coletor
        </Button>
      )}

      {/* Collectors List */}
      <div className="space-y-3">
        {collectors.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhum coletor configurado</p>
            </CardContent>
          </Card>
        ) : (
          collectors.map((collector) => (
            <Card key={collector.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{collector.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {METRIC_TYPES[collector.metricType]}
                    </p>
                    <div className="flex gap-3 mt-3 text-xs text-slate-600">
                      <span>Intervalo: {collector.interval}s</span>
                      <span>Retenção: {collector.retention}d</span>
                      <span>Pontos coletados: {collector.pointsCollected || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Ativo</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCollectorMutation.mutate(collector.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Storage Stats */}
      {collectors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Armazenamento de Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700">Uso de Storage</span>
                  <span className="font-medium">2.4 GB / 10 GB</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}