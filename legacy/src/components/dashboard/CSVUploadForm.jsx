import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CSVUploadForm({ tenantId, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Arquivo maior que 5MB' });
      return;
    }

    setUploading(true);
    setStatus(null);
    try {
      setProgress('Enviando arquivo...');
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      
      setProgress('Processando dados...');
      const schema = await base44.entities.JournalEntry.schema();
      const extractRes = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: uploadRes.file_url,
        json_schema: {
          type: 'object',
          properties: {
            entries: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entry_date: { type: 'string' },
                  description: { type: 'string' },
                  line_items: { type: 'array' }
                }
              }
            }
          }
        }
      });

      if (extractRes.status === 'error') {
        setStatus({ type: 'error', message: `Erro ao processar: ${extractRes.details}` });
        setUploading(false);
        return;
      }

      setProgress(`Importando ${extractRes.output.entries?.length || 0} lançamentos...`);
      const entries = extractRes.output.entries?.map(e => ({
        ...e,
        tenant_id: tenantId,
        client_id: 'default',
        is_posted: false
      })) || [];

      if (entries.length > 0) {
        await base44.entities.JournalEntry.bulkCreate(entries);
      }

      setStatus({ type: 'success', message: `Importados ${entries.length} lançamentos com sucesso` });
      onSuccess?.();
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Erro ao importar' });
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <label className="block">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-900 font-semibold mb-1">Arrastar arquivo aqui</p>
          <p className="text-slate-500 text-sm">ou clique para selecionar um arquivo CSV</p>
          <p className="text-slate-400 text-xs mt-2">Máximo 5MB - Formato CSV</p>
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {uploading && (
        <div className="mt-4 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="text-sm text-slate-600">{progress}</p>
        </div>
      )}

      {status && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm">{status.message}</p>
        </div>
      )}
    </div>
  );
}