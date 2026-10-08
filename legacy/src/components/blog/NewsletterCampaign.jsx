import React, { useState } from 'react';
import { Mail, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function NewsletterCampaign({ blogPostId, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendNewsletter = async () => {
    if (!blogPostId) return;
    
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('sendNewsletterPost', { blogPostId });
      setResult(response.data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao enviar newsletter:', error);
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Enviar Newsletter</h3>
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Notifique todos os seus subscribers sobre este novo artigo
      </p>

      <Button
        onClick={handleSendNewsletter}
        disabled={isLoading}
        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Enviar para Subscribers
          </>
        )}
      </Button>

      {result && (
        <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg text-sm">
          {result.error ? (
            <p className="text-red-600 dark:text-red-400">Erro: {result.error}</p>
          ) : (
            <>
              <p className="text-green-600 dark:text-green-400">✓ Newsletter enviada!</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Enviado para {result.sent} de {result.total} subscribers
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}