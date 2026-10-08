import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BankReconciliationForm({ recon, tenantId, onSave, onCancel }) {
  const initialData = useMemo(() => recon || {
    tenant_id: tenantId,
    bank_account_id: '',
    statement_period_start: '',
    statement_period_end: '',
    statement_balance: 0,
    book_balance: 0,
    reconciliation_status: 'in_progress',
    variance_amount: 0,
    outstanding_deposits: [],
    outstanding_checks: [],
    discrepancies: [],
    notes: ''
  }, [recon, tenantId]);

  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const { data: bankAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['BankAccount', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      return base44.entities.BankAccount.filter({ tenant_id: tenantId });
    },
    enabled: !!tenantId
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: name.includes('balance') ? parseFloat(value) || 0 : value };
      if (name === 'statement_balance' || name === 'book_balance') {
        updated.variance_amount = Math.abs((updated.statement_balance || 0) - (updated.book_balance || 0));
      }
      return updated;
    });
  };

  const validateForm = () => {
    if (!formData.bank_account_id) {
      toast.error('Por favor, selecione uma conta bancária');
      return false;
    }
    if (!formData.statement_period_start) {
      toast.error('Por favor, preencha a data de início do período');
      return false;
    }
    if (!formData.statement_period_end) {
      toast.error('Por favor, preencha a data de fim do período');
      return false;
    }
    if (new Date(formData.statement_period_end) < new Date(formData.statement_period_start)) {
      toast.error('Data de fim deve ser posterior à data de início');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        tenant_id: tenantId
      };

      if (recon?.id) {
        await base44.entities.BankReconciliation.update(recon.id, dataToSave);
        toast.success('Reconciliação atualizada com sucesso');
      } else {
        await base44.entities.BankReconciliation.create(dataToSave);
        toast.success('Reconciliação criada com sucesso');
      }
      onSave?.();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast.error('Erro ao salvar reconciliação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">{recon ? 'Editar Reconciliação' : 'Nova Reconciliação Bancária'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">Conta Bancária *</label>
          <Select 
            value={formData.bank_account_id} 
            onValueChange={(val) => setFormData(prev => ({ ...prev, bank_account_id: val }))}
          >
            <SelectTrigger disabled={accountsLoading}>
              <SelectValue placeholder="Selecione uma conta" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.account_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Data de Início do Período *</label>
            <Input
              type="date"
              name="statement_period_start"
              value={formData.statement_period_start}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Data de Fim do Período *</label>
            <Input
              type="date"
              name="statement_period_end"
              value={formData.statement_period_end}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Saldo Extrato Bancário (R$) *</label>
            <Input
              type="number"
              name="statement_balance"
              value={formData.statement_balance}
              onChange={handleChange}
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Saldo Livro Contábil (R$) *</label>
            <Input
              type="number"
              name="book_balance"
              value={formData.book_balance}
              onChange={handleChange}
              step="0.01"
              required
            />
          </div>
        </div>

        {formData.variance_amount !== 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 font-medium">
              Variância detectada: R$ {formData.variance_amount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-2">Status</label>
          <Select value={formData.reconciliation_status} onValueChange={(val) => setFormData(prev => ({ ...prev, reconciliation_status: val }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="discrepancy_found">Discrepância Encontrada</SelectItem>
              <SelectItem value="needs_review">Necessita Revisão</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Notas</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Observações sobre a reconciliação"
            className="w-full border rounded-lg p-2 text-sm"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" disabled={saving || accountsLoading} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Salvando...' : recon ? 'Atualizar' : 'Criar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}