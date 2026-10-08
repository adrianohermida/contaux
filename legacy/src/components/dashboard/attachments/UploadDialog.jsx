import React from 'react';
import { Upload, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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

export default function UploadDialog({
  open,
  onClose,
  selectedFile,
  description,
  onDescriptionChange,
  category,
  onCategoryChange,
  uploading,
  onUpload
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Arquivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedFile && (
            <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <File className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-slate-800"
            >
              {FILE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
            <Input
              placeholder="Ex: Contrato de prestação de serviços 2024"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={uploading}>
            Cancelar
          </Button>
          <Button
            onClick={onUpload}
            disabled={!selectedFile || uploading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Fazer Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}