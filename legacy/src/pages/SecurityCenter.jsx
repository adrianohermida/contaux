import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMultitenantAuthOptimized } from '../components/auth/useMultitenantAuthOptimized';
import { Shield, Lock, Zap, AlertCircle, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SecurityDashboard from '../components/security/SecurityDashboard';
import { sanitizeInput, isValidEmail, isValidURL } from '../components/security/InputValidator';
import { useCSRFToken } from '../components/security/CSRFProtection';
import { useRateLimit } from '../components/security/RateLimiter';

export default function SecurityCenter() {
  const { workspaceId, loading: authLoading } = useMultitenantAuthOptimized('internal');
  const [activeTab, setActiveTab] = useState('overview');
  const [testInput, setTestInput] = useState('');
  const [inputType, setInputType] = useState('email');
  const { token } = useCSRFToken();
  const { remaining } = useRateLimit();

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['security-audit-logs', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.AuditLog.filter({ tenant_id: workspaceId }, '-created_date', 50);
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Calculate security metrics
  const securityMetrics = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentLogs = auditLogs.filter(log => new Date(log.created_date) >= sevenDaysAgo);
    const failedLogs = recentLogs.filter(log => log.status === 'failed');
    const suspiciousLogs = recentLogs.filter(log => log.action === 'failed_login' || log.action === 'unauthorized_access');

    return {
      totalLogs: auditLogs.length,
      recentEvents: recentLogs.length,
      failedAttempts: failedLogs.length,
      suspiciousActivities: suspiciousLogs.length,
      avgRiskScore: failedLogs.length > 0 ? Math.round((failedLogs.length / recentLogs.length) * 100) : 0
    };
  }, [auditLogs]);

  const validateInput = (value, type) => {
    if (!value) return false;
    switch (type) {
      case 'email': return isValidEmail(value);
      case 'url': return isValidURL(value);
      case 'phone': return /^[0-9+\-() ]{10,}$/.test(value);
      case 'number': return /^-?\d+\.?\d*$/.test(value);
      case 'text': return value.length > 0;
      default: return false;
    }
  };



  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[var(--color-foreground-secondary)]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Centro de Segurança</h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Gerenciar proteções e monitorar ameaças</p>
        </div>
        <Button onClick={() => refetchLogs()} variant="outline" size="sm" className="gap-2" disabled={logsLoading}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--spacing-md)]">
        <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)] border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--color-foreground-secondary)] text-sm">Total de Eventos</p>
              <p className="text-[var(--font-size-3xl)] font-bold mt-[var(--spacing-xs)]">{securityMetrics.totalLogs}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
              </div>
              <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)] border-l-4 border-green-500">
              <div className="flex justify-between items-start">
              <div>
                <p className="text-[var(--color-foreground-secondary)] text-sm">Últimos 7 Dias</p>
                <p className="text-[var(--font-size-3xl)] font-bold mt-[var(--spacing-xs)]">{securityMetrics.recentEvents}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
              </div>
              </div>
              <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)] border-l-4 border-amber-500">
              <div className="flex justify-between items-start">
              <div>
                <p className="text-[var(--color-foreground-secondary)] text-sm">Tentativas Falhas</p>
                <p className="text-[var(--font-size-3xl)] font-bold mt-[var(--spacing-xs)]">{securityMetrics.failedAttempts}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500 opacity-20" />
              </div>
              </div>
              <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)] border-l-4 border-red-500">
              <div className="flex justify-between items-start">
              <div>
                <p className="text-[var(--color-foreground-secondary)] text-sm">Atividades Suspeitas</p>
                <p className="text-[var(--font-size-3xl)] font-bold mt-[var(--spacing-xs)]">{securityMetrics.suspiciousActivities}</p>
            </div>
            <Shield className="w-8 h-8 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-[var(--spacing-sm)]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="csrf" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">CSRF</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Validação</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <SecurityDashboard />
        </TabsContent>

        {/* CSRF Protection */}
        <TabsContent value="csrf" className="mt-6 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Proteção CSRF
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-2">Token CSRF Ativo</p>
                <p className="font-mono text-xs bg-white p-3 rounded border border-blue-300 break-all">
                  {token}
                </p>
              </div>



              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-3">Como funciona?</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>✓ Token único gerado para cada sessão</li>
                  <li>✓ Token incluído automaticamente em requisições POST/PUT/DELETE</li>
                  <li>✓ Validação no servidor protege contra ataques CSRF</li>
                  <li>✓ Token renovável manualmente quando necessário</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Status de Proteção</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                <p className="text-sm text-slate-600">Requisições Permitidas</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{remaining}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-500">
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-lg font-bold mt-1 text-slate-600">
                  Ativo
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-slate-600">Headers Injetados</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">X-CSRF-Token</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Input Validation */}
        <TabsContent value="validation" className="mt-6 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Validador de Entrada
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Validação
                </label>
                <select
                  value={inputType}
                  onChange={(e) => {
                    setInputType(e.target.value);
                    setTestInput('');
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="number">Número</option>
                  <option value="phone">Telefone</option>
                  <option value="text">Texto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teste de Entrada
                </label>
                <input
                   type="text"
                   value={testInput}
                   onChange={(e) => setTestInput(e.target.value)}
                   placeholder={`Digite um ${inputType}...`}
                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
              </div>

              {testInput && (
                <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Original</p>
                    <p className="font-mono text-xs bg-white p-2 rounded border border-slate-300 break-all">
                      {testInput}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Sanitizado</p>
                    <p className="font-mono text-xs bg-white p-2 rounded border border-slate-300 break-all">
                      {sanitizeInput(testInput, inputType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Válido?</p>
                    <p className={`text-sm font-medium ${validateInput(testInput, inputType) ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {validateInput(testInput, inputType) ? '✓ Válido' : '✗ Inválido'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Proteções Ativas</h3>
            <div className="space-y-3">
              {[
                { name: 'XSS Prevention', description: 'Remove scripts e eventos perigosos' },
                { name: 'SQL Injection', description: 'Sanitização de caracteres especiais' },
                { name: 'Input Length', description: 'Limita comprimento máximo' },
                { name: 'Type Validation', description: 'Valida tipo de dado esperado' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="logs" className="mt-6 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Logs de Auditoria
            </h3>

            {logsLoading ? (
              <p className="text-center text-slate-500 py-8">Carregando logs...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Nenhum log de auditoria</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="text-left py-3 px-4">Data</th>
                      <th className="text-left py-3 px-4">Ação</th>
                      <th className="text-left py-3 px-4">Usuário</th>
                      <th className="text-left py-3 px-4">Entidade</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">{new Date(log.created_date).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 px-4 capitalize">{log.action}</td>
                        <td className="py-3 px-4 text-xs">{log.user_email}</td>
                        <td className="py-3 px-4 capitalize">{log.entity_type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.status === 'success' ? 'bg-green-100 text-green-800' :
                            log.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Resumo de Segurança</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Taxa de Tentativas Falhas</p>
                <p className="text-2xl font-bold text-amber-600">{securityMetrics.avgRiskScore}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Últimas 7 Dias</p>
                <p className="text-2xl font-bold text-blue-600">{securityMetrics.recentEvents} eventos</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}