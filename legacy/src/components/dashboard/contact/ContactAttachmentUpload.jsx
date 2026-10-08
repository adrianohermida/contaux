/**
 * Contact Attachment Upload Component
 * Handles file uploads with drag-drop, validation and progress
 */

import React, { useState, useRef } from 'react';
import { Upload, FileIcon, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

const ALLOWED_TYPES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const CATEGORIES = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'certidao', label: 'Certidão' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'outro', label: 'Outro' },
];

export default function ContactAttachmentUpload({ contactId, workspaceId, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('outro');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const validateFile = (file) => {
    // Check size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Arquivo muito grande (máx 50MB). ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return false;
    }

    // Check type
    const ext = getFileExtension(file.name);
    if (!ALLOWED_TYPES.includes(ext)) {
      setError(`Tipo de arquivo não permitido: .${ext}`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleUpload = async (file) => {
    if (!validateFile(file)) return;

    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Upload file using Base44 integration
      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: file,
      });

      if (!uploadResponse || !uploadResponse.file_url) {
        throw new Error('Falha ao fazer upload do arquivo');
      }

      setProgress(50);

      // Create attachment record in database
      const attachment = await base44.entities.ContactAttachment.create({
        workspace_id: workspaceId,
        contact_id: contactId,
        file_url: uploadResponse.file_url,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || `application/${getFileExtension(file.name)}`,
        category: selectedCategory,
        description: '',
      });

      setProgress(100);

      // Reset form
      setTimeout(() => {
        setSelectedCategory('outro');
        setProgress(0);
        setUploading(false);
        onUploadSuccess?.(attachment);
      }, 500);
    } catch (err) {
      setError(err.message || 'Erro ao fazer upload do arquivo');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative p-6 rounded-lg border-2 border-dashed transition-all min-h-[150px] flex flex-col items-center justify-center cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/20 hover:border-slate-400 dark:hover:border-slate-500'
        }`}
        role="region"
        aria-label="Área para arrastar e soltar arquivo"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Enviando... {progress}%
            </p>
            <div className="w-full max-w-xs h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Progresso do upload"
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">
              Arraste o arquivo aqui ou clique para selecionar
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              PDF, DOC, XLS, JPG, PNG, ZIP (máx 50MB)
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept={ALLOWED_TYPES.map(t => `.${t}`).join(',')}
          aria-label="Selecionar arquivo para upload"
          disabled={uploading}
        />
      </div>

      {/* Category Selection */}
      <div>
        <label htmlFor="attachment-category" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
          Categoria
        </label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={uploading}>
          <SelectTrigger id="attachment-category" className="min-h-[44px]" aria-label="Categoria do anexo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3 items-start"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full bg-blue-600 hover:bg-blue-700 min-h-[44px]"
        aria-label="Selecionar arquivo para fazer upload"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            Selecionar Arquivo
          </>
        )}
      </Button>
    </div>
  );
}