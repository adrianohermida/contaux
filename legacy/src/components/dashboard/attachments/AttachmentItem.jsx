import React from 'react';
import { Download, Trash2, File, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FILE_CATEGORIES = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'certidao', label: 'Certidão' },
  { value: 'fiscal', label: 'Documento Fiscal' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'outro', label: 'Outro' },
];

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(fileType) {
  if (fileType?.startsWith('image/')) return Image;
  if (fileType?.includes('pdf')) return FileText;
  return File;
}

export default function AttachmentItem({ attachment, onDownload, onDelete }) {
  const Icon = getFileIcon(attachment.file_type);
  const categoryLabel = FILE_CATEGORIES.find(c => c.value === attachment.category)?.label || 'Outro';

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {attachment.file_name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                {categoryLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {formatFileSize(attachment.file_size)} • Enviado em {new Date(attachment.created_date).toLocaleDateString()}
            </p>
            {attachment.description && (
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 break-words">
                {attachment.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              onClick={() => onDownload(attachment)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onDelete(attachment)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}