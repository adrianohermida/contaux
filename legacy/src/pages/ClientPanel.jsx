import React, { useEffect, useState } from 'react';
import ProtectedClientRoute from '../components/auth/ProtectedClientRoute';
import { base44 } from '@/api/base44Client';
import { useMultitenantAuth } from '../components/auth/useMultitenantAuth';
import { FileText, CreditCard, Eye, Download } from 'lucide-react';

export default function ClientPanel() {
  const { user, loading, workspaceId } = useMultitenantAuth('client');
  const [invoices, setInvoices] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (user && workspaceId) {
      loadInvoices();
    }
  }, [user, workspaceId]);

  const loadInvoices = async () => {
    try {
      setDataLoading(true);
      // Buscar apenas faturas do cliente logado
      const clientInvoices = await base44.entities.Invoice.filter({
        workspace_id: workspaceId,
        client_id: user.id
      });
      setInvoices(clientInvoices);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-interactive-default)]"></div>
      </div>
    );
  }

  return (
    <ProtectedClientRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-[var(--spacing-lg)]">
         <div className="max-w-7xl mx-auto">
           {/* Header */}
           <div className="mb-[var(--spacing-xl)]">
             <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Meu Painel</h1>
             <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-sm)]">
              Bem-vindo, {user?.full_name || 'Cliente'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-md)] mb-[var(--spacing-xl)]">
            <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)] font-medium">Total de Faturas</p>
                  <p className="text-[var(--font-size-4xl)] font-bold text-[var(--color-foreground-primary)] mt-[var(--spacing-sm)]">{invoices.length}</p>
                </div>
                <FileText className="w-10 h-10 text-[var(--color-interactive-default)] opacity-10" />
              </div>
            </div>

            <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)] font-medium">Pendentes</p>
                  <p className="text-[var(--font-size-4xl)] font-bold text-[var(--color-foreground-primary)] mt-[var(--spacing-sm)]">
                    {invoices.filter(i => i.status !== 'paid').length}
                  </p>
                </div>
                <CreditCard className="w-10 h-10 text-amber-600 opacity-10" />
              </div>
            </div>

            <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)] font-medium">Pagas</p>
                  <p className="text-[var(--font-size-4xl)] font-bold text-[var(--color-foreground-primary)] mt-[var(--spacing-sm)]">
                    {invoices.filter(i => i.status === 'paid').length}
                  </p>
                </div>
                <Eye className="w-10 h-10 text-green-600 opacity-10" />
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-[var(--color-background-primary)] rounded-lg shadow overflow-hidden">
            <div className="p-[var(--spacing-lg)] border-b border-[var(--color-border-default)]">
              <h2 className="text-[var(--font-size-xl)] font-bold text-[var(--color-foreground-primary)]">Minhas Faturas</h2>
            </div>

            {dataLoading ? (
              <div className="p-[var(--spacing-lg)] text-center text-[var(--color-foreground-secondary)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-interactive-default)] mx-auto"></div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-[var(--spacing-lg)] text-center text-[var(--color-foreground-secondary)]">
                Nenhuma fatura encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-background-secondary)] border-b border-[var(--color-border-default)]">
                    <tr>
                      <th className="px-[var(--spacing-lg)] py-[var(--spacing-sm)] text-left text-[var(--font-size-xs)] font-medium text-[var(--color-foreground-secondary)] uppercase">
                        Fatura
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-default)]">
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-[var(--color-background-secondary)]">
                        <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">
                          {new Date(invoice.issue_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)]">
                          R$ {invoice.total_amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-sm)]">
                          <span className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] rounded-full text-[var(--font-size-xs)] font-medium ${
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {invoice.status === 'paid' ? 'Paga' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-sm)]">
                          <button className="text-[var(--color-interactive-default)] hover:text-[var(--color-interactive-hover)] flex items-center gap-[var(--spacing-sm)]">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedClientRoute>
  );
}