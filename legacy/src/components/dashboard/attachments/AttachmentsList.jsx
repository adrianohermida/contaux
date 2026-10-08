import React from 'react';
import { Button } from '@/components/ui/button';
import AttachmentItem from './AttachmentItem';
import AttachmentsEmpty from './AttachmentsEmpty';

export default function AttachmentsList({
  attachments,
  hasMore,
  allAttachmentsCount,
  displayedAttachmentsCount,
  onLoadMore,
  onDownload,
  onDelete,
  onUpload
}) {
  if (attachments.length === 0) {
    return <AttachmentsEmpty onUpload={onUpload} />;
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => (
        <AttachmentItem
          key={attachment.id}
          attachment={attachment}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}

      {hasMore && (
        <Button 
          onClick={onLoadMore}
          variant="outline"
          className="w-full"
        >
          Carregar mais ({allAttachmentsCount - displayedAttachmentsCount} arquivos)
        </Button>
      )}
    </div>
  );
}