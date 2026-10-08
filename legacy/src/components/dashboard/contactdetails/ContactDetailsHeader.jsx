import React from 'react';
import { ArrowLeft, Tag, Link2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactDetailsHeader({ isEditing, contactId, formData, onBack, onOpenTagManager, onOpenRelationshipManager, onOpenAttachments }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="min-h-[44px] flex-shrink-0"
            aria-label="Voltar para lista de contatos"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 break-words line-clamp-2">
              {isEditing ? (contactId === 'new' ? 'Novo Contato' : 'Editar Contato') : formData?.company_name}
            </h1>
          </div>
        </div>
        {isEditing && (
          <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium flex-shrink-0">
            Modo edição
          </span>
        )}
      </div>

      {!isEditing && contactId !== 'new' && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTagManager}
            className="gap-2 min-h-[44px]"
            aria-label="Gerenciar tags do contato"
          >
            <Tag className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Tags</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRelationshipManager}
            className="gap-2 min-h-[44px]"
            aria-label="Gerenciar relacionamentos do contato"
          >
            <Link2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Relacionamentos</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAttachments}
            className="gap-2 min-h-[44px]"
            aria-label="Gerenciar anexos do contato"
          >
            <Paperclip className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Anexos</span>
          </Button>
        </div>
      )}
    </div>
  );
}