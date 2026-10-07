/**
 * Contact Tag Manager Dialog
 * Create, edit, delete and manage contact tags with bulk operations
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const TAG_COLORS = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' },
  { value: 'green', label: 'Verde', class: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' },
  { value: 'red', label: 'Vermelho', class: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' },
  { value: 'orange', label: 'Laranja', class: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300' },
];

export default function ContactTagManagerDialog({ open, onClose, workspaceId }) {
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['contact-tags', workspaceId],
    queryFn: async () => {
      return await base44.entities.ContactTag.filter({ workspace_id: workspaceId });
    },
    enabled: open && !!workspaceId,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingId) {
        return await base44.entities.ContactTag.update(editingId, data);
      }
      return await base44.entities.ContactTag.create({
        workspace_id: workspaceId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags', workspaceId] });
      setTagName('');
      setSelectedColor('blue');
      setEditingId(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (tagId) => base44.entities.ContactTag.delete(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags', workspaceId] });
      setDeleteConfirm(null);
    },
  });

  const handleSave = async () => {
    if (!tagName.trim()) {
      alert('Nome da tag é obrigatório');
      return;
    }
    saveMutation.mutate({ name: tagName.trim(), color: selectedColor });
  };

  const handleEdit = (tag) => {
    setEditingId(tag.id);
    setTagName(tag.name);
    setSelectedColor(tag.color || 'blue');
  };

  const handleCancel = () => {
    setTagName('');
    setSelectedColor('blue');
    setEditingId(null);
  };

  const colorOption = TAG_COLORS.find(c => c.value === selectedColor);

  return (
    <>
      <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Gerenciar Tags</AlertDialogTitle>
            <AlertDialogDescription>
              Crie, edite ou delete tags para organizar seus contatos
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6">
            {/* Create/Edit Form */}
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <label htmlFor="tag-name" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                  Nome da Tag
                </label>
                <Input
                  id="tag-name"
                  placeholder="Ex: Cliente VIP, Em Andamento..."
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="min-h-[44px]"
                  aria-label="Nome da tag"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-slate-900 dark:text-slate-100">
                  Cor
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TAG_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`p-3 rounded-lg border-2 transition-all min-h-[44px] flex items-center justify-center ${
                        selectedColor === color.value
                          ? `${color.class} border-current`
                          : `${color.class} border-transparent hover:border-current`
                      }`}
                      aria-label={`Selecionar cor ${color.label}`}
                      aria-pressed={selectedColor === color.value}
                      role="radio"
                    >
                      <span className="text-xs font-medium">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {tagName && (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Preview:</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${colorOption?.class}`}>
                    {tagName}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={!tagName.trim() || saveMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[44px]"
                  aria-label={editingId ? 'Atualizar tag' : 'Criar nova tag'}
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      {editingId ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : editingId ? (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      Atualizar
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                      Criar
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="min-h-[44px]"
                    aria-label="Cancelar edição"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>

            {/* Tags List */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Tags ({tags.length})
              </h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" aria-hidden="true" />
                </div>
              ) : tags.length === 0 ? (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-sm">Nenhuma tag criada. Crie uma acima para começar.</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
                  {tags.map(tag => {
                    const color = TAG_COLORS.find(c => c.value === tag.color);
                    return (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${color?.class} flex-shrink-0`}>
                            {tag.name}
                          </div>
                          {tag.contact_count !== undefined && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                              {tag.contact_count} contato{tag.contact_count !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Button
                            onClick={() => handleEdit(tag)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 min-h-0"
                            aria-label={`Editar tag ${tag.name}`}
                          >
                            <Edit2 className="w-4 h-4" aria-hidden="true" />
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirm(tag.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 min-h-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            aria-label={`Deletar tag ${tag.name}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(val) => !val && setDeleteConfirm(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta tag? Contatos não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Deletando...
                </>
              ) : (
                'Deletar Tag'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}