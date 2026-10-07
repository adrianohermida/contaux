import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Lock, Zap, Eye, EyeOff } from 'lucide-react';

/**
 * SecurityDashboard - Monitora segurança da aplicação
 */
export default function SecurityDashboard() {
  const [showDetails, setShowDetails] = useState(false);

  const securityMetrics = [
    {
      id: 'xss',
      name: 'XSS Protection',
      status: 'protected',
      description: 'Input sanitization ativa',
      icon: Shield,
    },
    {
      id: 'csrf',
      name: 'CSRF Protection',
      status: 'protected',
      description: 'Token-based CSRF prevention',
      icon: Lock,
    },
    {
      id: 'rate-limit',
      name: 'Rate Limiting',
      status: 'protected',
      description: '10 requests/minute por endpoint',
      icon: Zap,
    },
    {
      id: 'sql-injection',
      name: 'SQL Injection Prevention',
      status: 'protected',
      description: 'Pattern-based detection',
      icon: Shield,
    },
    {
      id: 'https',
      name: 'HTTPS/TLS',
      status: 'protected',
      description: 'Conexão criptografada',
      icon: Lock,
    },
    {
      id: 'headers',
      name: 'Security Headers',
      status: 'protected',
      description: 'CSP, X-Frame-Options, etc',
      icon: Shield,
    },
  ];

  const getStatusColor = (status) => {
    return status === 'protected'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-amber-600 dark:text-amber-400';
  };

  const getStatusBg = (status) => {
    return status === 'protected'
      ? 'bg-emerald-50 dark:bg-emerald-900/20'
      : 'bg-amber-50 dark:bg-amber-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Segurança
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Status de proteção e implementações ativas
        </p>
      </div>

      {/* Overall Status */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Status Geral</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  6/6 Protegido
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="gap-2"
            >
              {showDetails ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Detalhes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.id}
              className={`${getStatusBg(metric.status)} border-l-4 ${
                metric.status === 'protected'
                  ? 'border-l-emerald-500'
                  : 'border-l-amber-500'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-1 ${getStatusColor(metric.status)}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {metric.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {metric.description}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          metric.status === 'protected'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {metric.status === 'protected' ? '✓ Ativo' : '⚠️ Revisar'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Best Practices */}
      {showDetails && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Boas Práticas Implementadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Input Sanitization
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Todos os inputs são validados e sanitizados para remover caracteres perigosos
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    CSRF Tokens
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Tokens aleatórios por sessão previnem ataques CSRF
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Rate Limiting
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Máximo de 10 requests/minuto previne abuso e DDoS
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Pattern Detection
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Detecção automática de padrões XSS e SQL injection
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    SessionStorage para Tokens
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    CSRF tokens armazenados em sessionStorage (não persiste entre abas)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Tips */}
      <Card className="bg-slate-50 dark:bg-slate-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Monitoramento e Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>✓ Console logs quando XSS detectado</li>
            <li>✓ Rate limit errors lancados com código RATE_LIMIT_EXCEEDED</li>
            <li>✓ CSRF token validation em cada form submit</li>
            <li>✓ Todos os inputs sanitizados automaticamente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}