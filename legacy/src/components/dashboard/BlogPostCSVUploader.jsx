import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, CheckCircle2, AlertCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogPostCSVUploader({ onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState('');

  const downloadTemplate = () => {
    const template = `title,slug,excerpt,author,category,tags,status,published
Meu Primeiro Post,meu-primeiro-post,Resumo do post,João Silva,tecnologia,"react;javascript",draft,false
Dica de SEO,dica-seo,Melhorando posicionamento,Maria Santos,seo,"seo;marketing",published,true`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-blog-posts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      const extractRes = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: uploadRes.file_url,
        json_schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  excerpt: { type: 'string' },
                  author: { type: 'string' },
                  category: { type: 'string' },
                  tags: { type: 'string' },
                  status: { type: 'string' },
                  published: { type: 'boolean' }
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

      const posts = (extractRes.output?.items || []).map((item) => {
        const tagsArray = typeof item.tags === 'string' 
          ? item.tags.split(';').map(t => t.trim()).filter(Boolean)
          : [];
        
        return {
          title: item.title || 'Sem título',
          slug: item.slug || item.title?.toLowerCase().replace(/\s+/g, '-') || 'post',
          excerpt: item.excerpt || '',
          content: '',
          author: item.author || 'Admin',
          tags: tagsArray,
          status: item.status || 'draft',
          published: item.published === 'true' || item.published === true,
          views: 0,
          seo_score: 0,
          readability_score: 0,
          ai_generated: false
        };
      });

      setProgress(`Importando ${posts.length} publicações...`);

      if (posts.length > 0) {
        await base44.entities.BlogPost.bulkCreate(posts);
      }

      setStatus({ type: 'success', message: `Importados ${posts.length} posts com sucesso` });
      onSuccess?.();
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Erro ao importar' });
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Importar Posts do Blog</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Faça upload de um arquivo CSV com suas publicações</p>
        </div>
        <Button 
          onClick={downloadTemplate}
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <FileDown className="w-4 h-4" />
          Template
        </Button>
      </div>

      <label className="block">
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-900 dark:text-slate-100 font-semibold mb-1">Arrastar arquivo aqui</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">ou clique para selecionar um arquivo CSV</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">Máximo 5MB - Formato CSV</p>
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
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-800 dark:text-blue-200">{progress}</p>
        </div>
      )}

      {status && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm">{status.message}</p>
        </div>
      )}
    </div>
  );
}