/**
 * Contact Attachments List Component
 * Display and manage contact attachments with download and delete
 */

import React from 'react';
import { Download, Trash2, FileIcon, AlertCircle, Loader2, Eye } from 'lucide-react';
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
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatBytes } from '@/components/utils/fileUtils';

const CATEGORY_LABELS = {
  contrato: 'Contrato',
  certidao: 'Certidão',
  fiscal: 'Fiscal',
  proposta: 'Proposta',
  outro: 'Outro',
};

const CATEGORY_COLORS = {
  contrato: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  certidao: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  fiscal: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  proposta: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  outro: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
};

export default function ContactAttachmentsList({ attachments = [], onDeleteSuccess }) {
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [previewAttachment, setPreviewAttachment] = React.useState(null);

  const deleteMutation = useMutation({
    mutationFn: (attachmentId) => base44.entities.ContactAttachment.delete(attachmentId),
    onSuccess: () => {
      setDeleteConfirm(null);
      onDeleteSuccess?.();
    },
  });

  const handleDownload = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <FileIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhum anexo adicionado ainda.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {attachments.map((attachment) => {
          const ext = attachment.file_name.split('.').pop().toLowerCase();
          const categoryColor = CATEGORY_COLORS[attachment.category] || CATEGORY_COLORS.outro;
          const categoryLabel = CATEGORY_LABELS[attachment.category] || 'Outro';

          return (
            <div
              key={attachment.id}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <FileIcon className="w-8 h-8 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm break-words">
                    {attachment.file_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full border font-medium ${categoryColor}`}>
                      {categoryLabel}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(attachment.file_size)}
                    </span>
                    {attachment.created_date && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(attachment.created_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  {attachment.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 break-words">
                      {attachment.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {['pdf', 'jpg', 'jpeg', 'png'].includes(ext) && (
                    <Button
                      onClick={() => setPreviewAttachment(attachment)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 min-h-0"
                      aria-label={`Visualizar ${attachment.file_name}`}
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDownload(attachment)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 min-h-0"
                    aria-label={`Baixar ${attachment.file_name}`}
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirm(attachment.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 min-h-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    aria-label={`Deletar ${attachment.file_name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(val) => !val && setDeleteConfirm(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este arquivo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Deletando...
                </>
              ) : (
                'Deletar Arquivo'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      {previewAttachment && (
        <AlertDialog open={!!previewAttachment} onOpenChange={(val) => !val && setPreviewAttachment(null)}>
          <AlertDialogContent className="max-w-3xl max-h-[80vh]">
            <AlertDialogHeader>
              <AlertDialogTitle>{previewAttachment.file_name}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="overflow-auto max-h-[60vh]">
              {previewAttachment.file_name.endsWith('.pdf') ? (
                <iframe
                  src={previewAttachment.file_url}
                  className="w-full h-96"
                  title={previewAttachment.file_name}
                  aria-label={`Preview do arquivo ${previewAttachment.file_name}`}
                />
              ) : (
                <img
                  src={previewAttachment.file_url}
                  alt={previewAttachment.file_name}
                  className="w-full h-auto"
                />
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Fechar</AlertDialogCancel>
              <Button
                onClick={() => handleDownload(previewAttachment)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                Baixar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}