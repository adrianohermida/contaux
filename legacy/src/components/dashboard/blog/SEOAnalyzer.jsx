import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function SEOAnalyzer({ blogData, onAnalysisComplete }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeSEO = async () => {
    if (!blogData.title || !blogData.content) {
      alert('Preencha título e conteúdo antes de analisar SEO');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeSEO', {
        title: blogData.title,
        content: blogData.content,
        seoTitle: blogData.seo_title,
        seoDescription: blogData.seo_description,
        focusKeyword: blogData.focus_keyword,
        keywords: blogData.seo_keywords || []
      });

      setAnalysis(response.data);
      setShowAnalysis(true);
      onAnalysisComplete?.(response.data);
    } catch (error) {
      alert('Erro ao analisar SEO: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-600" />
          Analisador de SEO
        </h3>

        <Button
          onClick={analyzeSEO}
          disabled={loading}
          className="w-full gap-2"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          {loading ? 'Analisando...' : 'Analisar SEO'}
        </Button>
      </div>

      {showAnalysis && analysis && (
        <div className="space-y-6">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`${getScoreBg(analysis.seoScore)} p-4 rounded-lg`}>
              <p className="text-sm text-slate-600 mb-2">Score de SEO</p>
              <p className={`text-3xl font-bold ${getScoreColor(analysis.seoScore)}`}>
                {analysis.seoScore}
              </p>
            </div>

            <div className={`${getScoreBg(analysis.readabilityScore)} p-4 rounded-lg`}>
              <p className="text-sm text-slate-600 mb-2">Legibilidade</p>
              <p className={`text-3xl font-bold ${getScoreColor(analysis.readabilityScore)}`}>
                {analysis.readabilityScore}
              </p>
            </div>
          </div>

          {/* Analysis Checklist */}
          {analysis.analysis && (
            <div className="space-y-2">
              <p className="font-semibold text-slate-900">Análise Detalhada:</p>
              {Object.entries(analysis.analysis).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  {value.includes('✓') || value.includes('Sim') ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                    <p className="text-xs text-slate-600">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-semibold text-blue-900 mb-3">Sugestões de Melhoria:</p>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-blue-800">
                    <span className="font-bold flex-shrink-0">{idx + 1}.</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Google Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="font-semibold text-slate-900 mb-3">Preview no Google:</p>
            <div className="space-y-1">
              <p className="text-blue-600 text-sm hover:underline cursor-pointer">
                {blogData.seo_title || blogData.title}
              </p>
              <p className="text-gray-600 text-xs">
                contaux.com.br › blog › {blogData.slug || 'seu-slug'}
              </p>
              <p className="text-gray-600 text-xs line-clamp-2">
                {blogData.seo_description || 'Adicione uma meta description otimizada...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}