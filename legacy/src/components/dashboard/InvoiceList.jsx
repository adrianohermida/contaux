import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { base44 } from '@/api/base44Client';
import { useSortAndFilter } from '../hooks/useSortAndFilter';
import { getCacheConfig } from '../hooks/useQueryCacheConfig';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Download } from 'lucide-react';
import { useCacheStrategy } from '../hooks/useCacheStrategy';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

export default function InvoiceList({ tenantId, onEdit, onRefresh }) {
  const { invalidateRelated } = useCacheStrategy();
  const { isConnected } = useRealtimeSync('Invoice', tenantId);
  const parentRef = useRef(null);

  const { data: invoices = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['Invoice-list', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.Invoice.filter({ 
        tenant_id: tenantId 
      });
    },
    enabled: !!tenantId,
    ...getCacheConfig('critical')
  });

  // Virtualização
  const virtualizer = useVirtualizer({
    count: invoices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    overscan: 5,
  });

  useEffect(() => {
    if (onRefresh) refetch();
  }, [onRefresh, refetch]);

  const handleDelete = useCallback(async (id) => {
    if (confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
      try {
        await base44.entities.Invoice.delete(id);
        invalidateRelated('Invoice', id);
        refetch();
      } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar fatura. Tente novamente.');
      }
    }
  }, [invalidateRelated, refetch]);

  const handleDownloadPDF = useCallback(async (invoiceId, invoiceNumber) => {
    try {
      const response = await base44.functions.invoke('generateInvoicePDF', {
        invoiceId,
        tenantId
      });
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  }, [tenantId]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      draft: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
      sent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      paid: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      overdue: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      viewed: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      cancelled: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
    };
    return colors[status] || 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">Erro ao carregar faturas</p>
        <button onClick={() => refetch()} className="text-red-500 hover:text-red-700 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Nº Fatura</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Data</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Valor</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Status</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">Ações</th>
          </tr>
        </thead>
        <tbody 
          ref={parentRef}
          className="relative"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const invoice = invoices[virtualRow.index];
            return (
              <tr 
                key={invoice.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700 border-b dark:border-slate-700 absolute top-0 left-0 w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{invoice.invoice_number}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(invoice.issue_date).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{invoice.total_amount.toLocaleString('pt-BR', {style: 'currency', currency: invoice.currency})}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                      title="Baixar PDF"
                      aria-label="Baixar fatura em PDF"
                    >
                      <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(invoice)}
                      title="Editar"
                      aria-label="Editar fatura"
                    >
                      <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(invoice.id)}
                      title="Deletar"
                      aria-label="Deletar fatura"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {invoices.length === 0 && <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhuma fatura cadastrada</div>}
    </div>
  );
}