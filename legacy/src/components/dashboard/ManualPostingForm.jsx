import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ManualPostingForm({ tenantId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    document_number: '',
    posting_date: '',
    document_type: 'invoice',
    amount: 0,
    status: 'pending'
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.JournalEntry.create({
        tenant_id: tenantId,
        client_id: 'manual-posting',
        entry_date: formData.posting_date,
        reference_number: formData.document_number,
        description: `Baixa Manual - ${formData.document_type} #${formData.document_number}`,
        line_items: [{
          account_id: 'manual-settlement',
          account_name: 'Baixa Manual',
          debit_amount: parseFloat(formData.amount) || 0
        }],
        is_posted: formData.status === 'posted'
      });
      onSave?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Número do Documento"
          name="document_number"
          value={formData.document_number}
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Data da Baixa"
          name="posting_date"
          type="date"
          value={formData.posting_date}
          onChange={handleChange}
          required
        />
        <Select value={formData.document_type} onValueChange={(val) => setFormData(prev => ({ ...prev, document_type: val }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="invoice">Fatura</SelectItem>
            <SelectItem value="receipt">Recebimento</SelectItem>
            <SelectItem value="payment">Pagamento</SelectItem>
            <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Valor (R$)"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          required
        />
        <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="posted">Lançado</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}