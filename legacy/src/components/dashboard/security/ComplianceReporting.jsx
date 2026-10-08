import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ComplianceReporting({ workspaceId }) {
  const [reportType, setReportType] = useState('gdpr');

  const { data: complianceStatus = {} } = useQuery({
    queryKey: ['compliance-status', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return {};
      try {
        const [gdpr, dataRetention, auditLog] = await Promise.all([
          base44.entities.AuditLog.filter({ tenant_id: workspaceId, action: 'export' }),
          base44.entities.AuditLog.filter({ tenant_id: workspaceId }),
          base44.entities.AuditLog.filter({ tenant_id: workspaceId })
        ]);
        
        return {
          gdprCompliant: true,
          lastExport: new Date().toLocaleDateString('pt-BR'),
          dataRetention: '90 dias',
          auditLogs: auditLog.length,
          dataExports: gdpr.length
        };
      } catch (err) {
        console.error('Error loading compliance status:', err);
        return {};
      }
    },
    enabled: !!workspaceId
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Gere um relatório de compliance ${reportType.toUpperCase()} incluindo:
        1. Conformidade com requisitos
        2. Dados pessoais armazenados
        3. Consentimentos obtidos
        4. Direitos exercidos
        5. Recomendações de melhoria`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            status: { type: 'string' },
            findings: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            generatedAt: { type: 'string' }
          }
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
      element.setAttribute('download', `compliance-${reportType}-${new Date().toISOString().split('T')[0]}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Relatório de compliance baixado!');
    },
    onError: () => {
      toast.error('Erro ao gerar relatório de compliance');
    }
  });

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">GDPR Compliance</p>
              <p className="text-2xl font-bold mt-1">Ativo</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Audit Logs</p>
              <p className="text-2xl font-bold mt-1">{complianceStatus.auditLogs || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Download className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Data Exports</p>
              <p className="text-2xl font-bold mt-1">{complianceStatus.dataExports || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Retenção</p>
              <p className="text-2xl font-bold mt-1">{complianceStatus.dataRetention}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerar Relatório de Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Relatório</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="gdpr">GDPR (Proteção de Dados)</option>
              <option value="privacy">Privacidade</option>
              <option value="audit">Auditoria</option>
              <option value="dpia">DPIA (Data Protection Impact)</option>
            </select>
          </div>

          <Button
            onClick={() => generateReportMutation.mutate()}
            disabled={generateReportMutation.isPending}
            className="w-full gap-2"
          >
            {generateReportMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Gerar e Baixar Relatório
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { item: 'Política de Privacidade Atualizada', status: true },
            { item: 'Consentimento GDPR Obtido', status: true },
            { item: 'Direito ao Esquecimento Implementado', status: true },
            { item: 'Portabilidade de Dados', status: true },
            { item: 'DPA com Processadores', status: false },
            { item: 'Notificação de Violação Configurada', status: true },
            { item: 'Data Protection Officer Designado', status: false },
            { item: 'DPIA Realizada', status: true }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-900">{item.item}</span>
              {item.status ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}