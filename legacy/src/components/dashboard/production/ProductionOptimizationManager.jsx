import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Loader2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionOptimizationManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: '',
    strategy: 'round-robin',
    throttleRPS: 1000,
    cacheEnabled: true
  });

  const { data: configurations = [] } = useQuery({
    queryKey: ['prod-optimization', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listProductionConfigs', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        console.error('Error:', err);
        return [];
      }
    },
    enabled: !!workspaceId
  });

  const createConfigMutation = useMutation({
    mutationFn: async () => {
      if (!newConfig.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createProductionConfig', {
        workspaceId: workspaceId,
        ...newConfig
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Configuração criada');
      setNewConfig({ name: '', strategy: 'round-robin', throttleRPS: 1000, cacheEnabled: true });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['prod-optimization', workspaceId] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Request/sec</p>
              <p className="text-2xl font-bold mt-1">5.2K</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Avg Latency</p>
              <p className="text-2xl font-bold mt-1">45ms</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Cache Hit Rate</p>
              <p className="text-2xl font-bold mt-1">92.3%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Configuração de Produção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome da configuração"
              value={newConfig.name}
              onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <select
              value={newConfig.strategy}
              onChange={(e) => setNewConfig({ ...newConfig, strategy: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="round-robin">Round Robin</option>
              <option value="least-conn">Least Connections</option>
              <option value="ip-hash">IP Hash</option>
              <option value="weighted">Weighted</option>
            </select>

            <div>
              <label className="text-xs font-medium text-slate-700">Requisições/seg</label>
              <input
                type="number"
                value={newConfig.throttleRPS}
                onChange={(e) => setNewConfig({ ...newConfig, throttleRPS: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mt-1"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newConfig.cacheEnabled}
                onChange={(e) => setNewConfig({ ...newConfig, cacheEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Habilitar Cache</span>
            </label>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createConfigMutation.mutate()}
                disabled={createConfigMutation.isPending}
                className="flex-1"
              >
                {createConfigMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Nova Configuração
        </Button>
      )}

      <div className="space-y-3">
        {configurations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">Nenhuma configuração</CardContent>
          </Card>
        ) : (
          configurations.map((config) => (
            <Card key={config.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{config.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">Estratégia: {config.strategy}</p>
                    <p className="text-sm text-slate-600">Throttle: {config.throttleRPS} RPS</p>
                    {config.cacheEnabled && (
                      <p className="text-xs text-green-600 mt-1">✓ Cache ativo</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}