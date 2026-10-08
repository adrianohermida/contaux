/**
 * PaymentList Component
 * Virtualized payment history with filtering and actions
 */

import React, { useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useSortAndFilter } from '../hooks/useSortAndFilter';
import { getCacheConfig } from '../hooks/useQueryCacheConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useVirtualizer } from '@tanstack/react-virtual';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  refunded: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  disputed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
};

export default function PaymentList({ tenantId, onEdit, onRefresh = 0 }) {
  // Fetch payments (critical data)
  const { data: paymentsRaw = [], isLoading, error, refetch } = useQuery({
    queryKey: ['payments', tenantId, onRefresh],
    queryFn: () => base44.entities.Payment.filter({ workspace_id: tenantId }),
    enabled: !!tenantId,
    ...getCacheConfig('critical')
  });

  // Use unified sort/filter hook
  const { data: payments } = useSortAndFilter(paymentsRaw, 'payment_date', 'desc');

  // Fetch invoices for display (long cache - reference data)
  const { data: invoices = {} } = useQuery({
    queryKey: ['invoices-for-payments', tenantId],
    queryFn: async () => {
      const invs = await base44.entities.Invoice.filter({ workspace_id: tenantId });
      return Object.fromEntries(invs.map(inv => [inv.id, inv]));
    },
    enabled: !!tenantId,
    ...getCacheConfig('long')
  });

  const handleDelete = useCallback(
    async (id) => {
      if (confirm('Tem certeza que deseja deletar este pagamento?')) {
        try {
          await base44.entities.Payment.delete(id);
          refetch();
        } catch (error) {
          alert('Erro ao deletar: ' + error.message);
        }
      }
    },
    [refetch]
  );

  const handleDownloadReceipt = useCallback(async (paymentId, invoiceNumber) => {
    try {
      const response = await base44.functions.invoke('generatePaymentReceipt', {
        paymentId,
        tenantId,
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprovante-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erro ao gerar recibo: ' + error.message);
    }
  }, [tenantId]);

  // Virtualization setup
  const parentRef = React.useRef(null);
  const virtualizer = useVirtualizer({
    count: payments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Carregando pagamentos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Erro ao carregar pagamentos</div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Nenhum pagamento registrado</div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-96 overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg"
    >
      <table className="w-full text-sm bg-white dark:bg-slate-800">
        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700">
          <tr className="border-b border-slate-200 dark:border-slate-600">
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
              Referência
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
              Fatura
            </th>
            <th className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
              Valor
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
              Data
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
              Método
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
              Status
            </th>
            <th className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
              Ações
            </th>
          </tr>
        </thead>
        <tbody
          style={{
            height: `${totalSize}px`,
          }}
          className="relative"
        >
          {virtualItems.map(virtualItem => {
            const payment = payments[virtualItem.index];
            const invoice = invoices[payment.invoice_id];

            return (
              <tr
                key={payment.id}
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="absolute w-full border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <td className="px-6 py-3 text-slate-900 dark:text-slate-100">
                  {payment.payment_number}
                </td>
                <td className="px-6 py-3 text-slate-900 dark:text-slate-100">
                  {invoice?.invoice_number || 'N/A'}
                </td>
                <td className="px-6 py-3 text-right text-slate-900 dark:text-slate-100 font-semibold">
                  {payment.amount.toFixed(2)} {payment.currency}
                </td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                  {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400 text-xs">
                  {payment.payment_method}
                </td>
                <td className="px-6 py-3">
                  <Badge className={STATUS_COLORS[payment.status]}>
                    {payment.status}
                  </Badge>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadReceipt(payment.id, invoice?.invoice_number)}
                      title="Baixar Recibo"
                      aria-label="Baixar recibo em PDF"
                    >
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(payment)}
                      title="Editar"
                      aria-label="Editar pagamento"
                    >
                      <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(payment.id)}
                      title="Deletar"
                      aria-label="Deletar pagamento"
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
    </div>
  );
}