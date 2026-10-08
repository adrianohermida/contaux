import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

export default function CashFlow() {
  const { workspaceId, loading: authLoading } = useGlobalAuth('internal');

  const { data: payments = [], isLoading, refetch, error } = useQuery({
    queryKey: ['Payment-list', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.Payment.filter({ tenant_id: workspaceId }, '-payment_date', 100);
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  const { inflow, outflow } = useMemo(() => ({
    inflow: payments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0),
    outflow: payments.filter(p => p.payment_method === 'check').reduce((sum, p) => sum + p.amount, 0)
  }), [payments]);

  const sortedPayments = useMemo(() => 
    payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)).slice(0, 10),
    [payments]
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[var(--color-interactive-default)] border-t-transparent rounded-full animate-spin mx-auto mb-[var(--spacing-md)]" />
          <p className="text-[var(--color-foreground-secondary)]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !payments.length) {
    return (
      <div className="space-y-[var(--spacing-lg)]">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Fluxo de Caixa</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-[var(--spacing-2xl)] text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-[var(--spacing-md)]" />
          <p className="text-red-600 mb-[var(--spacing-md)]">Erro ao carregar fluxo de caixa</p>
          <Button onClick={() => refetch()} className="gap-[var(--spacing-sm)]">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
        </div>
        );
        }

  const statusLabel = { confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado' };
  const methodLabel = { pix: 'PIX', bank_transfer: 'Transferência', credit_card: 'Cartão de Crédito', debit_card: 'Cartão de Débito', check: 'Cheque', cash: 'Dinheiro' };

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Fluxo de Caixa</h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Entradas e saídas de caixa</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-[var(--spacing-sm)]" disabled={isLoading} aria-label="Atualizar fluxo de caixa">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-md)] sm:gap-[var(--spacing-lg)]">
        <div className="bg-green-50 rounded-xl shadow p-[var(--spacing-lg)] border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--color-foreground-secondary)] text-sm mb-[var(--spacing-xs)]">Entradas Confirmadas</p>
              <p className="text-[var(--font-size-2xl)] sm:text-[var(--font-size-3xl)] font-bold text-green-600">{inflow.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl shadow p-[var(--spacing-lg)] border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--color-foreground-secondary)] text-sm mb-[var(--spacing-xs)]">Saídas Registradas</p>
              <p className="text-[var(--font-size-2xl)] sm:text-[var(--font-size-3xl)] font-bold text-amber-600">{outflow.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
            </div>
            <TrendingDown className="w-10 h-10 text-amber-500" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-background-primary)] rounded-xl shadow p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] border border-[var(--color-border-default)]">
        <h2 className="text-lg font-semibold mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Movimentações Recentes</h2>
        {payments.length === 0 ? (
          <p className="text-center text-[var(--color-foreground-secondary)] py-8">Nenhuma movimentação registrada</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[480px]" role="table" aria-label="Movimentações recentes de caixa">
              <thead className="border-b border-[var(--color-border-default)]">
                <tr>
                  <th className="text-left py-2 px-4 sm:px-0 font-semibold text-[var(--color-foreground-primary)]">Data</th>
                  <th className="text-left py-2 px-2 font-semibold text-[var(--color-foreground-primary)]">Número</th>
                  <th className="text-left py-2 px-2 font-semibold text-[var(--color-foreground-primary)]">Método</th>
                  <th className="text-left py-2 px-2 font-semibold text-[var(--color-foreground-primary)]">Valor</th>
                  <th className="text-left py-2 px-2 font-semibold text-[var(--color-foreground-primary)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.map(p => (
                  <tr key={p.id} className="border-b border-[var(--color-border-default)] hover:bg-[var(--color-background-secondary)] transition-colors">
                    <td className="py-3 px-4 sm:px-0 text-[var(--color-foreground-secondary)]">{new Date(p.payment_date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-2 text-[var(--color-foreground-primary)]">{p.payment_number}</td>
                    <td className="py-3 px-2 text-[var(--color-foreground-secondary)]">{methodLabel[p.payment_method] || p.payment_method}</td>
                    <td className="py-3 px-2 font-medium text-[var(--color-foreground-primary)]">{p.amount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                        p.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {statusLabel[p.status] || p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}