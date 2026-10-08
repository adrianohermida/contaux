import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CircuitBreakerManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newBreaker, setNewBreaker] = useState({
    serviceName: '',
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60,
    fallback: 'fail-fast'
  });

  const { data: breakers = [] } = useQuery({
    queryKey: ['circuit-breakers', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listCircuitBreakers', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        return [];
      }
    },
    enabled: !!workspaceId,
    refetchInterval: 5000
  });

  const createBreakerMutation = useMutation({
    mutationFn: async () => {
      if (!newBreaker.serviceName.trim()) throw new Error('Nome do serviço é obrigatório');
      return base44.functions.invoke('createCircuitBreaker', {
        workspaceId: workspaceId,
        ...newBreaker
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Circuit breaker criado');
      setNewBreaker({ serviceName: '', failureThreshold: 5, successThreshold: 2, timeout: 60, fallback: 'fail-fast' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['circuit-breakers', workspaceId] });
    }
  });

  const getStateColor = (state) => {
    switch(state) {
      case 'CLOSED': return 'text-green-600';
      case 'OPEN': return 'text-red-600';
      case 'HALF_OPEN': return 'text-yellow-600';
      default: return 'text-slate-600';
    }
  };

  const getStateIcon = (state) => {
    switch(state) {
      case 'CLOSED': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'OPEN': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Shield className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Fechados</p>
              <p className="text-2xl font-bold mt-1">7</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Abertos</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Semi-abertos</p>
              <p className="text-2xl font-bold mt-1">1</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Circuit Breaker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome do serviço"
              value={newBreaker.serviceName}
              onChange={(e) => setNewBreaker({ ...newBreaker, serviceName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">Falhas</label>
                <input
                  type="number"
                  value={newBreaker.failureThreshold}
                  onChange={(e) => setNewBreaker({ ...newBreaker, failureThreshold: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Sucessos</label>
                <input
                  type="number"
                  value={newBreaker.successThreshold}
                  onChange={(e) => setNewBreaker({ ...newBreaker, successThreshold: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Timeout (s)</label>
                <input
                  type="number"
                  value={newBreaker.timeout}
                  onChange={(e) => setNewBreaker({ ...newBreaker, timeout: parseInt(e.target.value) })}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm mt-1"
                />
              </div>
            </div>

            <select
              value={newBreaker.fallback}
              onChange={(e) => setNewBreaker({ ...newBreaker, fallback: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="fail-fast">Fail-fast</option>
              <option value="use-cache">Usar Cache</option>
              <option value="degrade">Degradação</option>
            </select>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createBreakerMutation.mutate()}
                disabled={createBreakerMutation.isPending}
                className="flex-1"
              >
                {createBreakerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Novo Circuit Breaker
        </Button>
      )}

      <div className="space-y-3">
        {breakers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">Nenhum circuit breaker configurado</CardContent>
          </Card>
        ) : (
          breakers.map((breaker) => (
            <Card key={breaker.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{breaker.serviceName}</h3>
                      <p className={`text-sm font-medium mt-1 ${getStateColor(breaker.state)}`}>
                        {breaker.state}
                      </p>
                    </div>
                    {getStateIcon(breaker.state)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-slate-600">Falhas: {breaker.failureCount}/{breaker.failureThreshold}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-slate-600">Taxa sucesso: {breaker.successRate || 0}%</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    Total: {breaker.totalRequests} req | Reject: {breaker.rejectedRequests}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}