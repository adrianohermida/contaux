import React from 'react';
import { Link2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RelationshipsEmpty({ onAdd }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Link2 className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
          Nenhum relacionamento cadastrado
        </p>
        <Button onClick={onAdd} variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar primeiro relacionamento
        </Button>
      </CardContent>
    </Card>
  );
}