/**
 * Contact Note Form
 * Create/edit a contact note
 */

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const NOTE_TYPES = [
  { value: 'general', label: 'Geral' },
  { value: 'call', label: 'Ligação' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'email', label: 'Email' },
  { value: 'task', label: 'Tarefa' },
];

export default function ContactNoteForm({ open, onClose, contactId, workspaceId, onSuccess }) {
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState('general');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      base44.entities.ContactNote.create({
        workspace_id: workspaceId,
        contact_id: contactId,
        content,
        note_type: noteType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] });
      setContent('');
      setNoteType('general');
      onClose();
      onSuccess?.();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nota</DialogTitle>
          <DialogDescription>
            Registre observações, ligações, reuniões ou tarefas relacionadas a este contato
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label htmlFor="note-type" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Tipo de Nota
            </label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger id="note-type" className="min-h-[40px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="note-content" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Conteúdo
            </label>
            <Textarea
              id="note-content"
              placeholder="Digite sua nota aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              aria-label="Conteúdo da nota"
            />
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Salvando...
                </>
              ) : (
                'Salvar Nota'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}