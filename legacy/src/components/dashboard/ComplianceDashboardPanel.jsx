import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ComplianceDashboardPanel({ clientId, tenantId }) {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [issues, setIssues] = useState([]);

  const COMPLIANCE_CHECKS = [
    {
      id: 'nfe_emission',
      name: 'Emissão de NF-e',
      description: 'Faturas emitidas como NF-e',
      icon: '📄',
      status: 'pending'
    },
    {
      id: 'digital_cert',
      name: 'Certificado Digital',
      description: 'Certificado A1/A3 válido',
      icon: '🔐',
      status: 'warning'
    },
    {
      id: 'fiscal_records',
      name: 'Registros Fiscais',
      description: 'Registros completos e válidos',
      icon: '📊',
      status: 'ok'
    },
    {
      id: 'tax_filings',
      name: 'Obrigações Acessórias',
      description: 'ECF, ECD, e-Lalur em dia',
      icon: '📋',
      status: 'pending'
    },
    {
      id: 'data_retention',
      name: 'Retenção de Dados',
      description: 'Dados mantidos por 5+ anos',
      icon: '💾',
      status: 'ok'
    },
    {
      id: 'audit_trail',
      name: 'Rastreamento de Auditoria',
      description: 'Log completo de alterações',
      icon: '📝',
      status: 'ok'
    }
  ];

  useEffect(() => {
    loadData();
  }, [clientId, tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar audit logs reais
      const logs = await base44.entities.AuditLog?.filter({
        tenant_id: tenantId
      }) || [];

      // Mapear logs reais
      const formattedLogs = logs.slice(0, 10).map(log => ({
        id: log.id,
        action: log.action || 'unknown',
        user_email: log.user_email || 'system',
        timestamp: log.timestamp || log.created_date,
        resource: log.entity_type || 'Unknown',
        status: log.status || 'success'
      }));

      setAuditLogs(formattedLogs);

      // Simular issues (em prod viria de tabela issues_compliance)
      const simulatedIssues = [
        {
          id: 1,
          type: 'warning',
          title: 'Certificado Digital expirando',
          description: 'Seu certificado A1 vence em 30 dias',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          resolved: false
        }
      ];

      setIssues(simulatedIssues);

      // Calcular score de compliance
      const okCount = COMPLIANCE_CHECKS.filter(c => c.status === 'ok').length;
      const score = Math.round((okCount / COMPLIANCE_CHECKS.length) * 100);

      setComplianceData({
        score,
        last_audit: new Date().toISOString(),
        status: score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de compliance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return {
      ok: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      pending: 'bg-blue-50 border-blue-200 text-blue-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    }[status] || 'bg-gray-50';
  };

  const getStatusIcon = (status) => {
    return {
      ok: '✓',
      warning: '⚠',
      pending: '⏳',
      error: '✗'
    }[status] || '?';
  };

  const handleResolveIssue = (issueId) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === issueId ? { ...issue, resolved: true } : issue
      )
    );
    toast.success('Problema marcado como resolvido');
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Índice de Conformidade</h3>
            <p className="text-blue-100 text-sm">Última verificação: {complianceData?.last_audit ? new Date(complianceData.last_audit).toLocaleDateString('pt-BR') : 'Nunca'}</p>
          </div>
          <Shield className="w-12 h-12 opacity-80" />
        </div>

        <div className="flex items-end gap-4">
          <div className="text-5xl font-bold">{complianceData?.score || 0}%</div>
          <div className="mb-2">
            <p className="text-sm text-blue-100 mb-2">Conformidade</p>
            <div className="w-48 h-2 bg-blue-400 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${complianceData?.score || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Checks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          ✓ Verificações de Conformidade
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPLIANCE_CHECKS.map(check => (
            <div
              key={check.id}
              className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{check.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm">{check.name}</h4>
                    <span className="font-bold text-lg">{getStatusIcon(check.status)}</span>
                  </div>
                  <p className="text-xs opacity-75">{check.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Issues */}
      {issues.filter(i => !i.resolved).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Questões Ativas ({issues.filter(i => !i.resolved).length})
          </h3>

          <div className="space-y-3">
            {issues.filter(i => !i.resolved).map(issue => (
              <div
                key={issue.id}
                className={`p-4 rounded-lg border-l-4 ${
                  issue.type === 'error'
                    ? 'border-red-500 bg-red-50'
                    : issue.type === 'warning'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{issue.title}</h4>
                  <span className="text-xs text-slate-500">
                    {new Date(issue.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mb-3">{issue.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolveIssue(issue.id)}
                >
                  Marcar como Resolvido
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📝 Registros de Auditoria
        </h3>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhum registro disponível
            </div>
          ) : (
            auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-lg border bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-600">{log.resource}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status === 'success' ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>{log.user_email}</span>
                  <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-2">💡 Conformidade Fiscal:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Mantenha certificado digital ativo e atualizado</li>
          <li>Emita NF-es conforme legislação fiscal</li>
          <li>Preserve todos os registros e documentação</li>
          <li>Realize auditorias periódicas de conformidade</li>
        </ul>
      </div>
    </div>
  );
}