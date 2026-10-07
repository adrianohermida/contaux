import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Loader2, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowAutomation({ workspaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    trigger: 'invoice_created',
    action: 'send_email',
    enabled: true
  });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      try {
        return await base44.entities.Workflow.filter({ workspace_id: workspaceId });
      } catch (err) {
        console.error('Error loading workflows:', err);
        return [];
      }
    },
    enabled: !!workspaceId
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async () => {
      if (!newWorkflow.name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      return base44.entities.Workflow.create({
        workspace_id: workspaceId,
        name: newWorkflow.name,
        trigger_type: newWorkflow.trigger,
        trigger_config: { action: newWorkflow.action },
        nodes: [],
        status: newWorkflow.enabled ? 'active' : 'inactive'
      });
    },
    onSuccess: () => {
      toast.success('Fluxo de trabalho criado');
      setNewWorkflow({ name: '', trigger: 'invoice_created', action: 'send_email', enabled: true });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] });
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao criar fluxo');
    }
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: async (id) => {
      const workflow = workflows.find(w => w.id === id);
      return base44.entities.Workflow.update(id, {
        status: workflow?.status === 'active' ? 'inactive' : 'active'
      });
    },
    onSuccess: () => {
      toast.success('Fluxo atualizado');
      queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] });
    }
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Workflow.delete(id);
    },
    onSuccess: () => {
      toast.success('Fluxo removido');
      queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] });
    },
    onError: () => {
      toast.error('Erro ao remover fluxo');
    }
  });

  const TRIGGERS = {
    invoice_created: 'Fatura criada',
    invoice_paid: 'Fatura paga',
    client_added: 'Cliente adicionado',
    ticket_opened: 'Ticket aberto',
    ticket_closed: 'Ticket fechado',
    payment_received: 'Pagamento recebido'
  };

  const ACTIONS = {
    send_email: 'Enviar email',
    create_task: 'Criar tarefa',
    notify_user: 'Notificar usuário',
    update_field: 'Atualizar campo',
    export_data: 'Exportar dados'
  };

  return (
    <div className="space-y-6">
      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Fluxo de Trabalho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Nome do fluxo"
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Gatilho</label>
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {Object.entries(TRIGGERS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Ação</label>
                <select
                  value={newWorkflow.action}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, action: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {Object.entries(ACTIONS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newWorkflow.enabled}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Ativar imediatamente</span>
            </label>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => createWorkflowMutation.mutate()}
                disabled={createWorkflowMutation.isPending}
                className="flex-1 gap-2"
              >
                {createWorkflowMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar Fluxo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Novo Fluxo de Trabalho
        </Button>
      )}

      {/* Workflows List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
          </div>
        ) : workflows.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhum fluxo de trabalho criado</p>
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{workflow.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {TRIGGERS[workflow.trigger_type]} → {ACTIONS[workflow.trigger_config?.action]}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Execuções: {workflow.execution_count || 0} | Sucesso: {workflow.success_count || 0}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWorkflowMutation.mutate(workflow.id)}
                      className="p-2 hover:bg-slate-100 rounded"
                    >
                      {workflow.status === 'active' ? (
                        <ToggleRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteWorkflowMutation.mutate(workflow.id)}
                      className="p-2 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
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