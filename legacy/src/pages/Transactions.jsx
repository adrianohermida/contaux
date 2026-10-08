import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMultitenantAuthOptimized } from '../components/auth/useMultitenantAuthOptimized';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpRight, ArrowDownLeft, Plus, Download, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Transactions() {
  const { workspaceId, loading: authLoading } = useMultitenantAuthOptimized('internal');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: bankAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['BankAccount-list', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.BankAccount.filter({ tenant_id: workspaceId });
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  const { data: transactions = [], isLoading: transactionsLoading, refetch, error } = useQuery({
    queryKey: ['Transaction-list', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.Transaction.filter(
        { tenant_id: workspaceId },
        '-transaction_date',
        200
      );
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const loading = authLoading || accountsLoading || transactionsLoading;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesAccount = selectedAccount === 'all' || txn.bank_account_id === selectedAccount;
      const matchesType = filterType === 'all' || txn.transaction_type === filterType;
      const matchesSearch = !searchTerm || txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           txn.counterparty?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesAccount && matchesType && matchesSearch;
    });
  }, [transactions, selectedAccount, filterType, searchTerm]);

  const stats = useMemo(() => ({
    totalInflows: filteredTransactions
      .filter(t => t.transaction_type === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalOutflows: filteredTransactions
      .filter(t => t.transaction_type === 'debit').reduce((sum, t) => sum + (t.amount || 0), 0),
    pending: filteredTransactions.filter(t => t.status === 'pending').length,
    reconciled: filteredTransactions.filter(t => t.status === 'reconciled').length
  }), [filteredTransactions]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[var(--color-foreground-secondary)]">Carregando...</div>
      </div>
    );
  }

  if (error && !transactions.length) {
    return (
      <div className="space-y-[var(--spacing-lg)]">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Transações Bancárias</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-[var(--spacing-2xl)] text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-[var(--spacing-md)]" />
          <p className="text-red-600 mb-[var(--spacing-md)]">Erro ao carregar transações</p>
          <Button onClick={() => refetch()} className="gap-[var(--spacing-sm)]">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-[var(--spacing-lg)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Transações Bancárias</h1>
            <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Histórico de movimentações e reconciliação</p>
          </div>
          <div className="flex gap-[var(--spacing-sm)]">
            <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-[var(--spacing-sm)]">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)] gap-[var(--spacing-sm)]">
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </div>
        </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--spacing-md)]">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Entradas</p>
                    <p className="text-2xl font-bold text-green-600">R$ {stats.totalInflows.toFixed(2)}</p>
                  </div>
                  <ArrowUpRight className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Saídas</p>
                    <p className="text-2xl font-bold text-red-600">R$ {stats.totalOutflows.toFixed(2)}</p>
                  </div>
                  <ArrowDownLeft className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-slate-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-slate-600">Reconciliadas</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.reconciled}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-[var(--spacing-md)] flex-wrap">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar por descrição ou beneficiário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Conta Bancária" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {bankAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.bank_name} ({acc.account_type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="debit">Débito</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transações */}
          <Card>
            <CardContent className="pt-[var(--spacing-lg)]">
              {loading ? (
                <div className="text-center py-[var(--spacing-lg)] text-[var(--color-foreground-secondary)]">Carregando transações...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-[var(--spacing-md)]" />
                  <p className="text-[var(--color-foreground-secondary)] font-medium">Nenhuma transação encontrada</p>
                  <p className="text-[var(--color-foreground-secondary)] text-sm mt-[var(--spacing-xs)]">Tente ajustar seus filtros de busca</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-[var(--color-border-default)]">
                      <tr>
                        <th className="text-left p-[var(--spacing-md)]">Data</th>
                        <th className="text-left p-[var(--spacing-md)]">Descrição</th>
                        <th className="text-left p-[var(--spacing-md)]">Beneficiário</th>
                        <th className="text-left p-[var(--spacing-md)]">Tipo</th>
                        <th className="text-right p-[var(--spacing-md)]">Valor</th>
                        <th className="text-left p-[var(--spacing-md)]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-[var(--color-border-default)] hover:bg-[var(--color-background-secondary)]">
                          <td className="p-[var(--spacing-md)] text-xs text-[var(--color-foreground-secondary)]">
                            {format(new Date(txn.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </td>
                          <td className="p-[var(--spacing-md)] font-medium">{txn.description}</td>
                          <td className="p-[var(--spacing-md)] text-[var(--color-foreground-secondary)]">{txn.counterparty}</td>
                          <td className="p-[var(--spacing-md)]">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              txn.transaction_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.transaction_type === 'credit' ? 'Crédito' : 'Débito'}
                            </span>
                          </td>
                          <td className="p-[var(--spacing-md)] text-right font-medium">
                            R$ {txn.amount.toFixed(2)}
                          </td>
                          <td className="p-[var(--spacing-md)]">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              txn.status === 'reconciled' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {txn.status === 'reconciled' ? 'Reconciliada' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    </table>
                    </div>
                    )}
                    </CardContent>
                    </Card>
                    </div>
                    );
                    }