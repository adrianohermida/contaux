import React from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientsHeader({ totalCount, filteredCount, onNewClient, onImportClick }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Clientes</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {filteredCount} de {totalCount} cliente{totalCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={onImportClick} variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Importar
        </Button>
        <Button onClick={onNewClient} size="sm" className="gap-2">
          <Plus className="w-5 h-5" />
          Novo
        </Button>
      </div>
    </div>
  );
}