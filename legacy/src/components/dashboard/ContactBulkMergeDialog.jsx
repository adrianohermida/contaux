/**
 * Bulk Merge Dialog
 * Merge multiple contacts into one primary contact
 */

import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
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
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ContactBulkMergeDialog({ open, onClose, selectedIds, workspaceId }) {
  const [primaryId, setPrimaryId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch selected contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['selected-contacts-merge', selectedIds],
    queryFn: async () => {
      if (selectedIds.length === 0) return [];
      return Promise.all(
        selectedIds.map(id => base44.entities.Client.get(id))
      );
    },
    enabled: open && selectedIds.length > 0,
  });

  const bulkMergeMutation = useMutation({
    mutationFn: async () => {
      const primary = contacts.find(c => c.id === primaryId);
      if (!primary) throw new Error('Primary contact not found');

      // Merge related data and delete duplicates
      const contactsToDelete = contacts.filter(c => c.id !== primaryId);
      
      for (const contact of contactsToDelete) {
        // Merge notes
        const notes = await base44.entities.ContactNote.filter({ contact_id: contact.id });
        for (const note of notes) {
          await base44.entities.ContactNote.update(note.id, { contact_id: primaryId });
        }

        // Merge relationships
        const relationships = await base44.entities.ContactRelationship.filter({ contact_id: contact.id });
        for (const rel of relationships) {
          await base44.entities.ContactRelationship.update(rel.id, { contact_id: primaryId });
        }

        // Delete contact
        await base44.entities.Client.delete(contact.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setPrimaryId(null);
      setConfirmOpen(false);
      onClose();
    },
  });

  const canMerge = primaryId && selectedIds.length >= 2;

  return (
    <>
      <AlertDialog open={open && !confirmOpen} onOpenChange={(val) => !val && onClose()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Mesclar Contatos</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione um contato primário. Os outros serão mesclados nele.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setPrimaryId(contact.id)}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors min-h-[50px] flex items-center justify-between ${
                  primaryId === contact.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                role="radio"
                aria-checked={primaryId === contact.id}
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{contact.company_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{contact.email}</p>
                </div>
                {primaryId === contact.id && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          {primaryId && selectedIds.length >= 2 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {selectedIds.length - 1} contato(s) será(ão) deletado(s)
              </p>
              <p className="text-xs mt-1">Notas e relacionamentos serão preservados.</p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setConfirmOpen(true)}
              disabled={!canMerge}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Mesclar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Mesclagem</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja mesclar {selectedIds.length} contato(s) em um? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkMergeMutation.mutate()}
              disabled={bulkMergeMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {bulkMergeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mesclando...
                </>
              ) : (
                'Confirmar Mesclagem'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}