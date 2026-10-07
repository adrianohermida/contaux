import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Tag, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function NLPTextAnalysis() {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisType, setAnalysisType] = useState('sentiment');

  const analyzeTextMutation = useMutation({
    mutationFn: async () => {
      if (!inputText.trim()) {
        throw new Error('Digite um texto para análise');
      }

      let prompt = '';
      if (analysisType === 'sentiment') {
        prompt = `Analyze the sentiment of this text and provide: 1) sentiment score (-1 to 1), 2) emotional tone, 3) key sentiment words, 4) summary. Text: "${inputText}"`;
      } else if (analysisType === 'entities') {
        prompt = `Extract entities from this text: people, organizations, locations, dates, values. Text: "${inputText}"`;
      } else if (analysisType === 'keywords') {
        prompt = `Extract top 5 keywords and key phrases from this text. Text: "${inputText}"`;
      } else if (analysisType === 'summary') {
        prompt = `Create a concise summary of this text. Text: "${inputText}"`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            result: { type: 'string' },
            score: { type: 'number' },
            items: { type: 'array', items: { type: 'string' } },
            details: { type: 'object' }
          }
        }
      });

      return response.data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast.success('Análise concluída!');
    },
    onError: (err) => {
      toast.error(err.message || 'Erro na análise');
    }
  });

  const ANALYSIS_TYPES = {
    sentiment: { label: 'Análise de Sentimento', icon: MessageSquare },
    entities: { label: 'Extração de Entidades', icon: Tag },
    keywords: { label: 'Extração de Palavras-chave', icon: TrendingUp },
    summary: { label: 'Resumo', icon: MessageSquare }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Análise de Texto com NLP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analysis Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(ANALYSIS_TYPES).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setAnalysisType(key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  analysisType === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <textarea
            placeholder="Cole o texto que deseja analisar aqui..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-3 py-3 border border-slate-300 rounded-lg text-sm font-mono resize-none"
            rows={6}
          />

          <div className="text-xs text-slate-600">
            {inputText.length} caracteres
          </div>

          <Button
            onClick={() => analyzeTextMutation.mutate()}
            disabled={analyzeTextMutation.isPending || !inputText.trim()}
            className="w-full gap-2"
          >
            {analyzeTextMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Analisar Texto
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {analysisResult && (
        <div className="space-y-4">
          {analysisType === 'sentiment' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sentimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            analysisResult.score > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.abs(analysisResult.score) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold">
                      {analysisResult.score > 0 ? 'Positivo' : analysisResult.score < 0 ? 'Negativo' : 'Neutro'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-3">{analysisResult.result}</p>
                </CardContent>
              </Card>
            </>
          )}

          {analysisType === 'entities' && analysisResult.items && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Entidades Encontradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.items.map((entity, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {entity}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysisType === 'keywords' && analysisResult.items && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Palavras-chave Principais</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {analysisResult.items.map((keyword, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="font-bold text-blue-600 min-w-6">{idx + 1}.</span>
                      <span>{keyword}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {analysisType === 'summary' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">{analysisResult.result}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}