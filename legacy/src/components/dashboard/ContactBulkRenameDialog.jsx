/**
 * Bulk Rename Dialog
 * Rename multiple contacts at once with preview
 */

import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function ContactBulkRenameDialog({ open, onClose, selectedIds, workspaceId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch selected contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['selected-contacts-rename', selectedIds],
    queryFn: async () => {
      if (selectedIds.length === 0) return [];
      return Promise.all(
        selectedIds.map(id => base44.entities.Client.get(id))
      );
    },
    enabled: open && selectedIds.length > 0,
  });

  const bulkRenameMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        contacts.map(contact => 
          base44.entities.Client.update(contact.id, {
            company_name: contact.company_name.replace(new RegExp(searchTerm, 'g'), replaceWith)
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setSearchTerm('');
      setReplaceWith('');
      setConfirmOpen(false);
      onClose();
    },
  });

  const preview = contacts.map(c => ({
    ...c,
    newName: c.company_name.replace(new RegExp(searchTerm, 'g'), replaceWith)
  }));

  const hasChanges = preview.some(p => p.newName !== p.company_name);

  return (
    <>
      <AlertDialog open={open && !confirmOpen} onOpenChange={(val) => !val && onClose()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Renomear em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Encontrar e substituir em {selectedIds.length} contato{selectedIds.length > 1 ? 's' : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                Buscar
              </label>
              <Input
                id="search"
                placeholder="Texto a procurar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="replace" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                Substituir por
              </label>
              <Input
                id="replace"
                placeholder="Novo texto..."
                value={replaceWith}
                onChange={(e) => setReplaceWith(e.target.value)}
                className="min-h-[44px]"
              />
            </div>

            {hasChanges && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <strong>{preview.filter(p => p.newName !== p.company_name).length}</strong> contato(s) será(ão) alterado(s)
              </div>
            )}

            {searchTerm && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Preview:</p>
                {preview.slice(0, 5).map((p, i) => (
                  <div key={i} className="text-xs p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-600">
                    <div className="line-through text-slate-500">{p.company_name}</div>
                    <div className="text-green-600 dark:text-green-400">{p.newName}</div>
                  </div>
                ))}
                {preview.length > 5 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">+{preview.length - 5} mais</p>
                )}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setConfirmOpen(true)}
              disabled={!hasChanges || bulkRenameMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Renomear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Renomeação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja renomear {preview.filter(p => p.newName !== p.company_name).length} contato(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkRenameMutation.mutate()}
              disabled={bulkRenameMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {bulkRenameMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Renomeando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}