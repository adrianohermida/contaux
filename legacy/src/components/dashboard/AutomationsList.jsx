import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Edit, Trash2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function AutomationsList({ tenantId, onEdit, onRefresh }) {
  const { data: automations = [], isLoading: loading, refetch, error } = useQuery({
    queryKey: ['Workflow-list', tenantId, onRefresh],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.Workflow.filter({ workspace_id: tenantId });
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  });

  const handleDelete = useCallback(async (id, name) => {
    if (!confirm(`Tem certeza que deseja deletar a automação "${name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await base44.entities.Workflow.delete(id);
      toast.success('Automação deletada com sucesso');
      refetch();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao deletar automação. Tente novamente.');
    }
  }, [refetch]);

  const handleToggle = useCallback(async (workflow) => {
    try {
      const newStatus = workflow.status === 'active' ? 'inactive' : 'active';
      await base44.entities.Workflow.update(workflow.id, { status: newStatus });
      toast.success(`Automação ${newStatus === 'active' ? 'ativada' : 'desativada'}`);
      refetch();
    } catch (err) {
      console.error('Erro ao alternar:', err);
      toast.error('Erro ao alternar automação. Tente novamente.');
    }
  }, [refetch]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 mb-4">Erro ao carregar automações</p>
        <button onClick={() => refetch()} className="text-red-500 hover:text-red-700 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando automações...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left py-3 px-4">Automação</th>
            <th className="text-left py-3 px-4">Tipo de Gatilho</th>
            <th className="text-left py-3 px-4">Execuções</th>
            <th className="text-left py-3 px-4">Sucesso</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {automations.map(workflow => (
            <tr key={workflow.id} className="hover:bg-slate-50">
              <td className="py-3 px-4 font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <div>
                  <p>{workflow.name}</p>
                  <p className="text-xs text-slate-500">{workflow.description}</p>
                </div>
              </td>
              <td className="py-3 px-4 text-xs">
                {workflow.trigger_type === 'customer_added' && 'Cliente Adicionado'}
                {workflow.trigger_type === 'health_changed' && 'Status Alterado'}
                {workflow.trigger_type === 'milestone' && 'Marco Atingido'}
                {workflow.trigger_type === 'custom' && 'Customizado'}
              </td>
              <td className="py-3 px-4 font-medium">{workflow.execution_count || 0}</td>
              <td className="py-3 px-4">
                <span className="text-green-600 font-medium">{workflow.success_count || 0}</span>
                {workflow.error_count > 0 && <span className="text-red-600 ml-2">({workflow.error_count} erros)</span>}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                  {workflow.status === 'active' ? 'Ativa' : 'Inativa'}
                </span>
              </td>
              <td className="py-3 px-4 flex justify-end gap-2">
                <Button size="icon" variant="ghost" onClick={() => handleToggle(workflow)}>
                  {workflow.status === 'active' ? (
                    <ToggleRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-slate-600" />
                  )}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onEdit(workflow)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(workflow.id, workflow.name)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {automations.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma automação configurada</p>
          <p className="text-slate-400 text-sm mt-1">Comece criando uma nova automação</p>
        </div>
      )}
    </div>
  );
}