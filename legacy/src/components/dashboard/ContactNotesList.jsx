/**
 * Contact Notes List
 * Display and manage contact notes
 */

import React, { useState } from 'react';
import { MessageSquare, Pin, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ContactNotesList({ contactId, workspaceId, onAddNote }) {
  const [deleteNoteId, setDeleteNoteId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['contact-notes', contactId, workspaceId],
    queryFn: async () => {
      const items = await base44.entities.ContactNote.filter({
        workspace_id: workspaceId,
        contact_id: contactId,
      });
      // Pinned notes first, then sorted by date
      return items.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
        return new Date(b.created_date) - new Date(a.created_date);
      });
    },
    enabled: !!contactId && !!workspaceId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (noteId) => base44.entities.ContactNote.delete(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] });
      setDeleteNoteId(null);
    },
  });

  // Pin/Unpin mutation
  const pinMutation = useMutation({
    mutationFn: ({ noteId, isPinned }) =>
      base44.entities.ContactNote.update(noteId, { is_pinned: !isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" aria-hidden="true" />
        <span className="text-slate-600 dark:text-slate-400">Carregando notas...</span>
      </div>
    );
  }

  const getNoteTypeLabel = (type) => {
    const labels = {
      general: 'Geral',
      call: 'Ligação',
      meeting: 'Reunião',
      email: 'Email',
      task: 'Tarefa',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-3">
      {/* Add Note Button */}
      <Button
        onClick={onAddNote}
        className="w-full gap-2 min-h-[44px]"
        variant="outline"
        aria-label="Adicionar nova nota"
      >
        <MessageSquare className="w-4 h-4" aria-hidden="true" />
        Adicionar Nota
      </Button>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
          <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhuma nota registrada
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border transition-colors ${
                note.is_pinned
                  ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {getNoteTypeLabel(note.note_type)}
                  </span>
                </div>
                <time className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {format(new Date(note.created_date), "dd 'de' MMMM", { locale: ptBR })}
                </time>
              </div>

              {/* Content */}
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-3 break-words">
                {note.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  por <span className="font-medium">{note.created_by}</span>
                </p>
                <div className="flex gap-1">
                  <Button
                    onClick={() => pinMutation.mutate({ noteId: note.id, isPinned: note.is_pinned })}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={pinMutation.isPending}
                    aria-label={note.is_pinned ? 'Desafixar nota' : 'Afixar nota'}
                    title={note.is_pinned ? 'Desafixar' : 'Afixar'}
                  >
                    <Pin
                      className={`w-4 h-4 ${
                        note.is_pinned ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                  </Button>
                  <Button
                    onClick={() => setDeleteNoteId(note.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={deleteMutation.isPending}
                    aria-label="Deletar nota"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={(val) => !val && setDeleteNoteId(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Nota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta nota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteNoteId)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}