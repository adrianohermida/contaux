import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AutomationsForm({ workflow, tenantId, onSave, onCancel }) {
  const initialData = useMemo(() => workflow || {
    workspace_id: tenantId,
    name: '',
    description: '',
    status: 'inactive',
    trigger_type: 'custom',
    trigger_config: {},
    nodes: [],
    execution_count: 0,
    success_count: 0,
    error_count: 0
  }, [workflow, tenantId]);

  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Por favor, preencha o nome da automação');
      return false;
    }
    if (!formData.trigger_type) {
      toast.error('Por favor, selecione o tipo de gatilho');
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
        workspace_id: tenantId,
        name: formData.name.trim()
      };

      if (workflow?.id) {
        await base44.entities.Workflow.update(workflow.id, dataToSave);
        toast.success('Automação atualizada com sucesso');
      } else {
        await base44.entities.Workflow.create(dataToSave);
        toast.success('Automação criada com sucesso');
      }
      onSave?.();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast.error('Erro ao salvar automação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">{workflow ? 'Editar Automação' : 'Nova Automação'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">Nome da Automação *</label>
          <Input
            placeholder="ex: Enviar notificação para clientes"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Tipo de Gatilho *</label>
          <Select value={formData.trigger_type} onValueChange={(val) => setFormData(prev => ({ ...prev, trigger_type: val }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer_added">Cliente Adicionado</SelectItem>
              <SelectItem value="health_changed">Status Alterado</SelectItem>
              <SelectItem value="milestone">Marco Atingido</SelectItem>
              <SelectItem value="custom">Customizado</SelectItem>
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
              <SelectItem value="active">Ativa</SelectItem>
              <SelectItem value="inactive">Inativa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descrição da automação"
            className="w-full border rounded-lg p-2 text-sm"
            rows={3}
          />
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <p className="font-medium mb-1">Configuração de Gatilho:</p>
          <p>Use JSON para configurar o comportamento. Exemplo: {`{"field": "status", "value": "active"}`}</p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Salvando...' : workflow ? 'Atualizar' : 'Criar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}