import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BankReconciliationPanel({ clientId, tenantId }) {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    account_name: '',
    account_number: '',
    bank_code: '',
    opening_balance: '',
    current_balance: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    transaction_type: 'debit',
    status: 'pending',
    linked_invoice_id: ''
  });

  const TRANSACTION_TYPES = [
    { value: 'debit', label: '📤 Débito' },
    { value: 'credit', label: '📥 Crédito' },
    { value: 'transfer', label: '↔ Transferência' },
    { value: 'fee', label: '💳 Taxa' },
    { value: 'interest', label: '📈 Juros' }
  ];

  useEffect(() => {
    loadData();
  }, [clientId, tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accData, transData] = await Promise.all([
        base44.entities.BankAccount?.filter({ 
          tenant_id: tenantId, 
          client_id: clientId 
        }) || [],
        base44.entities.Transaction?.filter({ 
          tenant_id: tenantId, 
          bank_account_id: selectedAccount?.id 
        }) || []
      ]);
      setBankAccounts(accData || []);
      setTransactions(transData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar contas bancárias');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!formData.account_name || !formData.account_number) {
      toast.error('Nome e número da conta obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        opening_balance: parseFloat(formData.opening_balance || 0),
        current_balance: parseFloat(formData.current_balance || 0),
        tenant_id: tenantId,
        client_id: clientId
      };

      if (editingId) {
        await base44.entities.BankAccount?.update(editingId, data);
        toast.success('Conta atualizada!');
      } else {
        await base44.entities.BankAccount?.create(data);
        toast.success('Conta criada!');
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      toast.error('Erro ao salvar conta bancária');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!selectedAccount) {
      toast.error('Selecione uma conta bancária');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        tenant_id: tenantId,
        bank_account_id: selectedAccount.id,
        transaction_date: transactionForm.transaction_date
      };

      await base44.entities.Transaction?.create(data);
      toast.success('Transação registrada!');
      setTransactionForm({
        transaction_date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        transaction_type: 'debit',
        status: 'pending',
        linked_invoice_id: ''
      });
      await loadData();
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      toast.error('Erro ao registrar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm('Confirmar exclusão?')) return;
    try {
      await base44.entities.BankAccount?.delete(id);
      toast.success('Conta removida');
      if (selectedAccount?.id === id) setSelectedAccount(null);
      await loadData();
    } catch (error) {
      toast.error('Erro ao deletar conta');
    }
  };

  const calculateBalance = (account) => {
    let balance = account.opening_balance || 0;
    const accountTransactions = transactions.filter(t => t.bank_account_id === account.id);
    
    accountTransactions.forEach(t => {
      if (t.status === 'completed') {
        if (t.transaction_type === 'credit') {
          balance += t.amount;
        } else {
          balance -= t.amount;
        }
      }
    });

    return balance;
  };

  const resetForm = () => {
    setFormData({
      account_name: '',
      account_number: '',
      bank_code: '',
      opening_balance: '',
      current_balance: ''
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Account Form */}
      <form onSubmit={handleAddAccount} className="bg-slate-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar Conta Bancária
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Conta *</label>
            <input
              type="text"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              placeholder="Principal, Poupança, etc"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Número da Conta *</label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              placeholder="12345-6"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Código do Banco</label>
            <input
              type="text"
              value={formData.bank_code}
              onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
              placeholder="001, 033, 104"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Saldo Inicial (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.opening_balance}
              onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Saldo Atual (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.current_balance}
              onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {editingId ? 'Atualizar' : 'Adicionar'} Conta
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* Bank Accounts List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Contas Bancárias</h3>
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhuma conta bancária cadastrada
          </div>
        ) : (
          bankAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAccount?.id === account.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{account.account_name}</p>
                  <p className="text-sm text-slate-600">
                    {account.account_number} - Banco {account.bank_code}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Saldo: R$ {calculateBalance(account).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({
                        account_name: account.account_name,
                        account_number: account.account_number,
                        bank_code: account.bank_code || '',
                        opening_balance: account.opening_balance?.toString() || '',
                        current_balance: account.current_balance?.toString() || ''
                      });
                      setEditingId(account.id);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAccount(account.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Add Transaction Form */}
      {selectedAccount && (
        <form onSubmit={handleAddTransaction} className="bg-slate-50 p-4 rounded-lg space-y-4 border-l-4 border-blue-500">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Registrar Transação - {selectedAccount.account_name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                value={transactionForm.transaction_date}
                onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                placeholder="0,00"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={transactionForm.transaction_type}
                onChange={(e) => setTransactionForm({ ...transactionForm, transaction_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {TRANSACTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <input
              type="text"
              value={transactionForm.description}
              onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
              placeholder="Descrição da transação"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={transactionForm.status}
                onChange={(e) => setTransactionForm({ ...transactionForm, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="pending">⏳ Pendente</option>
                <option value="completed">✓ Concluída</option>
                <option value="failed">✗ Falhou</option>
                <option value="reconciled">✓ Reconciliada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fatura (ID)</label>
              <input
                type="text"
                value={transactionForm.linked_invoice_id}
                onChange={(e) => setTransactionForm({ ...transactionForm, linked_invoice_id: e.target.value })}
                placeholder="ID da fatura"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Registrar Transação
          </Button>
        </form>
      )}

      {/* Transactions List */}
      {selectedAccount && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Transações de {selectedAccount.account_name}</h3>
          {transactions.filter(t => t.bank_account_id === selectedAccount.id).length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <DollarSign className="w-6 h-6 mx-auto mb-2 opacity-50" />
              Nenhuma transação registrada
            </div>
          ) : (
            transactions.filter(t => t.bank_account_id === selectedAccount.id).map((tx) => (
              <div key={tx.id} className="p-4 rounded-lg border bg-white hover:shadow-sm transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">{tx.description}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(tx.transaction_date).toLocaleDateString('pt-BR')} • {TRANSACTION_TYPES.find(t => t.value === tx.transaction_type)?.label}
                    </p>
                    {tx.linked_invoice_id && (
                      <p className="text-xs text-slate-500 mt-1">Fatura: {tx.linked_invoice_id}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-lg font-semibold ${tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.transaction_type === 'credit' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {tx.status === 'completed' && '✓ Concluída'}
                      {tx.status === 'pending' && '⏳ Pendente'}
                      {tx.status === 'failed' && '✗ Falhou'}
                      {tx.status === 'reconciled' && '✓ Reconciliada'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}