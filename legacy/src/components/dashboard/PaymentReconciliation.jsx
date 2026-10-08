/**
 * PaymentReconciliation Component
 * Automatic and manual invoice-payment matching
 */

import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function PaymentReconciliation({ tenantId }) {
  const [reconciliationMode, setReconciliationMode] = useState('automatic'); // automatic | manual
  const [selectedMatches, setSelectedMatches] = useState({});

  // Fetch all invoices and payments
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices-reconciliation', tenantId],
    queryFn: () => base44.entities.Invoice.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-reconciliation', tenantId],
    queryFn: () => base44.entities.Payment.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  // Calculate reconciliation status
  const reconciliationStatus = useMemo(() => {
    const status = {
      reconciled: [],
      unmatched_invoices: [],
      unmatched_payments: [],
      partial: [],
      overmatched: [],
    };

    invoices.forEach(inv => {
      const invPayments = payments.filter(p => p.invoice_id === inv.id && p.status === 'confirmed');
      const totalPaid = invPayments.reduce((sum, p) => sum + p.amount, 0);

      if (totalPaid >= inv.total_amount) {
        if (totalPaid > inv.total_amount) {
          status.overmatched.push({
            type: 'invoice',
            invoice: inv,
            payments: invPayments,
            excess: totalPaid - inv.total_amount,
          });
        } else {
          status.reconciled.push({
            type: 'invoice',
            invoice: inv,
            payments: invPayments,
          });
        }
      } else if (totalPaid > 0) {
        status.partial.push({
          type: 'invoice',
          invoice: inv,
          payments: invPayments,
          paidAmount: totalPaid,
          remainingBalance: inv.total_amount - totalPaid,
        });
      } else {
        status.unmatched_invoices.push({
          type: 'invoice',
          invoice: inv,
        });
      }
    });

    // Find payments without matching invoices
    const matchedPaymentIds = payments
      .filter(p => invoices.some(inv => inv.id === p.invoice_id))
      .map(p => p.id);
    
    payments.forEach(payment => {
      if (!matchedPaymentIds.includes(payment.id)) {
        status.unmatched_payments.push({
          type: 'payment',
          payment,
        });
      }
    });

    return status;
  }, [invoices, payments]);

  const handleAutoReconcile = async () => {
    // Auto-match payments to invoices
    let matched = 0;

    for (const unmatchedPay of reconciliationStatus.unmatched_payments) {
      const payment = unmatchedPay.payment;
      
      // Try to match by amount + date proximity
      const candidates = reconciliationStatus.unmatched_invoices.filter(u => {
        const inv = u.invoice;
        const dateDiff = Math.abs(
          new Date(inv.due_date) - new Date(payment.payment_date)
        );
        return (
          Math.abs(inv.total_amount - payment.amount) < 0.01 && // Exact amount match
          dateDiff < 7 * 24 * 60 * 60 * 1000 // Within 7 days
        );
      });

      if (candidates.length === 1) {
        const candidate = candidates[0];
        await base44.entities.Payment.update(payment.id, {
          invoice_id: candidate.invoice.id,
        });
        matched++;
      }
    }

    alert(`${matched} pagamento(s) reconciliado(s) automaticamente`);
  };

  const handleManualMatch = async (paymentId, invoiceId) => {
    try {
      await base44.entities.Payment.update(paymentId, {
        invoice_id: invoiceId,
      });
      setSelectedMatches(prev => {
        const next = { ...prev };
        delete next[paymentId];
        return next;
      });
      alert('Pagamento associado à fatura com sucesso');
    } catch (error) {
      alert('Erro ao associar pagamento: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-slate-800 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-slate-100">Reconciliação de Pagamentos</h2>
        <div className="flex gap-2">
          <Button
            variant={reconciliationMode === 'automatic' ? 'default' : 'outline'}
            onClick={() => setReconciliationMode('automatic')}
          >
            Automática
          </Button>
          <Button
            variant={reconciliationMode === 'manual' ? 'default' : 'outline'}
            onClick={() => setReconciliationMode('manual')}
          >
            Manual
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-400">Reconciliados</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {reconciliationStatus.reconciled.length}
          </div>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="text-sm text-blue-600 dark:text-blue-400">Parciais</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {reconciliationStatus.partial.length}
          </div>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes (Invoices)</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {reconciliationStatus.unmatched_invoices.length}
          </div>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
          <div className="text-sm text-orange-600 dark:text-orange-400">Pendentes (Payments)</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {reconciliationStatus.unmatched_payments.length}
          </div>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <div className="text-sm text-red-600 dark:text-red-400">Sobrematched</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {reconciliationStatus.overmatched.length}
          </div>
        </div>
      </div>

      {reconciliationMode === 'automatic' ? (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Modo automático: associa pagamentos às faturas com base em valor e data
          </p>
          <Button onClick={handleAutoReconcile} className="w-full">
            Executar Reconciliação Automática
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unmatched Payments */}
          {reconciliationStatus.unmatched_payments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pagamentos Pendentes de Associação
              </h3>
              {reconciliationStatus.unmatched_payments.map(item => (
                <div
                  key={item.payment.id}
                  className="p-4 border border-yellow-200 dark:border-yellow-700 rounded-lg"
                >
                  <div className="flex justify-between mb-3">
                    <div>
                      <div className="font-semibold dark:text-slate-100">
                        {item.payment.payment_number}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {item.payment.amount.toFixed(2)} {item.payment.currency} -{' '}
                        {new Date(item.payment.payment_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Método: {item.payment.payment_method}
                      </div>
                    </div>
                  </div>

                  {/* Select Invoice to Match */}
                  <select
                    value={selectedMatches[item.payment.id] || ''}
                    onChange={e => {
                      if (e.target.value) {
                        setSelectedMatches(prev => ({
                          ...prev,
                          [item.payment.id]: e.target.value,
                        }));
                      }
                    }}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 mb-3"
                  >
                    <option value="">Selecione uma fatura...</option>
                    {reconciliationStatus.unmatched_invoices.map(u => (
                      <option key={u.invoice.id} value={u.invoice.id}>
                        {u.invoice.invoice_number} - {u.invoice.total_amount.toFixed(2)}{' '}
                        {u.invoice.currency}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={() =>
                      handleManualMatch(
                        item.payment.id,
                        selectedMatches[item.payment.id]
                      )
                    }
                    disabled={!selectedMatches[item.payment.id]}
                    className="w-full"
                  >
                    Associar Pagamento
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Reconciled Items */}
          {reconciliationStatus.reconciled.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Reconciliados ({reconciliationStatus.reconciled.length})
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {reconciliationStatus.reconciled
                  .map(item => item.invoice.invoice_number)
                  .join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}