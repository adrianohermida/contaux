import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Loader2 } from 'lucide-react';

/**
 * Revenue Predictor - Prevê receita futura usando ML
 * Análise de tendências históricas + padrões sazonais
 */
export default function RevenuePredictor({ workspaceId, months = 12 }) {
  const [prediction, setPrediction] = useState(null);

  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['revenue-historical', workspaceId],
    queryFn: async () => {
      // Busca dados históricos de invoices
      const invoices = await base44.entities.Invoice.filter({
        workspace_id: workspaceId
      });

      return aggregateByMonth(invoices);
    },
    enabled: !!workspaceId
  });

  // Gerar predição via AI
  useEffect(() => {
    if (!historicalData || historicalData.length === 0) return;

    generatePrediction();
  }, [historicalData, workspaceId]);

  const generatePrediction = async () => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: buildPredictionPrompt(historicalData, months),
        response_json_schema: {
          type: 'object',
          properties: {
            predictions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string' },
                  predicted: { type: 'number' },
                  confidence: { type: 'number' },
                  factors: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            trend: { type: 'string', enum: ['growing', 'stable', 'declining'] },
            seasonality: { type: 'string' },
            insights: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setPrediction(response);
    } catch (error) {
      console.error('Erro ao gerar predição:', error);
    }
  };

  const chartData = combineHistoricalAndPrediction(historicalData, prediction?.predictions);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-lg">Previsão de Receita ({months} meses)</h3>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Gerando previsão...</span>
        </div>
      )}

      {chartData && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              name="Histórico"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#10b981"
              strokeDasharray="5 5"
              name="Previsão"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {prediction && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm mb-2">
              <span className="font-medium">Tendência:</span> {translateTrend(prediction.trend)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Sazonalidade:</span> {prediction.seasonality}
            </p>
          </div>

          {prediction.insights?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Insights</h4>
              <ul className="text-sm text-green-800 space-y-1">
                {prediction.insights.map((insight, i) => (
                  <li key={i}>• {insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function aggregateByMonth(invoices) {
  const months = {};

  invoices.forEach(inv => {
    const date = new Date(inv.issue_date);
    const key = date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });

    months[key] = (months[key] || 0) + (inv.total_amount || 0);
  });

  return Object.entries(months).map(([month, amount]) => ({
    month,
    actual: amount
  }));
}

function combineHistoricalAndPrediction(historical, predictions) {
  if (!predictions) return historical;

  return [
    ...historical,
    ...predictions.map(p => ({
      month: p.month,
      predicted: p.predicted
    }))
  ];
}

function buildPredictionPrompt(historicalData, months) {
  return `Você é um analista financeiro especializado em previsões de receita.

Dados históricos de receita (últimos meses):
${JSON.stringify(historicalData, null, 2)}

Analise estes dados e gere uma previsão realista para os próximos ${months} meses.
Considere: tendências, sazonalidade, padrões de crescimento.

Fornece suas previsões com confiança de cada predição e fatores que a influenciam.`;
}

function translateTrend(trend) {
  const translations = {
    growing: '📈 Crescimento',
    stable: '→ Estável',
    declining: '📉 Declínio'
  };
  return translations[trend] || trend;
}