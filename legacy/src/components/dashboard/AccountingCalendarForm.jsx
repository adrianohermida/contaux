import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AccountingCalendarForm({ event, tenantId, onSave, onCancel }) {
  const initialData = useMemo(() => event || {
    tenant_id: tenantId,
    event_title: '',
    event_date: '',
    event_type: 'other',
    priority: 'medium',
    description: '',
    is_recurring: false,
    recurrence_pattern: '',
    recurrence_end_date: '',
    status: 'pending',
    assigned_to: '',
    notes: ''
  }, [event, tenantId]);

  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.event_title || formData.event_title.trim() === '') {
      toast.error('Por favor, preencha o título do evento');
      return false;
    }
    if (!formData.event_date) {
      toast.error('Por favor, selecione a data do evento');
      return false;
    }
    if (formData.is_recurring && !formData.recurrence_pattern) {
      toast.error('Por favor, selecione o padrão de recorrência');
      return false;
    }
    if (formData.is_recurring && formData.recurrence_end_date && 
        new Date(formData.recurrence_end_date) < new Date(formData.event_date)) {
      toast.error('Data de término da recorrência deve ser posterior à data do evento');
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
        tenant_id: tenantId,
        event_title: formData.event_title.trim()
      };

      if (event?.id) {
        await base44.entities.AccountingCalendar.update(event.id, dataToSave);
        toast.success('Evento atualizado com sucesso');
      } else {
        await base44.entities.AccountingCalendar.create(dataToSave);
        toast.success('Evento criado com sucesso');
      }
      onSave?.();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast.error('Erro ao salvar evento. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">{event ? 'Editar Evento' : 'Novo Evento Contábil'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">Título do Evento *</label>
          <Input
            placeholder="ex: Fechamento de período, Declaração de IR"
            name="event_title"
            value={formData.event_title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Data do Evento *</label>
            <Input
              type="date"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Tipo de Evento *</label>
            <Select value={formData.event_type} onValueChange={(val) => setFormData(prev => ({ ...prev, event_type: val }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payroll">Folha de Pagamento</SelectItem>
                <SelectItem value="tax_deadline">Prazo Fiscal</SelectItem>
                <SelectItem value="audit">Auditoria</SelectItem>
                <SelectItem value="reconciliation">Reconciliação</SelectItem>
                <SelectItem value="reporting">Relatório</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Prioridade</label>
          <Select value={formData.priority} onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Status</label>
          <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_recurring"
            checked={formData.is_recurring}
            onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked, recurrence_pattern: '' }))}
          />
          <label htmlFor="is_recurring" className="text-sm font-medium">Evento Recorrente</label>
        </div>

        {formData.is_recurring && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded">
            <div>
              <label className="text-sm font-medium block mb-2">Padrão de Recorrência *</label>
              <Select value={formData.recurrence_pattern} onValueChange={(val) => setFormData(prev => ({ ...prev, recurrence_pattern: val }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                  <SelectItem value="custom">Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Término da Recorrência</label>
              <Input
                type="date"
                name="recurrence_end_date"
                value={formData.recurrence_end_date}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-2">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descrição detalhada do evento"
            className="w-full border rounded-lg p-2 text-sm"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Notas</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Observações adicionais"
            className="w-full border rounded-lg p-2 text-sm"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Salvando...' : event ? 'Atualizar' : 'Criar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}