import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Loader2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RateLimitingEngine({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newLimit, setNewLimit] = useState({
    type: 'ip',
    identifier: '',
    limit: 1000,
    window: 60,
    algorithm: 'token-bucket'
  });

  const { data: limits = [] } = useQuery({
    queryKey: ['rate-limits', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listRateLimits', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        return [];
      }
    },
    enabled: !!workspaceId
  });

  const createLimitMutation = useMutation({
    mutationFn: async () => {
      if (!newLimit.identifier.trim()) throw new Error('Identificador é obrigatório');
      return base44.functions.invoke('createRateLimit', {
        workspaceId: workspaceId,
        ...newLimit
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Rate limit criado');
      setNewLimit({ type: 'ip', identifier: '', limit: 1000, window: 60, algorithm: 'token-bucket' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['rate-limits', workspaceId] });
    }
  });

  const LIMIT_TYPES = { ip: 'Por IP', user: 'Por Usuário', endpoint: 'Por Endpoint', 'api-key': 'Por API Key' };
  const ALGORITHMS = { 'token-bucket': 'Token Bucket', 'leaky-bucket': 'Leaky Bucket', 'fixed-window': 'Fixed Window', 'sliding-window': 'Sliding Window' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Taxa de Violação</p>
              <p className="text-2xl font-bold mt-1">0.23%</p>
              <p className="text-xs text-slate-500 mt-1">Últimas 24 horas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Requests Rejeitados</p>
              <p className="text-2xl font-bold mt-1">1.2K</p>
              <p className="text-xs text-slate-500 mt-1">Últimas 24 horas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Rate Limit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={newLimit.type}
              onChange={(e) => setNewLimit({ ...newLimit, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {Object.entries(LIMIT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Identificador (IP, user ID, endpoint, etc)"
              value={newLimit.identifier}
              onChange={(e) => setNewLimit({ ...newLimit, identifier: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <select
              value={newLimit.algorithm}
              onChange={(e) => setNewLimit({ ...newLimit, algorithm: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {Object.entries(ALGORITHMS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">Limite (req)</label>
                <input
                  type="number"
                  value={newLimit.limit}
                  onChange={(e) => setNewLimit({ ...newLimit, limit: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Janela (seg)</label>
                <input
                  type="number"
                  value={newLimit.window}
                  onChange={(e) => setNewLimit({ ...newLimit, window: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createLimitMutation.mutate()}
                disabled={createLimitMutation.isPending}
                className="flex-1"
              >
                {createLimitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Novo Limite
        </Button>
      )}

      <div className="space-y-3">
        {limits.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">Nenhum rate limit configurado</CardContent>
          </Card>
        ) : (
          limits.map((limit) => (
            <Card key={limit.id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{LIMIT_TYPES[limit.type]}</h3>
                      <p className="text-xs text-slate-600 mt-1">{limit.identifier}</p>
                    </div>
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>{limit.limit} req / {limit.window}s ({ALGORITHMS[limit.algorithm]})</p>
                    {limit.recentViolations > 0 && (
                      <div className="flex items-center gap-1 text-amber-600 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{limit.recentViolations} violações recentes</span>
                      </div>
                    )}
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