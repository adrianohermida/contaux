import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCacheStrategy } from '../hooks/useCacheStrategy';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

const ProcessRow = React.memo(({ process, onEdit, onDelete, getPriorityColor }) => (
  <tr className="hover:bg-slate-50">
    <td className="px-6 py-4 text-sm font-medium">{process.process_number}</td>
    <td className="px-6 py-4 text-sm">{process.title}</td>
    <td className="px-6 py-4 text-sm">
      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(process.priority)}`}>
        {process.priority}
      </span>
    </td>
    <td className="px-6 py-4 text-sm">
      <span className="px-2 py-1 bg-slate-100 rounded text-xs">
        {process.status}
      </span>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(process)}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(process.id, process.process_number)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </td>
  </tr>
));

ProcessRow.displayName = 'ProcessRow';

export default function LegalProcessList({ tenantId, onEdit, onRefresh }) {
  const { invalidateRelated } = useCacheStrategy();
  const { isConnected } = useRealtimeSync('LegalProcess', tenantId);

  const { data: processes = [], isLoading: loading, refetch, error } = useQuery({
    queryKey: ['LegalProcess-list', tenantId, onRefresh],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.LegalProcess.filter({ 
        workspace_id: tenantId 
      });
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  });

  useEffect(() => {
    if (onRefresh) refetch();
  }, [onRefresh, refetch]);

  const handleDelete = useCallback(async (id, processNumber) => {
    if (!confirm(`Tem certeza que deseja deletar o processo ${processNumber}? Esta ação não pode ser desfeita.`)) return;
    try {
      await base44.entities.LegalProcess.delete(id);
      toast.success('Processo deletado com sucesso');
      invalidateRelated('LegalProcess', id);
      refetch();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar processo. Tente novamente.');
    }
  }, [invalidateRelated, refetch]);

  const getPriorityColor = useCallback((priority) => {
    const colors = { low: 'bg-blue-100 text-blue-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-orange-100 text-orange-800', urgent: 'bg-red-100 text-red-800' };
    return colors[priority] || 'bg-slate-100';
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 mb-4">Erro ao carregar processos</p>
        <button onClick={() => refetch()} className="text-red-500 hover:text-red-700 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando processos...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Nº Processo</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Título</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Prioridade</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-3 text-right text-sm font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {processes.map((p) => (
            <ProcessRow 
              key={p.id} 
              process={p} 
              onEdit={onEdit} 
              onDelete={handleDelete} 
              getPriorityColor={getPriorityColor} 
            />
          ))}
        </tbody>
      </table>
      {processes.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhum processo cadastrado</p>
          <p className="text-slate-400 text-sm mt-1">Comece criando um novo processo judicial</p>
        </div>
      )}
    </div>
  );
}