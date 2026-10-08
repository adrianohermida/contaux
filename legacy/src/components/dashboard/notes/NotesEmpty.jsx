import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotesEmpty({ searchTerm, onAddNote }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-slate-600 dark:text-slate-400 text-center">
          {searchTerm ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
        </p>
        {!searchTerm && (
          <Button onClick={onAddNote} variant="outline" size="sm" className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Adicionar primeira nota
          </Button>
        )}
      </CardContent>
    </Card>
  );
}