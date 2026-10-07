import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RelationshipsHeader({ onAdd }) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Relacionamentos</h3>
      <Button onClick={onAdd} size="sm" className="gap-2">
        <Plus className="w-4 h-4" />
        Adicionar
      </Button>
    </div>
  );
}