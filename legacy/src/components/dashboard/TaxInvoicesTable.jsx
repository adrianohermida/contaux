import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Edit, Trash2, AlertCircle, Download, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaxInvoicesTable({ tenantId, onEdit, onRefresh, onSuccess }) {
  const { data: invoices = [], isLoading: loading, refetch, error } = useQuery({
    queryKey: ['TaxInvoice-list', tenantId, onRefresh],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.TaxInvoice.filter({ tenant_id: tenantId });
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const handleDelete = useCallback(async (id, nfeNumber) => {
    if (!confirm(`Tem certeza que deseja deletar a NFe "${nfeNumber}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await base44.entities.TaxInvoice.delete(id);
      toast.success('NFe deletada com sucesso');
      refetch();
      onSuccess?.();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao deletar NFe. Tente novamente.');
    }
  }, [refetch, onSuccess]);

  if (error && !invoices.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 mb-4">Erro ao carregar notas fiscais</p>
        <Button onClick={() => refetch()} variant="outline">Tentar Novamente</Button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando NFes...</div>;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'issued':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" />Emitida</span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Clock className="w-3 h-3" />Rascunho</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelada</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left py-3 px-4">Número NFe</th>
            <th className="text-left py-3 px-4">Série</th>
            <th className="text-left py-3 px-4">Data</th>
            <th className="text-left py-3 px-4">Valor</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-right py-3 px-4">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Nenhuma NFe cadastrada</p>
                <p className="text-slate-400 text-sm mt-1">Crie uma nova nota fiscal para começar</p>
              </td>
            </tr>
          ) : (
            invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">{inv.nfe_number}</td>
                <td className="py-3 px-4 text-slate-600">{inv.series || '-'}</td>
                <td className="py-3 px-4 text-slate-600">{inv.issue_date ? new Date(inv.issue_date).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="py-3 px-4 font-medium text-slate-900">R$ {(inv.amount || 0).toFixed(2)}</td>
                <td className="py-3 px-4">
                  {getStatusBadge(inv.status)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    {inv.status === 'issued' && (
                      <Button size="icon" variant="ghost" title="Download XML">
                        <Download className="w-4 h-4 text-blue-500" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => onEdit(inv)} title="Editar">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(inv.id, inv.nfe_number)} title="Deletar">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}