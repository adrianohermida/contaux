import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdvancedAnalytics({ workspaceId }) {
  const [analysisType, setAnalysisType] = useState('trend');
  const [analyticsData, setAnalyticsData] = useState(null);

  const { data: baseData, isLoading: baseLoading } = useQuery({
    queryKey: ['base-analytics', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      try {
        const [invoices, payments] = await Promise.all([
          base44.entities.Invoice.filter({ tenant_id: workspaceId }),
          base44.entities.Payment.filter({ tenant_id: workspaceId })
        ]);

        // Calculate monthly data for trend analysis
        const monthlyData = {};
        invoices.forEach(inv => {
          const month = new Date(inv.created_date).toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
          monthlyData[month] = (monthlyData[month] || 0) + (inv.total_amount || 0);
        });

        return {
          invoices,
          payments,
          monthlyData: Object.entries(monthlyData).map(([month, value]) => ({ month, value }))
        };
      } catch (err) {
        console.error('Error loading analytics data:', err);
        return null;
      }
    },
    enabled: !!workspaceId
  });

  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      if (!baseData) throw new Error('Dados não carregados');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this financial data and provide insights:
        - Monthly revenue trend: ${JSON.stringify(baseData.monthlyData)}
        - Total invoices: ${baseData.invoices.length}
        - Total payments: ${baseData.payments.length}
        
        Provide: 1) trend analysis, 2) anomalies detected, 3) forecast for next 3 months, 4) recommendations`,
        response_json_schema: {
          type: 'object',
          properties: {
            trend: { type: 'string' },
            anomalies: { type: 'array', items: { type: 'string' } },
            forecast: { type: 'array', items: { type: 'object' } },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      return response.data;
    },
    onSuccess: (data) => {
      setAnalyticsData(data);
      toast.success('Análise concluída!');
    },
    onError: () => {
      toast.error('Erro ao analisar padrões');
    }
  });

  if (baseLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Análises Avançadas com ML
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={analysisType === 'trend' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('trend')}
              size="sm"
            >
              Tendências
            </Button>
            <Button
              variant={analysisType === 'anomaly' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('anomaly')}
              size="sm"
            >
              Anomalias
            </Button>
            <Button
              variant={analysisType === 'forecast' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('forecast')}
              size="sm"
            >
              Previsão
            </Button>
          </div>

          <Button
            onClick={() => analyzePatternsMutation.mutate()}
            disabled={analyzePatternsMutation.isPending}
            className="w-full gap-2"
          >
            {analyzePatternsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Executar Análise
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Revenue Trend Chart */}
      {baseData?.monthlyData && (
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={baseData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Area type="monotone" dataKey="value" fill="#3b82f6" stroke="#1e40af" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analyticsData && (
        <div className="space-y-4">
          {/* Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Análise de Tendência</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{analyticsData.trend}</p>
            </CardContent>
          </Card>

          {/* Anomalies */}
          {analyticsData.anomalies?.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                  Anomalias Detectadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analyticsData.anomalies.map((anomaly, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-amber-600">•</span>
                      {anomaly}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analyticsData.recommendations?.length > 0 && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-sm text-green-700">Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analyticsData.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-green-600">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}