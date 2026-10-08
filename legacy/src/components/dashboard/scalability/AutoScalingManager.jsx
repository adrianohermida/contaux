import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoScalingManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    targetMetric: 'cpu',
    minInstances: 2,
    maxInstances: 10,
    targetValue: 70
  });

  const { data: policies = [] } = useQuery({
    queryKey: ['autoscaling-policies', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listAutoScalingPolicies', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        console.error('Error loading policies:', err);
        return [];
      }
    },
    enabled: !!workspaceId
  });

  const createPolicyMutation = useMutation({
    mutationFn: async () => {
      if (!newPolicy.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createAutoScalingPolicy', {
        workspaceId: workspaceId,
        ...newPolicy
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Política criada');
      setNewPolicy({ name: '', targetMetric: 'cpu', minInstances: 2, maxInstances: 10, targetValue: 70 });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['autoscaling-policies', workspaceId] });
    }
  });

  const deletePolicyMutation = useMutation({
    mutationFn: async (id) => {
      return base44.functions.invoke('deleteAutoScalingPolicy', { policyId: id }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Política removida');
      queryClient.invalidateQueries({ queryKey: ['autoscaling-policies', workspaceId] });
    }
  });

  const METRICS = { cpu: 'CPU', memory: 'Memória', requests: 'Requisições', latency: 'Latência' };

  return (
    <div className="space-y-6">
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Política de Auto-scaling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome da política"
              value={newPolicy.name}
              onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <select
              value={newPolicy.targetMetric}
              onChange={(e) => setNewPolicy({ ...newPolicy, targetMetric: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {Object.entries(METRICS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">Mínimo</label>
                <input
                  type="number"
                  min="1"
                  value={newPolicy.minInstances}
                  onChange={(e) => setNewPolicy({ ...newPolicy, minInstances: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Máximo</label>
                <input
                  type="number"
                  min="1"
                  value={newPolicy.maxInstances}
                  onChange={(e) => setNewPolicy({ ...newPolicy, maxInstances: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Alvo (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newPolicy.targetValue}
                  onChange={(e) => setNewPolicy({ ...newPolicy, targetValue: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createPolicyMutation.mutate()}
                disabled={createPolicyMutation.isPending}
                className="flex-1"
              >
                {createPolicyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Nova Política
        </Button>
      )}

      <div className="space-y-3">
        {policies.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhuma política configurada</p>
            </CardContent>
          </Card>
        ) : (
          policies.map((policy) => (
            <Card key={policy.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{policy.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{METRICS[policy.targetMetric]} - Alvo: {policy.targetValue}%</p>
                    <div className="flex gap-3 mt-2 text-sm">
                      <span>Min: {policy.minInstances}</span>
                      <span>Max: {policy.maxInstances}</span>
                      <span>Atuais: {policy.currentInstances || policy.minInstances}</span>
                    </div>
                    <div className="mt-2">
                      {policy.active ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Ativo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          Inativo
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePolicyMutation.mutate(policy.id)}
                  >
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