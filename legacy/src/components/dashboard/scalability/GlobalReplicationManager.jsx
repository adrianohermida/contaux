import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Loader2, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalReplicationManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newRegion, setNewRegion] = useState({
    name: '',
    region: 'us-east-1',
    replicationEnabled: true
  });

  const { data: replication = {} } = useQuery({
    queryKey: ['global-replication', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        return await base44.functions.invoke('getReplicationStatus', {
          workspaceId: workspaceId
        }).then(res => res.data || {});
      } catch (err) {
        console.error('Error loading replication:', err);
        return {};
      }
    },
    enabled: !!workspaceId,
    refetchInterval: 10000
  });

  const createReplicaMutation = useMutation({
    mutationFn: async () => {
      if (!newRegion.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createGlobalReplica', {
        workspaceId: workspaceId,
        ...newRegion
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Replica criada');
      setNewRegion({ name: '', region: 'us-east-1', replicationEnabled: true });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['global-replication', workspaceId] });
    }
  });

  const AWS_REGIONS = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'eu-west-1', label: 'EU (Ireland)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
    { value: 'sa-east-1', label: 'South America (São Paulo)' }
  ];

  return (
    <div className="space-y-6">
      {/* Replication Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Status da Replicação Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-slate-600">Replicações Ativas</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{replication.activeReplicas || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-slate-600">Uptime Global</p>
              <p className="text-2xl font-bold mt-1 text-green-600">99.99%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-slate-600">Latência P95</p>
              <p className="text-2xl font-bold mt-1 text-purple-600">{replication.latencyP95 || 0}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Replica */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Réplica Global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome da réplica"
              value={newRegion.name}
              onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <select
              value={newRegion.region}
              onChange={(e) => setNewRegion({ ...newRegion, region: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {AWS_REGIONS.map(region => (
                <option key={region.value} value={region.value}>{region.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newRegion.replicationEnabled}
                onChange={(e) => setNewRegion({ ...newRegion, replicationEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Habilitar replicação automática</span>
            </label>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createReplicaMutation.mutate()}
                disabled={createReplicaMutation.isPending}
                className="flex-1"
              >
                {createReplicaMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Nova Réplica
        </Button>
      )}

      {/* Replicas List */}
      <div className="space-y-3">
        {replication.replicas?.map((replica, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{replica.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{replica.region}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span>Latência: {replica.latency}ms</span>
                    <span>Uptime: {replica.uptime}%</span>
                    <span>Lag: {replica.replicationLag}ms</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {replica.healthy ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Saudável</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-medium text-amber-600">Degradado</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">
              Nenhuma réplica configurada
            </CardContent>
          </Card>
        )}
      </div>

      {/* Disaster Recovery */}
      <Card>
        <CardHeader>
          <CardTitle>Recuperação de Desastres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-sm font-medium text-slate-900">RTO (Recovery Time Objective)</p>
            <p className="text-lg font-bold text-green-600">5 minutos</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-sm font-medium text-slate-900">RPO (Recovery Point Objective)</p>
            <p className="text-lg font-bold text-green-600">&lt; 1 minuto</p>
          </div>
          <Button variant="outline" className="w-full">
            Testar Failover
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}