import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trash2, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMultitenantAuthOptimized } from '../auth/useMultitenantAuthOptimized';

export default function ContactDeleteButton({ contactId, contactCreatedBy, onSuccess }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const queryClient = useQueryClient();
  const { user } = useMultitenantAuthOptimized('internal');

  // Check permissions
  const canDelete = user?.role === 'admin' || user?.email === contactCreatedBy;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!canDelete) {
        throw new Error('Você não tem permissão para deletar este contato');
      }
      await base44.entities.Client.delete(contactId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onSuccess?.();
    },
    onError: (error) => {
      setPermissionError(error.message);
    },
  });

  if (!canDelete) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Apenas administradores ou o criador podem deletar este contato
        </p>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-red-800 dark:text-red-200 mb-3 font-semibold">
          Deseja deletar este contato? Esta ação não pode ser desfeita.
        </p>
        {permissionError && (
          <p className="text-red-600 dark:text-red-300 mb-3 text-sm">{permissionError}</p>
        )}
        <div className="flex gap-2">
          <Button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deletando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Confirmar Deleção
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              setShowConfirm(false);
              setPermissionError(null);
            }}
            variant="outline"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      variant="outline"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Deletar Contato
    </Button>
  );
}