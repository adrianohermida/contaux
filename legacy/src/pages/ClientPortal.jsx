import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMultitenantAuthOptimized } from '../components/auth/useMultitenantAuthOptimized';
import { Button } from '@/components/ui/button';
import { FileText, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

export default function ClientPortal() {
  const { workspaceId, loading: authLoading } = useMultitenantAuthOptimized('client');
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: invoices = [], isLoading, refetch, error } = useQuery({
    queryKey: ['Invoice-client-portal', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.Invoice.filter({ tenant_id: workspaceId }, '-issue_date', 100);
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  const stats = useMemo(() => ({
    pending: invoices.filter(i => i.status !== 'paid').length,
    totalDue: invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0),
    paid: invoices.filter(i => i.status === 'paid').length
  }), [invoices]);

  if (authLoading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meu Painel</h1>
          <p className="text-slate-600 mt-1">Bem-vindo, {user?.full_name || 'Cliente'}</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Faturas Pendentes</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <FileText className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Valor Devido</p>
              <p className="text-2xl font-bold">{stats.totalDue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
            </div>
            <DollarSign className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Faturas Pagas</p>
              <p className="text-2xl font-bold">{stats.paid}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Faturas Recentes</h2>
        {isLoading ? (
          <p className="text-center text-slate-500 py-8">Carregando...</p>
        ) : invoices.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Nenhuma fatura disponível</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Número</th>
                  <th className="text-left py-2">Data</th>
                  <th className="text-left py-2">Valor</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b hover:bg-slate-50">
                    <td className="py-2">{inv.invoice_number}</td>
                    <td className="py-2">{new Date(inv.issue_date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2 font-medium">{inv.total_amount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {inv.status === 'paid' ? 'Paga' : 'Pendente'}
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