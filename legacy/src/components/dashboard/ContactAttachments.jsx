import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AttachmentsHeader from './attachments/AttachmentsHeader';
import AttachmentsList from './attachments/AttachmentsList';
import UploadDialog from './attachments/UploadDialog';

export default function ContactAttachments({ contactId, workspaceId }) {
   const [showDialog, setShowDialog] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [description, setDescription] = useState('');
   const [category, setCategory] = useState('outro');
   const [selectedFile, setSelectedFile] = useState(null);
   const [page, setPage] = useState(1);
   const ITEMS_PER_PAGE = 15;
   const fileInputRef = useRef(null);
   const queryClient = useQueryClient();

   const { data: allAttachments = [], isLoading } = useQuery({
     queryKey: ['contact-attachments', contactId, workspaceId],
     queryFn: () => base44.entities.ContactAttachment.filter({ 
       contact_id: contactId,
       workspace_id: workspaceId
     }),
     enabled: !!contactId && !!workspaceId,
   });

   const attachments = allAttachments.slice(0, page * ITEMS_PER_PAGE);
   const hasMore = allAttachments.length > attachments.length;

  const uploadMutation = useMutation({
    mutationFn: async ({ file, description, category }) => {
      setUploading(true);
      try {
        // Upload file
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        // Create attachment record
        const attachment = await base44.entities.ContactAttachment.create({
          workspace_id: workspaceId,
          contact_id: contactId,
          file_url,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          description: description || '',
          category,
        });

        // Create activity
        await base44.entities.ContactActivity.create({
          workspace_id: workspaceId,
          contact_id: contactId,
          activity_type: 'edit',
          description: `Arquivo anexado: ${file.name}`,
          metadata: {
            attachment_id: attachment.id,
            file_name: file.name,
            file_size: file.size,
            category,
          },
        });

        return attachment;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-attachments'] });
      queryClient.invalidateQueries({ queryKey: ['contact-activities'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachment) => {
      await base44.entities.ContactAttachment.delete(attachment.id);

      // Create activity
      await base44.entities.ContactActivity.create({
        workspace_id: workspaceId,
        contact_id: contactId,
        activity_type: 'edit',
        description: `Arquivo removido: ${attachment.file_name}`,
        metadata: {
          attachment_id: attachment.id,
          file_name: attachment.file_name,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-attachments'] });
      queryClient.invalidateQueries({ queryKey: ['contact-activities'] });
    },
  });

  const handleCloseDialog = useCallback(() => {
    setShowDialog(false);
    setSelectedFile(null);
    setDescription('');
    setCategory('outro');
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo: 10MB');
        return;
      }
      setSelectedFile(file);
      setShowDialog(true);
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (!selectedFile) return;
    uploadMutation.mutate({ file: selectedFile, description, category });
  }, [selectedFile, description, category, uploadMutation]);

  const handleDownload = useCallback((attachment) => {
    window.open(attachment.file_url, '_blank');
  }, []);

  const handleDelete = useCallback((attachment) => {
    if (window.confirm(`Deletar o arquivo "${attachment.file_name}"?`)) {
      deleteMutation.mutate(attachment);
    }
  }, [deleteMutation]);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AttachmentsHeader onUpload={() => fileInputRef.current?.click()} />

      {isLoading ? (
        <p className="text-center text-slate-500 py-8">Carregando...</p>
      ) : (
        <AttachmentsList
          attachments={attachments}
          hasMore={hasMore}
          allAttachmentsCount={allAttachments.length}
          displayedAttachmentsCount={attachments.length}
          onLoadMore={() => setPage(p => p + 1)}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onUpload={() => fileInputRef.current?.click()}
        />
      )}

      <UploadDialog
        open={showDialog}
        onClose={handleCloseDialog}
        selectedFile={selectedFile}
        description={description}
        onDescriptionChange={setDescription}
        category={category}
        onCategoryChange={setCategory}
        uploading={uploading}
        onUpload={handleUpload}
      />
    </div>
  );
}