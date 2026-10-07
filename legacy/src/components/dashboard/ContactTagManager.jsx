import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const TAG_COLORS = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'green', label: 'Verde', class: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'red', label: 'Vermelho', class: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-100 text-pink-800 border-pink-200' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'orange', label: 'Laranja', class: 'bg-orange-100 text-orange-800 border-orange-200' },
];

export default function ContactTagManager({ workspaceId, onClose }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: 'blue', description: '' });
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['contact-tags', workspaceId],
    queryFn: async () => {
      return await base44.entities.ContactTag.filter({ workspace_id: workspaceId });
    },
    enabled: !!workspaceId,
  });

  const createTagMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ContactTag.create({ ...data, workspace_id: workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags'] });
      resetForm();
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.ContactTag.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags'] });
      resetForm();
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (id) => {
      // Delete all assignments first
      const assignments = await base44.entities.ContactTagAssignment.filter({ tag_id: id });
      await Promise.all(assignments.map(a => base44.entities.ContactTagAssignment.delete(a.id)));
      // Then delete tag
      return await base44.entities.ContactTag.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags'] });
      queryClient.invalidateQueries({ queryKey: ['contact-tag-assignments'] });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', color: 'blue', description: '' });
    setEditingTag(null);
    setShowDialog(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTag) {
      updateTagMutation.mutate({ id: editingTag.id, data: formData });
    } else {
      createTagMutation.mutate(formData);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color, description: tag.description || '' });
    setShowDialog(true);
  };

  const handleDelete = (tag) => {
    if (window.confirm(`Deletar tag "${tag.name}"? Isso removerá a tag de todos os contatos.`)) {
      deleteTagMutation.mutate(tag.id);
    }
  };

  const getColorClass = (color) => {
    return TAG_COLORS.find(c => c.value === color)?.class || TAG_COLORS[0].class;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Gerenciar Tags
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={() => setShowDialog(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Tag
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-slate-500 py-8">Carregando...</p>
        ) : tags.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">Nenhuma tag criada</p>
            <Button onClick={() => setShowDialog(true)} variant="outline" size="sm">
              Criar primeira tag
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(tag.color)}`}>
                    {tag.name}
                  </span>
                  <span className="text-sm text-slate-500">
                    {tag.contact_count || 0} contato{(tag.contact_count || 0) !== 1 ? 's' : ''}
                  </span>
                  {tag.description && (
                    <span className="text-xs text-slate-400 italic">— {tag.description}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(tag)}
                    variant="ghost"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(tag)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Editar Tag' : 'Nova Tag'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Tag</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cliente VIP"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cor</label>
              <div className="grid grid-cols-4 gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      formData.color === color.value
                        ? `${color.class} border-slate-900 dark:border-slate-100`
                        : `${color.class} border-transparent opacity-60 hover:opacity-100`
                    }`}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Clientes com alto valor de contrato"
              />
            </div>
            <DialogFooter>
              <Button type="button" onClick={resetForm} variant="outline">
                Cancelar
              </Button>
              <Button type="submit" disabled={createTagMutation.isPending || updateTagMutation.isPending}>
                {editingTag ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}