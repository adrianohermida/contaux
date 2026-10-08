/**
 * Predictive Report
 * AI-powered predictions using InvokeLLM
 */

import React, { useState } from 'react';
import { Brain, Loader2, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function PredictiveReport({ metrics, workspaceId }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const prompt = `
        Você é um especialista em CRM e análise de dados.
        Analise as seguintes métricas de um workspace CRM e forneça insights e recomendações:

        Métricas:
        - Total de contatos: ${metrics.totalContacts}
        - Contatos ativos: ${metrics.activeContacts}
        - Novos contatos este mês: ${metrics.newThisMonth}
        - Taxa de crescimento: ${metrics.growthRate}%
        - Oportunidades em aberto: ${metrics.openOpportunities}
        - Valor total em pipeline: R$ ${metrics.pipelineValue}
        - Taxa de conversão: ${metrics.conversionRate}%

        Forneça:
        1. 3 insights principais sobre o estado atual
        2. 3 recomendações de ação imediata
        3. 1 previsão de crescimento para os próximos 30 dias
        
        Seja direto, conciso e focado em ações práticas. Responda em português.
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            insights: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            forecast: { type: 'string' },
          },
        },
      });

      setInsight(result);
    } catch (err) {
      console.error('Predictive report error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Análise Preditiva com IA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Insights baseados nos seus dados
            </p>
          </div>
        </div>
        <Button
          onClick={generateInsights}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2 min-h-[40px]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          )}
          {loading ? 'Analisando...' : insight ? 'Atualizar' : 'Gerar Análise'}
        </Button>
      </div>

      {/* Content */}
      {!insight && !loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Brain className="w-10 h-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Clique em "Gerar Análise" para obter insights personalizados sobre seus dados
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" aria-hidden="true" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Analisando dados com IA...
          </p>
        </div>
      )}

      {insight && !loading && (
        <div className="space-y-4">
          {/* Insights */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-blue-500" aria-hidden="true" />
              Insights Principais
            </h4>
            <ul className="space-y-2">
              {insight.insights?.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-blue-500 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" aria-hidden="true" />
              Recomendações
            </h4>
            <ul className="space-y-2">
              {insight.recommendations?.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-green-500 font-bold shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Forecast */}
          {insight.forecast && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
              <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-wide mb-1">
                Previsão 30 dias
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-300">
                {insight.forecast}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}