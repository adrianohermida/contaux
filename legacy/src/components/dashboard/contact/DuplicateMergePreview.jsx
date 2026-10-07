/**
 * Duplicate Merge Preview
 * Preview and execute merge with conflict resolution
 */

import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { mergeContacts } from '@/components/utils/similarityUtils';

export default function DuplicateMergePreview({ open, onClose, duplicate, onMergeSuccess }) {
  const [primaryId, setPrimaryId] = useState(duplicate?.contact1.id);
  const [confirmMerge, setConfirmMerge] = useState(false);
  const queryClient = useQueryClient();

  if (!duplicate) return null;

  const primary = primaryId === duplicate.contact1.id ? duplicate.contact1 : duplicate.contact2;
  const secondary = primaryId === duplicate.contact1.id ? duplicate.contact2 : duplicate.contact1;
  const mergedData = mergeContacts(duplicate.contact1, duplicate.contact2, primaryId);

  const mergeMutation = useMutation({
    mutationFn: async () => {
      // Update primary contact with merged data
      await base44.entities.Client.update(primaryId, mergedData);

      // Log activity
      await base44.entities.ContactActivity.create({
        workspace_id: duplicate.contact1.tenant_id,
        contact_id: primaryId,
        activity_type: 'edit',
        description: `Contato mesclado com ${secondary.company_name} (ID: ${secondary.id})`,
        metadata: {
          merged_from: secondary.id,
          similarity_score: duplicate.score,
        },
      });

      // Delete secondary contact
      await base44.entities.Client.delete(secondary.id);

      return { primaryId, secondaryId: secondary.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onMergeSuccess?.();
      onClose();
    },
  });

  const renderField = (label, value1, value2, merged) => {
    const isSame = value1 === value2;
    return (
      <div key={label} className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{label}</p>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 dark:text-slate-100 font-medium break-words">{value1 || '—'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Primário</p>
          </div>

          {!isSame && (
            <>
              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-slate-100 font-medium break-words">{value2 || '—'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Secundário</p>
              </div>
            </>
          )}
        </div>
        {merged !== value1 && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Resultado:</strong> {merged || '—'}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" aria-hidden="true" />
            Preview de Merge
          </AlertDialogTitle>
          <AlertDialogDescription>
            Similaridade: <strong>{duplicate.score}%</strong> - Selecione qual será o contato primário
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-6">
          {/* Primary Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Contato Primário</p>
            <div className="grid grid-cols-2 gap-3">
              {[duplicate.contact1, duplicate.contact2].map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setPrimaryId(contact.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left min-h-[100px] ${
                    primaryId === contact.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                  }`}
                  aria-pressed={primaryId === contact.id}
                  role="radio"
                >
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {contact.company_name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {contact.email}
                  </p>
                  {primaryId === contact.id && (
                    <div className="mt-2 flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <CheckCircle className="w-4 h-4" aria-hidden="true" />
                      <span className="text-xs font-medium">Será mantido</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Merge Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Resultado do Merge
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {renderField('Empresa', primary.company_name, secondary.company_name, mergedData.company_name)}
              {renderField('Email', primary.email, secondary.email, mergedData.email)}
              {renderField('Telefone', primary.phone, secondary.phone, mergedData.phone)}
              {renderField(
                'CNPJ/CPF',
                primary.cnpj || primary.cpf,
                secondary.cnpj || secondary.cpf,
                mergedData.cnpj || mergedData.cpf
              )}
              {renderField('Cidade', primary.cidade, secondary.cidade, mergedData.cidade)}
              {renderField('Status', primary.status, secondary.status, mergedData.status)}
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              O contato secundário ({secondary.company_name}) será deletado. Todas as tags e relacionamentos serão movidos para o primário.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => setConfirmMerge(true)}
            disabled={mergeMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {mergeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Mesclando...
              </>
            ) : (
              'Confirmar Merge'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

      {/* Final Confirmation */}
      <AlertDialog open={confirmMerge} onOpenChange={setConfirmMerge}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
              Confirmar Mesclagem
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja mesclar esses contatos? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mergeMutation.mutate()}
              disabled={mergeMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {mergeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Mesclando...
                </>
              ) : (
                'Sim, Mesclar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialog>
  );
}