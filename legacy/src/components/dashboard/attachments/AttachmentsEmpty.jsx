import React from 'react';
import { Paperclip, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AttachmentsEmpty({ onUpload }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Paperclip className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
          Nenhum arquivo anexado
        </p>
        <Button onClick={onUpload} variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Upload primeiro arquivo
        </Button>
      </CardContent>
    </Card>
  );
}