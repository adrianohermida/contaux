import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Wand2, Loader, Image as ImageIcon } from 'lucide-react';

export default function ImageGenerator({ blogTitle, keywords, onImageGenerated }) {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  const generateImage = async () => {
    if (!prompt && !blogTitle) {
      alert('Forneça um título ou descrição para gerar a imagem');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateBlogImage', {
        title: blogTitle || prompt,
        keywords: keywords || []
      });

      if (response.data.url) {
        onImageGenerated(response.data.url);
        alert('Imagem gerada com sucesso!');
      }
    } catch (error) {
      alert('Erro ao gerar imagem: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Gerador de Imagem com IA</h3>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Descrição da Imagem (opcional)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descreva a imagem que deseja... ou deixe em branco para usar o título do blog"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
        />
      </div>

      <Button
        onClick={generateImage}
        disabled={loading}
        className="w-full gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Gerando imagem...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Gerar Imagem com IA
          </>
        )}
      </Button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <p className="text-xs text-blue-800">
          💡 <strong>Dica:</strong> Descreva cenários visuais específicos para melhores resultados (ex: "escritório moderno com gráficos", "pessoa trabalhando em laptop")
        </p>
      </div>

      <p className="text-xs text-slate-500 text-center mt-2">
        A imagem será gerada automaticamente com base no título e palavras-chave do seu blog
      </p>
    </div>
  );
}