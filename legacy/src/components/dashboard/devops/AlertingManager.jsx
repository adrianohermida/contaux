import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, CheckCircle, AlertCircle, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertingManager({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    metric: 'cpu',
    threshold: 80,
    condition: 'above',
    notificationChannel: 'email'
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['monitoring-alerts', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.functions.invoke('listMonitoringAlerts', {
          workspaceId: workspaceId
        }).then(res => res.data || []);
      } catch (err) {
        console.error('Error loading alerts:', err);
        return [];
      }
    },
    enabled: !!workspaceId
  });

  const createAlertMutation = useMutation({
    mutationFn: async () => {
      if (!newAlert.name.trim()) throw new Error('Nome é obrigatório');
      return base44.functions.invoke('createMonitoringAlert', {
        workspaceId: workspaceId,
        ...newAlert
      }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Alerta criado');
      setNewAlert({ name: '', metric: 'cpu', threshold: 80, condition: 'above', notificationChannel: 'email' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['monitoring-alerts', workspaceId] });
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id) => {
      return base44.functions.invoke('deleteMonitoringAlert', { alertId: id }).then(res => res.data);
    },
    onSuccess: () => {
      toast.success('Alerta removido');
      queryClient.invalidateQueries({ queryKey: ['monitoring-alerts', workspaceId] });
    }
  });

  const METRICS = {
    cpu: 'CPU',
    memory: 'Memória',
    disk: 'Disco',
    network: 'Rede',
    errors: 'Erros',
    latency: 'Latência'
  };

  return (
    <div className="space-y-6">
      {/* Create Alert */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Alerta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome do alerta"
              value={newAlert.name}
              onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={newAlert.metric}
                onChange={(e) => setNewAlert({ ...newAlert, metric: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {Object.entries(METRICS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="above">Acima de</option>
                <option value="below">Abaixo de</option>
              </select>
            </div>

            <input
              type="number"
              placeholder="Limite"
              value={newAlert.threshold}
              onChange={(e) => setNewAlert({ ...newAlert, threshold: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <select
              value={newAlert.notificationChannel}
              onChange={(e) => setNewAlert({ ...newAlert, notificationChannel: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="email">Email</option>
              <option value="slack">Slack</option>
              <option value="sms">SMS</option>
              <option value="webhook">Webhook</option>
            </select>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => createAlertMutation.mutate()}
                disabled={createAlertMutation.isPending}
                className="flex-1"
              >
                {createAlertMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Alerta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Novo Alerta
        </Button>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhum alerta configurado</p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{alert.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {METRICS[alert.metric]} {alert.condition === 'above' ? '>' : '<'} {alert.threshold}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {alert.notificationChannel}
                      </span>
                      {alert.active ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlertMutation.mutate(alert.id)}
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