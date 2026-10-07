import React, { useState, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ServicesForm({ service, tenantId, onSave, onCancel }) {
  const initialFormData = useMemo(() => service || {
    service_name: '',
    description: '',
    hourly_rate: 0,
    category: 'consulting',
    status: 'active'
  }, [service]);

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validar fields obrigatórios
    if (!formData.service_name || formData.service_name.trim() === '') {
      alert('Por favor, preencha o nome do serviço');
      return;
    }

    if (!formData.hourly_rate || formData.hourly_rate <= 0) {
      alert('Por favor, insira uma taxa horária maior que zero');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        service_name: formData.service_name.trim(),
        hourly_rate: parseFloat(formData.hourly_rate),
        tenant_id: tenantId
      };

      if (service?.id) {
        await base44.entities.Service.update(service.id, dataToSave);
      } else {
        await base44.entities.Service.create(dataToSave);
      }
      onSave();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar serviço. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [service, formData, tenantId, onSave]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-100 dark:border-slate-700 p-6 mb-6 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="Formulário de serviço">
        <Input
          placeholder="Nome do serviço"
          name="service_name"
          value={formData.service_name}
          onChange={handleChange}
          required
          aria-label="Nome do serviço"
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
        />
        <Input
          placeholder="Descrição"
          name="description"
          value={formData.description}
          onChange={handleChange}
          aria-label="Descrição do serviço"
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
        />
        <Input
          placeholder="Taxa horária (R$)"
          name="hourly_rate"
          type="number"
          value={formData.hourly_rate}
          onChange={handleChange}
          step="0.01"
          required
          aria-label="Taxa horária em reais"
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
        />
        <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
          <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" aria-label="Categoria do serviço"><SelectValue /></SelectTrigger>
          <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="accounting">Contabilidade</SelectItem>
            <SelectItem value="tax">Fiscal</SelectItem>
            <SelectItem value="consulting">Consultoria</SelectItem>
            <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
          <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" aria-label="Status do serviço"><SelectValue /></SelectTrigger>
          <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600" aria-label="Salvar serviço">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700" aria-label="Cancelar formulário">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}