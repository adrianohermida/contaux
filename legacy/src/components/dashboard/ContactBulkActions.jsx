import React, { useState } from 'react';
import { Trash2, CheckCircle, XCircle, Tag, Edit2, GitMerge } from 'lucide-react';
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
import ContactBulkRenameDialog from './ContactBulkRenameDialog';
import ContactBulkMergeDialog from './ContactBulkMergeDialog';

export default function ContactBulkActions({ selectedIds, onClearSelection, onEditTags, userRole, workspaceId }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const queryClient = useQueryClient();

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.entities.Client.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onClearSelection();
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }) => {
      await Promise.all(ids.map(id => 
        base44.entities.Client.update(id, { status })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onClearSelection();
    },
  });

  const handleBulkDelete = () => {
    if (userRole !== 'admin') {
      alert('Apenas administradores podem deletar contatos em massa');
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds);
    setShowDeleteDialog(false);
  };

  const handleBulkStatus = (status) => {
    setTargetStatus(status);
    setShowStatusDialog(true);
  };

  const confirmBulkStatus = () => {
    bulkStatusMutation.mutate({ ids: selectedIds, status: targetStatus });
    setShowStatusDialog(false);
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-50 bg-white dark:bg-slate-800 rounded-lg sm:rounded-full shadow-xl border border-slate-200 dark:border-slate-700 p-4 sm:px-6 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {selectedIds.length} selecionado{selectedIds.length > 1 ? 's' : ''}
        </span>
        
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEditTags}
            className="gap-2 min-h-[44px]"
            aria-label="Editar tags dos contatos selecionados"
          >
            <Tag className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Tags</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkStatus('active')}
            className="gap-2 min-h-[44px]"
            aria-label="Ativar contatos selecionados"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Ativar</span>
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkStatus('inactive')}
            className="gap-2 min-h-[44px]"
            aria-label="Desativar contatos selecionados"
          >
            <XCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Desativar</span>
          </Button>

          {selectedIds.length >= 2 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRenameDialog(true)}
              className="gap-2 min-h-[44px]"
              aria-label="Renomear contatos selecionados"
            >
              <Edit2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Renomear</span>
            </Button>
          )}

          {selectedIds.length >= 2 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMergeDialog(true)}
              className="gap-2 min-h-[44px]"
              aria-label="Mesclar contatos selecionados"
            >
              <GitMerge className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Mesclar</span>
            </Button>
          )}
          
          {userRole === 'admin' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              className="gap-2 min-h-[44px]"
              aria-label="Deletar contatos selecionados"
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Deletar</span>
            </Button>
          )}
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="min-h-[44px]"
          aria-label="Cancelar seleção"
        >
          Cancelar
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar {selectedIds.length} contato{selectedIds.length > 1 ? 's' : ''}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar Status em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja alterar o status de {selectedIds.length} contato{selectedIds.length > 1 ? 's' : ''} para {targetStatus === 'active' ? 'Ativo' : 'Inativo'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkStatus}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ContactBulkRenameDialog
        open={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        selectedIds={selectedIds}
        workspaceId={workspaceId}
      />

      <ContactBulkMergeDialog
        open={showMergeDialog}
        onClose={() => setShowMergeDialog(false)}
        selectedIds={selectedIds}
        workspaceId={workspaceId}
      />
    </>
  );
}