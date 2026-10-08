import React from 'react';
import { Pin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoteItem from './NoteItem';
import NotesEmpty from './NotesEmpty';

export default function NotesList({
  pinnedNotes,
  regularNotes,
  hasMore,
  allNotesCount,
  displayedNotesCount,
  onLoadMore,
  onEdit,
  onDelete,
  onAddNote,
  searchTerm
}) {
  const filteredNotes = [...pinnedNotes, ...regularNotes];

  if (filteredNotes.length === 0) {
    return <NotesEmpty searchTerm={searchTerm} onAddNote={onAddNote} />;
  }

  return (
    <div className="space-y-4">
      {pinnedNotes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Pin className="w-4 h-4" />
            FIXADAS
          </h3>
          {pinnedNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {regularNotes.length > 0 && (
        <div className="space-y-2">
          {pinnedNotes.length > 0 && (
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              TODAS AS NOTAS
            </h3>
          )}
          {regularNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <Button onClick={onLoadMore} variant="outline" className="w-full">
          Carregar mais ({allNotesCount - displayedNotesCount} restantes)
        </Button>
      )}
    </div>
  );
}