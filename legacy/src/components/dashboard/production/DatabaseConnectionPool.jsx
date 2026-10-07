import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Loader2, Plus, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function DatabaseConnectionPool({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newPool, setNewPool] = useState({
    name: '',
    maxConnections: 50,
    minConnections: 10,
    idleTimeout: 300,
    maxLifetime: 1800
  });

  const { data: pools = [] } = useQuery({
    queryKey: ['db-pools', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listDatabasePools', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        return [];
      }
    },
    enabled: !!workspaceId,
    refetchInterval: 5000
  });

  const createPoolMutation = useMutation({
    mutationFn: async () => {
      if (!newPool.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createDatabasePool', {
        workspaceId: workspaceId,
        ...newPool
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Pool de conexões criado');
      setNewPool({ name: '', maxConnections: 50, minConnections: 10, idleTimeout: 300, maxLifetime: 1800 });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['db-pools', workspaceId] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-600">Conexões Ativas</p>
            <p className="text-xl font-bold mt-1">42/50</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-600">Tempo Médio Espera</p>
            <p className="text-xl font-bold mt-1">12ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-600">Taxa Reutilização</p>
            <p className="text-xl font-bold mt-1">96.8%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-600">Total Criadas</p>
            <p className="text-xl font-bold mt-1">1.2K</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Pool de Conexões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome do pool"
              value={newPool.name}
              onChange={(e) => setNewPool({ ...newPool, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">Máximo</label>
                <input
                  type="number"
                  value={newPool.maxConnections}
                  onChange={(e) => setNewPool({ ...newPool, maxConnections: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Mínimo</label>
                <input
                  type="number"
                  value={newPool.minConnections}
                  onChange={(e) => setNewPool({ ...newPool, minConnections: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">Idle Timeout (s)</label>
                <input
                  type="number"
                  value={newPool.idleTimeout}
                  onChange={(e) => setNewPool({ ...newPool, idleTimeout: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Max Lifetime (s)</label>
                <input
                  type="number"
                  value={newPool.maxLifetime}
                  onChange={(e) => setNewPool({ ...newPool, maxLifetime: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createPoolMutation.mutate()}
                disabled={createPoolMutation.isPending}
                className="flex-1"
              >
                {createPoolMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Novo Pool
        </Button>
      )}

      <div className="space-y-3">
        {pools.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">Nenhum pool configurado</CardContent>
          </Card>
        ) : (
          pools.map((pool) => (
            <Card key={pool.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{pool.name}</h3>
                    <Database className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-slate-600">Ativas: {pool.activeConnections}/{pool.maxConnections}</p>
                      <div className="w-full bg-slate-200 rounded h-1 mt-1">
                        <div
                          className="bg-green-500 h-1 rounded"
                          style={{ width: `${(pool.activeConnections / pool.maxConnections) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-slate-600">Tempo Espera: {pool.avgWaitTime}ms</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <span>Timeout: {pool.idleTimeout}s</span>
                    <span>Lifetime: {pool.maxLifetime}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}