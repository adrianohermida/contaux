import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AttachmentsHeader({ onUpload }) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Arquivos Anexados</h3>
      <Button onClick={onUpload} size="sm" className="gap-2">
        <Upload className="w-4 h-4" />
        Upload Arquivo
      </Button>
    </div>
  );
}