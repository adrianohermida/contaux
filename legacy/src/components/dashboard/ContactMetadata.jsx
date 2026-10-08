import React from 'react';
import { Calendar, User } from 'lucide-react';
import { ClipboardCopy } from '@/components/ui/clipboard-copy';

export default function ContactMetadata({ contact }) {
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!contact?.id) return null;

  return (
    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Informações do Sistema</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="md:col-span-2">
          <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-2">
            <User className="w-4 h-4" />
            ID do Contato
          </p>
          <ClipboardCopy text={contact.id} label="ID" />
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4" />
            Criado em
          </p>
          <p className="text-slate-900 dark:text-slate-100">{formatDate(contact.created_date)}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4" />
            Última atualização
          </p>
          <p className="text-slate-900 dark:text-slate-100">{formatDate(contact.updated_date)}</p>
        </div>
        {contact.created_by && (
          <div>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-1">
              <User className="w-4 h-4" />
              Criado por
            </p>
            <p className="text-slate-900 dark:text-slate-100 truncate">{contact.created_by}</p>
          </div>
        )}
      </div>
    </div>
  );
}