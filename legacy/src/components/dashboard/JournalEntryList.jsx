import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const EntryRow = React.memo(({ entry, onEdit, onDelete }) => (
  <tr className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
    <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">{new Date(entry.entry_date).toLocaleDateString('pt-BR')}</td>
    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{entry.reference_number || '-'}</td>
    <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">{entry.description}</td>
    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-slate-100">{entry.line_items?.length || 0}</td>
    <td className="px-6 py-4 text-sm">
      <span className={`px-2 py-1 rounded text-xs font-medium ${entry.is_posted ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}`}>
        {entry.is_posted ? 'Lançada' : 'Rascunho'}
      </span>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(entry)} className="dark:hover:bg-slate-600" aria-label={`Editar lançamento ${entry.reference_number || entry.id}`}>
          <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(entry.id, entry.reference_number || entry.id)} className="dark:hover:bg-slate-600" aria-label={`Deletar lançamento ${entry.reference_number || entry.id}`}>
          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" aria-hidden="true" />
        </Button>
      </div>
    </td>
  </tr>
));

EntryRow.displayName = 'EntryRow';

export default function JournalEntryList({ tenantId, onEdit, onRefresh }) {
  const { data: entries = [], isLoading: loading, refetch, error } = useQuery({
    queryKey: ['JournalEntry-list', tenantId, onRefresh],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.JournalEntry.filter({ tenant_id: tenantId });
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  });

  const handleDelete = useCallback(async (id, reference) => {
    if (!confirm(`Tem certeza que deseja deletar o lançamento ${reference}? Esta ação não pode ser desfeita.`)) return;
    try {
      await base44.entities.JournalEntry.delete(id);
      toast.success('Lançamento deletado com sucesso');
      refetch();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao deletar lançamento. Tente novamente.');
    }
  }, [refetch]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center transition-colors">
        <AlertCircle className="w-8 h-8 text-red-400 dark:text-red-500 mx-auto mb-2" aria-hidden="true" />
        <p className="text-red-600 dark:text-red-300 mb-4">Erro ao carregar lançamentos</p>
        <button onClick={() => refetch()} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline" aria-label="Tentar novamente">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-slate-500 dark:text-slate-400" role="status" aria-live="polite">Carregando lançamentos...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <table className="w-full" role="table" aria-label="Lista de lançamentos contábeis">
        <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Data</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Referência</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Descrição</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Linhas</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Status</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} onEdit={onEdit} onDelete={handleDelete} />
          ))}
        </tbody>
      </table>
      {entries.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-700/30">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum lançamento cadastrado</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Comece criando um novo lançamento contábil</p>
        </div>
      )}
    </div>
  );
}