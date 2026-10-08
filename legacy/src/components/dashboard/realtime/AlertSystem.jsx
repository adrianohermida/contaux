import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, CheckCircle, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertSystem({ workspaceId, alerts = [] }) {
  const queryClient = useQueryClient();
  const [newAlert, setNewAlert] = useState({
    name: '',
    metric: 'revenue',
    threshold: 0,
    comparison: 'above',
    email: ''
  });

  const { data: systemAlerts = [], isLoading } = useQuery({
    queryKey: ['system-alerts', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.Notification.filter({
        tenant_id: workspaceId,
        type: 'alert'
      }) || [];
    },
    enabled: !!workspaceId,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const createAlertMutation = useMutation({
    mutationFn: async (alertData) => {
      return base44.entities.Notification.create({
        tenant_id: workspaceId,
        type: 'alert',
        status: 'active',
        ...alertData,
        triggered_count: 0
      });
    },
    onSuccess: () => {
      toast.success('Alerta criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['system-alerts', workspaceId] });
      setNewAlert({
        name: '',
        metric: 'revenue',
        threshold: 0,
        comparison: 'above',
        email: ''
      });
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Notification.delete(id);
    },
    onSuccess: () => {
      toast.success('Alerta removido');
      queryClient.invalidateQueries({ queryKey: ['system-alerts', workspaceId] });
    }
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return base44.entities.Notification.update(id, {
        status: status === 'active' ? 'inactive' : 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts', workspaceId] });
    }
  });

  const handleCreateAlert = () => {
    if (!newAlert.name || !newAlert.threshold || !newAlert.email) {
      toast.error('Preencha todos os campos');
      return;
    }
    createAlertMutation.mutate(newAlert);
  };

  const getAlertIcon = (status) => {
    switch (status) {
      case 'triggered':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Incoming Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-900">{alert.message}</p>
                <p className="text-sm text-red-700 mt-1">{new Date(alert.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Novo Alerta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            placeholder="Nome do alerta"
            value={newAlert.name}
            onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Métrica</label>
              <select
                value={newAlert.metric}
                onChange={(e) => setNewAlert({ ...newAlert, metric: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="revenue">Receita</option>
                <option value="overdue">Vencido</option>
                <option value="tickets">Tickets</option>
                <option value="clients">Clientes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Comparação</label>
              <select
                value={newAlert.comparison}
                onChange={(e) => setNewAlert({ ...newAlert, comparison: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="above">Acima de</option>
                <option value="below">Abaixo de</option>
              </select>
            </div>
          </div>

          <input
            type="number"
            placeholder="Valor limite"
            value={newAlert.threshold}
            onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          <input
            type="email"
            placeholder="Email para notificação"
            value={newAlert.email}
            onChange={(e) => setNewAlert({ ...newAlert, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          <Button
            onClick={handleCreateAlert}
            disabled={createAlertMutation.isPending}
            className="w-full gap-2"
          >
            {createAlertMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Criar Alerta
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : systemAlerts.length === 0 ? (
            <p className="text-center text-slate-500 py-6">Nenhum alerta configurado</p>
          ) : (
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getAlertIcon(alert.status)}
                    <div>
                      <p className="font-medium text-slate-900">{alert.alert_name}</p>
                      <p className="text-xs text-slate-600">
                        {alert.metric} {alert.comparison} {alert.threshold} • {alert.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlertMutation.mutate({ id: alert.id, status: alert.status })}
                      className="p-2 hover:bg-slate-200 rounded text-xs font-medium"
                    >
                      {alert.status === 'active' ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      disabled={deleteAlertMutation.isPending}
                      className="p-2 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}