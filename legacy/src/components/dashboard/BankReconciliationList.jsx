import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function BankReconciliationList({ tenantId, onEdit, onRefresh }) {
  const { data: reconciliations = [], isLoading: loading, refetch, error } = useQuery({
    queryKey: ['BankReconciliation-list', tenantId, onRefresh],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.BankReconciliation.filter({ tenant_id: tenantId });
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  });

  const handleDelete = useCallback(async (id, period) => {
    if (!confirm(`Tem certeza que deseja deletar a reconciliação de ${period}? Esta ação não pode ser desfeita.`)) return;
    try {
      await base44.entities.BankReconciliation.delete(id);
      toast.success('Reconciliação deletada com sucesso');
      refetch();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao deletar reconciliação. Tente novamente.');
    }
  }, [refetch]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'discrepancy_found': 'bg-red-100 text-red-800',
      'needs_review': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-slate-100';
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 mb-4">Erro ao carregar reconciliações</p>
        <button onClick={() => refetch()} className="text-red-500 hover:text-red-700 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando reconciliações...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left py-3 px-4">Banco</th>
            <th className="text-left py-3 px-4">Período</th>
            <th className="text-left py-3 px-4">Saldo Extrato</th>
            <th className="text-left py-3 px-4">Variância</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reconciliations.map(recon => (
            <tr key={recon.id} className="hover:bg-slate-50">
              <td className="py-3 px-4 font-medium">{recon.bank_account_id || '-'}</td>
              <td className="py-3 px-4 text-xs">
                {new Date(recon.statement_period_start).toLocaleDateString('pt-BR')} até{' '}
                {new Date(recon.statement_period_end).toLocaleDateString('pt-BR')}
              </td>
              <td className="py-3 px-4 text-right font-medium">
                R$ {recon.statement_balance.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </td>
              <td className="py-3 px-4 text-right">
                <span className={Math.abs(recon.variance_amount) > 0.01 ? 'text-red-600 font-medium' : 'text-green-600'}>
                  R$ {recon.variance_amount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(recon.reconciliation_status)}`}>
                  {recon.reconciliation_status === 'in_progress' && 'Em Progresso'}
                  {recon.reconciliation_status === 'completed' && 'Concluído'}
                  {recon.reconciliation_status === 'discrepancy_found' && 'Discrepância'}
                  {recon.reconciliation_status === 'needs_review' && 'Revisar'}
                </span>
              </td>
              <td className="py-3 px-4 flex justify-end gap-2">
                <Button size="icon" variant="ghost" onClick={() => onEdit(recon)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(recon.id, `${new Date(recon.statement_period_start).toLocaleDateString('pt-BR')}`)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {reconciliations.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma reconciliação cadastrada</p>
          <p className="text-slate-400 text-sm mt-1">Comece criando uma nova reconciliação bancária</p>
        </div>
      )}
    </div>
  );
}