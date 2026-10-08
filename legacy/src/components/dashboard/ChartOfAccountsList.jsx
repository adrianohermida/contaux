import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AccountRow = React.memo(({ account, onEdit, onDelete, getTypeColor }) => (
  <tr className="hover:bg-slate-50">
    <td className="px-6 py-4 text-sm font-medium">{account.account_number}</td>
    <td className="px-6 py-4 text-sm">{account.account_name}</td>
    <td className="px-6 py-4 text-sm">
      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(account.account_type)}`}>
        {account.account_type}
      </span>
    </td>
    <td className="px-6 py-4 text-sm font-medium text-right">{account.balance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
    <td className="px-6 py-4 text-sm">
      <span className={`px-2 py-1 rounded text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
        {account.is_active ? 'Ativa' : 'Inativa'}
      </span>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(account)}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(account.id, account.account_number)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </td>
  </tr>
));

AccountRow.displayName = 'AccountRow';

export default function ChartOfAccountsList({ tenantId, onEdit, onRefresh }) {
  const { data: accounts = [], isLoading: loading, refetch, error } = useQuery({
    queryKey: ['Account-list', tenantId, onRefresh],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.Account.filter({ tenant_id: tenantId });
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  });

  const handleDelete = useCallback(async (id, accountNumber) => {
    if (!confirm(`Tem certeza que deseja deletar a conta ${accountNumber}? Esta ação não pode ser desfeita.`)) return;
    try {
      await base44.entities.Account.delete(id);
      toast.success('Conta deletada com sucesso');
      refetch();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao deletar conta. Tente novamente.');
    }
  }, [refetch]);

  const getTypeColor = useCallback((type) => {
    const colors = { Asset: 'bg-blue-100 text-blue-800', Liability: 'bg-red-100 text-red-800', Equity: 'bg-purple-100 text-purple-800', Revenue: 'bg-green-100 text-green-800', Expense: 'bg-orange-100 text-orange-800' };
    return colors[type] || 'bg-slate-100';
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 mb-4">Erro ao carregar contas</p>
        <button onClick={() => refetch()} className="text-red-500 hover:text-red-700 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando contas...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Nº Conta</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Tipo</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Saldo</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-3 text-right text-sm font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {accounts.map((acc) => (
            <AccountRow 
              key={acc.id} 
              account={acc} 
              onEdit={onEdit} 
              onDelete={handleDelete} 
              getTypeColor={getTypeColor} 
            />
          ))}
        </tbody>
      </table>
      {accounts.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma conta cadastrada</p>
          <p className="text-slate-400 text-sm mt-1">Comece criando uma nova conta contábil</p>
        </div>
      )}
    </div>
  );
}