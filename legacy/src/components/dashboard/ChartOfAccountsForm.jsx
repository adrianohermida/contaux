import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export default function ChartOfAccountsForm({ account, onSave, onCancel, tenantId }) {
  const [formData, setFormData] = useState(account || {
    tenant_id: tenantId,
    client_id: '',
    account_number: '',
    account_name: '',
    account_type: 'Asset',
    description: '',
    balance: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'balance' ? parseFloat(value) || 0 : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.account_number || formData.account_number.trim() === '') {
      toast.error('Por favor, preencha o número da conta');
      return false;
    }
    if (!formData.account_name || formData.account_name.trim() === '') {
      toast.error('Por favor, preencha o nome da conta');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        tenant_id: tenantId,
        account_number: formData.account_number.trim(),
        account_name: formData.account_name.trim()
      };

      if (account?.id) {
        await base44.entities.Account.update(account.id, dataToSave);
        toast.success('Conta atualizada com sucesso');
      } else {
        await base44.entities.Account.create(dataToSave);
        toast.success('Conta criada com sucesso');
      }
      onSave();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast.error('Erro ao salvar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{account ? 'Editar Conta' : 'Nova Conta'}</h2>
          <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Nº da Conta" 
              name="account_number" 
              value={formData.account_number} 
              onChange={handleChange} 
              placeholder="ex: 1000, 2000"
              required 
            />
            <Input 
              label="Nome da Conta" 
              name="account_name" 
              value={formData.account_name} 
              onChange={handleChange} 
              placeholder="ex: Caixa, Banco do Brasil"
              required 
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Tipo de Conta *</label>
            <Select value={formData.account_type} onValueChange={(v) => handleSelectChange('account_type', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asset">Ativo</SelectItem>
                <SelectItem value="Liability">Passivo</SelectItem>
                <SelectItem value="Equity">Patrimônio</SelectItem>
                <SelectItem value="Revenue">Receita</SelectItem>
                <SelectItem value="Expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Descrição</label>
            <textarea 
              className="w-full border rounded-lg p-2 text-sm" 
              placeholder="Descrição da conta" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 pt-2 pb-4">
            <input 
              type="checkbox" 
              id="is_active"
              checked={formData.is_active} 
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} 
            />
            <label htmlFor="is_active" className="text-sm">Conta Ativa</label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Salvando...' : account ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}