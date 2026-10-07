import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Play, Pause, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AutomatedWorkflowPanel({ clientId, tenantId }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'invoice_created',
    actions: ['send_notification'],
    enabled: true,
    schedule: 'manual'
  });

  const TRIGGER_TYPES = [
    { value: 'invoice_created', label: '📄 Fatura Criada' },
    { value: 'payment_received', label: '💰 Pagamento Recebido' },
    { value: 'nfe_issued', label: '📋 NF-e Emitida' },
    { value: 'scheduled', label: '⏰ Agendado' },
    { value: 'certificate_expiring', label: '🔐 Certificado Expirando' }
  ];

  const ACTION_OPTIONS = [
    { value: 'send_notification', label: '🔔 Enviar Notificação' },
    { value: 'send_email', label: '📧 Enviar Email' },
    { value: 'create_task', label: '✓ Criar Tarefa' },
    { value: 'update_status', label: '🔄 Atualizar Status' },
    { value: 'call_webhook', label: '🔗 Chamar Webhook' },
    { value: 'generate_report', label: '📊 Gerar Relatório' },
    { value: 'backup_data', label: '💾 Fazer Backup' }
  ];

  const SCHEDULES = [
    { value: 'manual', label: 'Manual' },
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' }
  ];

  useEffect(() => {
    loadWorkflows();
  }, [clientId, tenantId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      // Simular workflows (em prod viria do BD)
      const simulatedWorkflows = [
        {
          id: 'wf_001',
          name: 'Notificar Cliente - Pagamento Recebido',
          description: 'Envia notificação ao cliente quando pagamento é recebido',
          trigger_type: 'payment_received',
          actions: ['send_notification', 'send_email'],
          enabled: true,
          schedule: 'manual',
          execution_count: 45,
          last_execution: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(Date.now() - 604800000).toISOString()
        },
        {
          id: 'wf_002',
          name: 'Backup Automático Diário',
          description: 'Realiza backup de todos os dados diariamente',
          trigger_type: 'scheduled',
          actions: ['backup_data'],
          enabled: true,
          schedule: 'daily',
          execution_count: 30,
          last_execution: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date(Date.now() - 1209600000).toISOString()
        }
      ];
      setWorkflows(simulatedWorkflows);
      
      // Simular histórico de execução
      const simulatedHistory = [
        {
          id: 'exec_001',
          workflow_id: 'wf_001',
          status: 'success',
          executed_at: new Date(Date.now() - 3600000).toISOString(),
          duration_ms: 1250,
          message: 'Notificação enviada com sucesso'
        },
        {
          id: 'exec_002',
          workflow_id: 'wf_002',
          status: 'success',
          executed_at: new Date(Date.now() - 86400000).toISOString(),
          duration_ms: 3500,
          message: 'Backup completado - 2.5 GB processados'
        }
      ];
      setExecutionHistory(simulatedHistory);
    } catch (error) {
      console.error('Erro ao carregar workflows:', error);
      toast.error('Erro ao carregar workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Nome do workflow obrigatório');
      return;
    }

    try {
      setLoading(true);

      const newWorkflow = {
        ...formData,
        id: editingId || `wf_${Date.now()}`,
        execution_count: 0,
        last_execution: null,
        created_at: new Date().toISOString()
      };

      if (editingId) {
        setWorkflows(prev =>
          prev.map(w => w.id === editingId ? { ...w, ...newWorkflow } : w)
        );
        toast.success('Workflow atualizado!');
      } else {
        setWorkflows(prev => [...prev, newWorkflow]);
        toast.success('Workflow criado!');
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = (id) => {
    setWorkflows(prev =>
      prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    );
  };

  const handleExecuteWorkflow = async (id) => {
    try {
      setLoading(true);
      const workflow = workflows.find(w => w.id === id);

      const execution = {
        id: `exec_${Date.now()}`,
        workflow_id: id,
        status: 'success',
        executed_at: new Date().toISOString(),
        duration_ms: Math.random() * 5000,
        message: `Workflow '${workflow.name}' executado com sucesso`
      };

      setExecutionHistory(prev => [execution, ...prev]);
      setWorkflows(prev =>
        prev.map(w => w.id === id
          ? { ...w, execution_count: (w.execution_count || 0) + 1, last_execution: new Date().toISOString() }
          : w
        )
      );

      toast.success('Workflow executado!');
    } catch (error) {
      console.error('Erro ao executar:', error);
      toast.error('Erro ao executar workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (id) => {
    if (!confirm('Confirmar exclusão do workflow?')) return;
    try {
      setWorkflows(prev => prev.filter(w => w.id !== id));
      toast.success('Workflow removido');
    } catch (error) {
      toast.error('Erro ao deletar workflow');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'invoice_created',
      actions: ['send_notification'],
      enabled: true,
      schedule: 'manual'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    return {
      success: 'bg-green-50 text-green-800 border-green-200',
      error: 'bg-red-50 text-red-800 border-red-200',
      pending: 'bg-blue-50 text-blue-800 border-blue-200'
    }[status] || 'bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={handleSaveWorkflow} className="bg-slate-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> {editingId ? 'Editar' : 'Criar'} Workflow
          </h3>

          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Notificação de Pagamento"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do workflow"
              className="w-full px-3 py-2 border rounded-lg"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Gatilho</label>
              <select
                value={formData.trigger_type}
                onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {TRIGGER_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Agendamento</label>
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {SCHEDULES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ações</label>
            <div className="grid grid-cols-2 gap-2">
              {ACTION_OPTIONS.map(action => (
                <label key={action.value} className="flex items-center gap-2 p-2 rounded border hover:bg-blue-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.actions.includes(action.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          actions: [...formData.actions, action.value]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          actions: formData.actions.filter(a => a !== action.value)
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{action.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingId ? 'Atualizar' : 'Criar'} Workflow
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Workflows List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">⚙️ Workflows Automáticos</h3>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Workflow
            </Button>
          )}
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhum workflow configurado
          </div>
        ) : (
          <div className="space-y-3">
            {workflows.map(workflow => (
              <div
                key={workflow.id}
                className={`p-4 rounded-lg border ${
                  workflow.enabled ? 'bg-white' : 'bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{workflow.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        workflow.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {workflow.enabled ? '● Ativo' : '● Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{workflow.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {TRIGGER_TYPES.find(t => t.value === workflow.trigger_type)?.label}
                      </span>
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">
                        {workflow.actions.length} ação(ões)
                      </span>
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-800">
                        {workflow.execution_count || 0} execução(ões)
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExecuteWorkflow(workflow.id)}
                      disabled={loading}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleWorkflow(workflow.id)}
                    >
                      {workflow.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormData(workflow);
                        setEditingId(workflow.id);
                        setShowForm(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {workflow.last_execution && (
                  <p className="text-xs text-slate-500">
                    Última execução: {new Date(workflow.last_execution).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Execution History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📊 Histórico de Execução
        </h3>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {executionHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhuma execução registrada
            </div>
          ) : (
            executionHistory.map(exec => (
              <div key={exec.id} className={`p-3 rounded-lg border ${getStatusColor(exec.status)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {exec.status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                      <p className="font-medium text-sm">
                        {workflows.find(w => w.id === exec.workflow_id)?.name}
                      </p>
                    </div>
                    <p className="text-xs opacity-75">{exec.message}</p>
                  </div>
                  <div className="text-right ml-4 text-xs">
                    <p>{exec.duration_ms.toFixed(0)}ms</p>
                    <p className="opacity-75">{new Date(exec.executed_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-2">💡 Sobre Workflows:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Defina gatilhos para automatizar ações repetitivas</li>
          <li>Combine múltiplas ações em um único workflow</li>
          <li>Agende workflows para executar periodicamente</li>
          <li>Monitore histórico de execução e erros</li>
        </ul>
      </div>
    </div>
  );
}