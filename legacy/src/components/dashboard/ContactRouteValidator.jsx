import React from 'react';
import { Button } from '@/components/ui/button';

/**
 * ContactRouteValidator - Valida e renderiza estado de erro/contato não encontrado
 */
export default function ContactRouteValidator({ 
  contactId, 
  isLoading, 
  error, 
  contact,
  onNavigateBack 
}) {
  if (isLoading) {
    return null; // Loading state handled by parent
  }

  if (error && contactId !== 'new') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {error.message || 'Erro ao carregar contato'}
        </p>
        <Button onClick={onNavigateBack}>Voltar para Contatos</Button>
      </div>
    );
  }

  if (!contact && contactId !== 'new') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Contato não encontrado
        </p>
        <Button onClick={onNavigateBack}>Voltar para Contatos</Button>
      </div>
    );
  }

  return null;
}