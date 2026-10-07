import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AIRecommendations({ workspaceId }) {
  const queryClient = useQueryClient();
  const [recommendations, setRecommendations] = useState([]);
  const [selectedContext, setSelectedContext] = useState('clients');

  const { data: analysisData } = useQuery({
    queryKey: ['ai-context', workspaceId, selectedContext],
    queryFn: async () => {
      if (!workspaceId) return null;
      try {
        const [clients, invoices, tickets] = await Promise.all([
          base44.entities.Client.filter({ tenant_id: workspaceId }),
          base44.entities.Invoice.filter({ tenant_id: workspaceId }),
          base44.entities.Ticket.filter({ tenant_id: workspaceId })
        ]);
        
        return { clients, invoices, tickets };
      } catch (err) {
        console.error('Error loading analysis data:', err);
        return null;
      }
    },
    enabled: !!workspaceId
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      let contextData = '';
      if (selectedContext === 'clients' && analysisData) {
        contextData = `Total clients: ${analysisData.clients.length}. Active: ${analysisData.clients.filter(c => c.status === 'active').length}.`;
      } else if (selectedContext === 'invoices' && analysisData) {
        const total = analysisData.invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
        const paid = analysisData.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0);
        contextData = `Total invoiced: R$ ${total}. Paid: R$ ${paid}.`;
      } else if (selectedContext === 'tickets' && analysisData) {
        contextData = `Total tickets: ${analysisData.tickets.length}. Open: ${analysisData.tickets.filter(t => t.status === 'open').length}.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this business context: "${contextData}", generate 3 actionable recommendations to improve ${selectedContext} management. Each recommendation should include: title, action, expected benefit, and priority level (high/medium/low).`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  action: { type: 'string' },
                  benefit: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            }
          }
        }
      });

      return response.data.recommendations || [];
    },
    onSuccess: (data) => {
      setRecommendations(data);
      toast.success('Recomendações geradas com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao gerar recomendações');
    }
  });

  return (
    <div className="space-y-6">
      {/* Context Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Recomendações Inteligentes com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Analisar contexto</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'clients', label: 'Clientes' },
                { id: 'invoices', label: 'Faturas' },
                { id: 'tickets', label: 'Tickets' }
              ].map(ctx => (
                <button
                  key={ctx.id}
                  onClick={() => setSelectedContext(ctx.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    selectedContext === ctx.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {ctx.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => generateRecommendationsMutation.mutate()}
            disabled={generateRecommendationsMutation.isPending}
            className="w-full gap-2"
          >
            {generateRecommendationsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Recomendações
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations Display */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-900">{rec.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-1">Ação:</p>
                    <p className="text-sm text-slate-900">{rec.action}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-1">Benefício esperado:</p>
                    <p className="text-sm text-slate-900">{rec.benefit}</p>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      Útil
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <ThumbsDown className="w-4 h-4" />
                      Não útil
                    </Button>
                    <Button size="sm" className="gap-1">
                      <ArrowRight className="w-4 h-4" />
                      Agir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}