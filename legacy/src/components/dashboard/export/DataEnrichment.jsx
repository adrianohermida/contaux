import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function DataEnrichment({ workspaceId }) {
  const [selectedSource, setSelectedSource] = useState('clients');
  const [validationResults, setValidationResults] = useState(null);

  const { data: dataQuality = {} } = useQuery({
    queryKey: ['data-quality', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        const [clients, invoices] = await Promise.all([
          base44.entities.Client.filter({ tenant_id: workspaceId }),
          base44.entities.Invoice.filter({ tenant_id: workspaceId })
        ]);

        return {
          clients_total: clients.length,
          clients_valid_email: clients.filter(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)).length,
          clients_duplicates: clients.length - new Set(clients.map(c => c.email)).size,
          invoices_total: invoices.length,
          invoices_with_client: invoices.filter(i => i.contact_id).length
        };
      } catch (err) {
        console.error('Error loading data quality:', err);
        return {};
      }
    },
    enabled: !!workspaceId
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analise a qualidade dos dados: ${JSON.stringify(dataQuality)}. 
          Identifique:
          1. Problemas de integridade
          2. Duplicatas potenciais
          3. Campos faltando
          4. Dados inconsistentes
          Forneça recomendações de limpeza.`,
          response_json_schema: {
            type: 'object',
            properties: {
              quality_score: { type: 'number' },
              issues: { type: 'array', items: { type: 'string' } },
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return response;
      } catch (err) {
        console.error('Validation error:', err);
        toast.error('Erro ao validar dados');
        throw err;
      }
    },
    onSuccess: (data) => {
      setValidationResults(data);
      toast.success('Validação concluída!');
    }
  });

  const deduplicateMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Com base nos dados: ${JSON.stringify(dataQuality)}, 
          identifique e relatore duplicatas em emails de clientes.
          Retorne uma lista de emails duplicados.`,
          response_json_schema: {
            type: 'object',
            properties: {
              duplicates_found: { type: 'number' },
              duplicate_emails: { type: 'array', items: { type: 'string' } },
              action_taken: { type: 'string' }
            }
          }
        });
        return response;
      } catch (err) {
        console.error('Deduplication error:', err);
        toast.error('Erro ao detectar duplicatas');
        throw err;
      }
    },
    onSuccess: () => {
      toast.success('Deduplicação concluída!');
    }
  });

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Clientes Total</p>
              <p className="text-2xl font-bold">{dataQuality.clients_total || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {dataQuality.clients_valid_email || 0} com email válido
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Duplicatas Detectadas</p>
              <p className="text-2xl font-bold">{dataQuality.clients_duplicates || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Email duplicados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Invoices Ligadas</p>
              <p className="text-2xl font-bold">{dataQuality.invoices_with_client || 0}</p>
              <p className="text-xs text-slate-500 mt-1">de {dataQuality.invoices_total || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation & Enrichment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Enriquecimento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => validateMutation.mutate()}
              disabled={validateMutation.isPending}
              className="flex-1 gap-2"
            >
              {validateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Validar Integridade
                </>
              )}
            </Button>
            <Button
              onClick={() => deduplicateMutation.mutate()}
              disabled={deduplicateMutation.isPending}
              variant="outline"
              className="flex-1 gap-2"
            >
              {deduplicateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Remover Duplicatas
                </>
              )}
            </Button>
          </div>

          {validationResults && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-blue-900">Score de Qualidade</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${validationResults.quality_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">{validationResults.quality_score}%</span>
                </div>
              </div>

              {validationResults.issues && validationResults.issues.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-2">Problemas Identificados</p>
                  <ul className="space-y-1">
                    {validationResults.issues.map((issue, idx) => (
                      <li key={idx} className="text-xs text-blue-700 flex gap-2">
                        <span className="text-red-500">•</span> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResults.recommendations && (
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-2">Recomendações</p>
                  <ul className="space-y-1">
                    {validationResults.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-blue-700 flex gap-2">
                        <span className="text-green-500">✓</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}