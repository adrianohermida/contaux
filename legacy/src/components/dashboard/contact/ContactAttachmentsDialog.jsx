/**
 * Contact Attachments Dialog
 * Complete attachment management interface
 */

import React from 'react';
import { Paperclip } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ContactAttachmentUpload from './ContactAttachmentUpload';
import ContactAttachmentsList from './ContactAttachmentsList';

export default function ContactAttachmentsDialog({ open, onClose, contactId, workspaceId }) {
  const queryClient = useQueryClient();

  // Fetch attachments
  const { data: attachments = [], isLoading, refetch } = useQuery({
    queryKey: ['contact-attachments', contactId],
    queryFn: async () => {
      return await base44.entities.ContactAttachment.filter({
        workspace_id: workspaceId,
        contact_id: contactId,
      });
    },
    enabled: open && !!contactId && !!workspaceId,
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['contact-attachments', contactId] });
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['contact-attachments', contactId] });
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5" aria-hidden="true" />
            Anexos do Contato
          </AlertDialogTitle>
          <AlertDialogDescription>
            Faça upload, visualize e gerencie arquivos anexados ao contato
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 px-6">
          {/* Upload Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Adicionar Novo Anexo
            </h3>
            <ContactAttachmentUpload
              contactId={contactId}
              workspaceId={workspaceId}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>

          {/* Attachments List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Anexos ({attachments.length})
            </h3>
            <ContactAttachmentsList
              attachments={attachments}
              onDeleteSuccess={handleDeleteSuccess}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}