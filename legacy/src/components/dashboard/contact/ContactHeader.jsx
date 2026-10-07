import React from 'react';
import { Plus, Upload, Tag, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContactExportButton from '../ContactExportButton';

export default function ContactHeader({
  filteredCount,
  totalCount,
  onNewContact,
  onImportClick,
  onTagsClick,
  onStatsClick,
  contacts
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Contatos</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {filteredCount} de {totalCount} contato{totalCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={onStatsClick} variant="outline" size="sm" className="gap-2">
          <TrendingUp className="w-4 h-4" />
          Estatísticas
        </Button>
        <Button onClick={onTagsClick} variant="outline" size="sm" className="gap-2">
          <Tag className="w-4 h-4" />
          Tags
        </Button>
        <Button onClick={onImportClick} variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Importar
        </Button>
        <ContactExportButton contacts={contacts} />
        <Button onClick={onNewContact} size="sm" className="gap-2">
          <Plus className="w-5 h-5" />
          Novo
        </Button>
      </div>
    </div>
  );
}