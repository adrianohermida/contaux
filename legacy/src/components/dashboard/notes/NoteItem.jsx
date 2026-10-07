import React from 'react';
import { Pin, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NOTE_TYPE_ICONS = {
  general: () => null,
  call: () => null,
  meeting: () => null,
  email: () => null,
  task: () => null,
};

const NOTE_TYPE_LABELS = {
  general: 'Geral',
  call: 'Ligação',
  meeting: 'Reunião',
  email: 'Email',
  task: 'Tarefa',
};

export default function NoteItem({ note, onEdit, onDelete }) {
  const timeAgo = formatDistanceToNow(new Date(note.created_date), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card className="relative">
      {note.is_pinned && (
        <div className="absolute top-2 left-2">
          <Pin className="w-4 h-4 text-blue-600 fill-blue-600" />
        </div>
      )}
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-medium text-slate-500">
                {NOTE_TYPE_LABELS[note.note_type]}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{timeAgo}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{note.created_by}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
              {note.content}
            </p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              onClick={() => onEdit(note)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onDelete(note)}
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
  );
}