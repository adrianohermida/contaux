import React, { useState } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const TAG_COLORS = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function ContactBulkTagEditor({ selectedIds, workspaceId, open, onClose }) {
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [action, setAction] = useState('add'); // 'add' or 'remove'
  const queryClient = useQueryClient();

  const { data: tags = [] } = useQuery({
    queryKey: ['contact-tags', workspaceId],
    queryFn: async () => {
      return await base44.entities.ContactTag.filter({ workspace_id: workspaceId });
    },
    enabled: !!workspaceId && open,
  });

  const bulkTagMutation = useMutation({
    mutationFn: async ({ action, tagIds, contactIds }) => {
      if (action === 'add') {
        // Add tags to all selected contacts
        const operations = [];
        const activityOps = [];
        for (const contactId of contactIds) {
          for (const tagId of tagIds) {
            // Check if assignment already exists
            const existing = await base44.entities.ContactTagAssignment.filter({
              contact_id: contactId,
              tag_id: tagId,
            });
            if (existing.length === 0) {
              operations.push(
                base44.entities.ContactTagAssignment.create({
                  workspace_id: workspaceId,
                  contact_id: contactId,
                  tag_id: tagId,
                })
              );
              
              // Create activity for each tag added
              const tag = tags.find(t => t.id === tagId);
              activityOps.push(
                base44.entities.ContactActivity.create({
                  workspace_id: workspaceId,
                  contact_id: contactId,
                  activity_type: 'tag_added',
                  description: `Tag adicionada em massa: ${tag?.name || 'Tag'}`,
                  metadata: { tag_id: tagId, tag_name: tag?.name, bulk_operation: true },
                })
              );
            }
          }
        }
        await Promise.all([...operations, ...activityOps]);
        return operations.length;
      } else {
        // Remove tags from all selected contacts
        const operations = [];
        const activityOps = [];
        for (const contactId of contactIds) {
          for (const tagId of tagIds) {
            const assignments = await base44.entities.ContactTagAssignment.filter({
              contact_id: contactId,
              tag_id: tagId,
            });
            for (const assignment of assignments) {
              operations.push(base44.entities.ContactTagAssignment.delete(assignment.id));
              
              // Create activity for each tag removed
              const tag = tags.find(t => t.id === tagId);
              activityOps.push(
                base44.entities.ContactActivity.create({
                  workspace_id: workspaceId,
                  contact_id: contactId,
                  activity_type: 'tag_removed',
                  description: `Tag removida em massa: ${tag?.name || 'Tag'}`,
                  metadata: { tag_id: tagId, tag_name: tag?.name, bulk_operation: true },
                })
              );
            }
          }
        }
        await Promise.all([...operations, ...activityOps]);
        return operations.length;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tag-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['contact-tags'] });
      queryClient.invalidateQueries({ queryKey: ['contact-activities'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setSelectedTagIds([]);
    setAction('add');
    onClose();
  };

  const handleSubmit = () => {
    if (selectedTagIds.length === 0) {
      alert('Selecione pelo menos uma tag');
      return;
    }
    bulkTagMutation.mutate({ action, tagIds: selectedTagIds, contactIds: selectedIds });
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Editar Tags em Massa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {selectedIds.length} contato{selectedIds.length > 1 ? 's' : ''} selecionado{selectedIds.length > 1 ? 's' : ''}
          </p>

          {/* Action Selector */}
          <div className="flex gap-2">
            <Button
              onClick={() => setAction('add')}
              variant={action === 'add' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Tags
            </Button>
            <Button
              onClick={() => setAction('remove')}
              variant={action === 'remove' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remover Tags
            </Button>
          </div>

          {/* Tag Selection */}
          {tags.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Nenhuma tag disponível. Crie tags primeiro.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto border rounded-lg p-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedTagIds.includes(tag.id)
                      ? `${TAG_COLORS[tag.color] || TAG_COLORS.blue} border-slate-900 dark:border-slate-100`
                      : `${TAG_COLORS[tag.color] || TAG_COLORS.blue} border-transparent opacity-50 hover:opacity-100`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tag.name}</span>
                    {selectedTagIds.includes(tag.id) && (
                      <span className="text-xs">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={bulkTagMutation.isPending || selectedTagIds.length === 0}
          >
            {bulkTagMutation.isPending ? 'Processando...' : action === 'add' ? 'Adicionar' : 'Remover'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}