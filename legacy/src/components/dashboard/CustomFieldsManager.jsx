import React, { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Seleção' },
  { value: 'multiselect', label: 'Múltipla Seleção' },
  { value: 'boolean', label: 'Sim/Não' },
];

export default function CustomFieldsManager({ workspaceId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text',
    options: [],
    is_required: false,
    is_active: true,
  });
  const [optionsInput, setOptionsInput] = useState('');
  const queryClient = useQueryClient();

  const { data: customFields = [], isLoading } = useQuery({
    queryKey: ['custom-fields', workspaceId],
    queryFn: () => base44.entities.CustomField.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
  });

  const createFieldMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomField.create({
      ...data,
      workspace_id: workspaceId,
      entity_type: 'contact',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
      handleCloseDialog();
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CustomField.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
      handleCloseDialog();
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomField.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.CustomField.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingField(null);
    setFormData({
      field_name: '',
      field_label: '',
      field_type: 'text',
      options: [],
      is_required: false,
      is_active: true,
    });
    setOptionsInput('');
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      options: field.options || [],
      is_required: field.is_required,
      is_active: field.is_active,
    });
    setOptionsInput((field.options || []).join('\n'));
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const options = ['select', 'multiselect'].includes(formData.field_type)
      ? optionsInput.split('\n').filter(o => o.trim())
      : [];

    const data = {
      ...formData,
      options: options.length > 0 ? options : undefined,
    };

    if (editingField) {
      updateFieldMutation.mutate({ id: editingField.id, data });
    } else {
      createFieldMutation.mutate(data);
    }
  };

  const handleDelete = (field) => {
    if (window.confirm(`Deletar o campo "${field.field_label}"? Isso removerá todos os valores associados.`)) {
      deleteFieldMutation.mutate(field.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Campos Personalizados
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Adicione campos customizados aos seus contatos
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Campo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-slate-500 py-8">Carregando...</p>
      ) : customFields.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
              Nenhum campo personalizado criado
            </p>
            <Button onClick={() => setShowDialog(true)} variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Criar primeiro campo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {customFields.map((field) => (
            <Card key={field.id} className={!field.is_active ? 'opacity-50' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {field.field_label}
                      </span>
                      {field.is_required && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Obrigatório
                        </span>
                      )}
                      {!field.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {field.field_name}
                      </span>
                      <span>•</span>
                      <span>{FIELD_TYPES.find(t => t.value === field.field_type)?.label}</span>
                    </div>
                    {field.options && field.options.length > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Opções: {field.options.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => toggleActiveMutation.mutate({ id: field.id, is_active: !field.is_active })}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title={field.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {field.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={() => handleEdit(field)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(field)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(o) => !o && handleCloseDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Editar Campo' : 'Novo Campo Personalizado'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Campo (interno)</label>
              <Input
                placeholder="ex: segmento_mercado"
                value={formData.field_name}
                onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">Use snake_case, sem espaços</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Label de Exibição</label>
              <Input
                placeholder="ex: Segmento de Mercado"
                value={formData.field_label}
                onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Campo</label>
              <select
                value={formData.field_type}
                onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-800"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {['select', 'multiselect'].includes(formData.field_type) && (
              <div>
                <label className="block text-sm font-medium mb-2">Opções (uma por linha)</label>
                <textarea
                  value={optionsInput}
                  onChange={(e) => setOptionsInput(e.target.value)}
                  placeholder="Varejo&#10;Atacado&#10;Serviços"
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 min-h-[100px]"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_required"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="is_required" className="text-sm">
                Campo obrigatório
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCloseDialog} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.field_name || !formData.field_label || createFieldMutation.isPending || updateFieldMutation.isPending}
            >
              {editingField ? 'Atualizar' : 'Criar'} Campo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}