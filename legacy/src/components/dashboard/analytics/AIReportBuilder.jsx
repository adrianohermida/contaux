import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AIReportBuilder({ workspaceId }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [generatedReport, setGeneratedReport] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!query.trim()) {
        toast.error('Descreva o relatório que deseja gerar');
        return;
      }

      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Como analista de dados, gere um ${reportType} baseado na seguinte solicitação: "${query}". 
          
          Incluir:
          - Resumo executivo
          - Principais insights
          - Recomendações acionáveis
          - Métricas-chave
          - Próximos passos
          
          Formato: JSON estruturado`,
          add_context_from_internet: false,
          response_json_schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string' },
              insights: { type: 'array', items: { type: 'string' } },
              metrics: { type: 'array', items: { 
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  value: { type: 'string' },
                  trend: { type: 'string' }
                }
              }},
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          }
        });

        return response;
      } catch (err) {
        console.error('Erro ao gerar relatório:', err);
        toast.error('Erro ao gerar relatório com IA');
        throw err;
      }
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('Relatório gerado com sucesso!');
    }
  });

  const saveReportMutation = useMutation({
    mutationFn: async (reportData) => {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return base44.entities.Report.create({
        tenant_id: workspaceId,
        report_name: reportData.title || 'Relatório IA',
        report_type: 'ai_generated',
        description: reportData.summary,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        status: 'published',
        content: JSON.stringify(reportData),
        is_scheduled: false
      });
    },
    onSuccess: () => {
      toast.success('Relatório salvo com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['reports-list', workspaceId] });
      setQuery('');
      setGeneratedReport(null);
    }
  });

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Gerador de Relatórios com IA
          </CardTitle>
          <CardDescription>
            Descreva o relatório que você deseja e a IA criará insights personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Relatório
            </label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumo Executivo</SelectItem>
                <SelectItem value="detailed">Análise Detalhada</SelectItem>
                <SelectItem value="comparative">Análise Comparativa</SelectItem>
                <SelectItem value="forecast">Previsão e Tendências</SelectItem>
                <SelectItem value="risk">Análise de Riscos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descreva o Relatório Desejado
            </label>
            <Textarea
              placeholder="Ex: Gere um relatório sobre a performance de vendas dos últimos 3 meses, incluindo comparação com período anterior..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-24"
            />
          </div>

          <Button 
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !query.trim()}
            className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report */}
      {generatedReport && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900">{generatedReport.title}</CardTitle>
            <CardDescription className="text-purple-700">
              Relatório gerado por IA - {new Date().toLocaleDateString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Resumo Executivo</h4>
              <p className="text-slate-700 leading-relaxed">{generatedReport.summary}</p>
            </div>

            {/* Metrics */}
            {generatedReport.metrics && generatedReport.metrics.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Métricas-Chave</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedReport.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="text-sm text-slate-600">{metric.name}</p>
                      <p className="text-lg font-bold text-purple-600">{metric.value}</p>
                      {metric.trend && (
                        <p className="text-xs text-slate-500 mt-1">Tendência: {metric.trend}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {generatedReport.insights && generatedReport.insights.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Principais Insights</h4>
                <ul className="space-y-2">
                  {generatedReport.insights.map((insight, idx) => (
                    <li key={idx} className="flex gap-2 text-slate-700">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {generatedReport.recommendations && generatedReport.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Recomendações</h4>
                <ul className="space-y-2">
                  {generatedReport.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2 text-slate-700">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-purple-200">
              <Button
                onClick={() => saveReportMutation.mutate(generatedReport)}
                disabled={saveReportMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {saveReportMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Relatório'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedReport(null);
                  setQuery('');
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Novo Relatório
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}