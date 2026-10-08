import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Dashboard SuperAdmin para gerenciar isolamento multitenant
 * Mostra status de cada módulo
 */
export default function MultitenantChecklist() {
  const modules = [
    {
      name: 'Autenticação',
      status: 'completed',
      items: [
        { name: 'User entity com workspace_id', done: true },
        { name: 'User entity com user_type', done: true },
        { name: 'useMultitenantAuth hook', done: true },
        { name: 'ProtectedInternalRoute', done: true },
        { name: 'ProtectedClientRoute', done: true }
      ]
    },
    {
      name: 'Auditorias',
      status: 'completed',
      items: [
        { name: 'Workspace entity', done: true },
        { name: 'AccessLog entity', done: true },
        { name: 'auditUsers function', done: true },
        { name: 'Validação isolamento', done: true }
      ]
    },
    {
      name: 'Módulo: Dashboard',
      status: 'in_progress',
      items: [
        { name: 'Adicionar workspace_id às queries', done: false },
        { name: 'Usar ProtectedInternalRoute', done: false },
        { name: 'Validar isolamento visual', done: false }
      ]
    },
    {
      name: 'Módulo: Clientes',
      status: 'in_progress',
      items: [
        { name: 'Client entity com workspace_id', done: false },
        { name: 'Filtrar por workspace', done: false },
        { name: 'Audit de acesso', done: false }
      ]
    },
    {
      name: 'Módulo: Processos Legais',
      status: 'pending',
      items: [
        { name: 'LegalProcess com workspace_id', done: false },
        { name: 'Confidencialidade por default', done: false },
        { name: 'Compartilhamento controlado', done: false }
      ]
    },
    {
      name: 'Módulo: Financeiro',
      status: 'pending',
      items: [
        { name: 'Invoice, Payment com workspace_id', done: false },
        { name: 'Isolamento absoluto', done: false },
        { name: 'Reports por workspace', done: false }
      ]
    },
    {
      name: 'Módulo: Documentos',
      status: 'pending',
      items: [
        { name: 'Document entity com workspace_id', done: false },
        { name: 'Compartilhamento seguro', done: false },
        { name: 'Versionamento', done: false }
      ]
    },
    {
      name: 'Módulo: Conversas',
      status: 'pending',
      items: [
        { name: 'ChatMessage com workspace_id', done: false },
        { name: 'Isolamento por conversa', done: false },
        { name: 'Notificações seguras', done: false }
      ]
    },
    {
      name: 'Row Level Security (RLS)',
      status: 'pending',
      items: [
        { name: 'RLS_INTERNAL_ALL_DATA policy', done: false },
        { name: 'RLS_CLIENT_OWN_DATA policy', done: false },
        { name: 'RLS_DENY_CROSS_WORKSPACE policy', done: false }
      ]
    },
    {
      name: 'Monitoramento',
      status: 'pending',
      items: [
        { name: 'Dashboard de auditoria', done: false },
        { name: 'Alertas de anomalia', done: false },
        { name: 'Relatórios de segurança', done: false }
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const stats = {
    total: modules.reduce((acc, m) => acc + m.items.length, 0),
    completed: modules.reduce((acc, m) => acc + m.items.filter(i => i.done).length, 0),
    inProgress: modules.filter(m => m.status === 'in_progress').length,
    pending: modules.filter(m => m.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">🔐 Isolamento Multitenant</h1>
        <p className="text-slate-600 mt-2">Status de implementação do sistema de segurança</p>
      </div>

      {/* Progresso Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600">Progresso Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {Math.round((stats.completed / stats.total) * 100)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{stats.completed} de {stats.total}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-slate-600">✅ Concluído</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{stats.completed}</p>
          <p className="text-xs text-slate-500 mt-1">itens prontos</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-slate-600">🔄 Em Progresso</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
          <p className="text-xs text-slate-500 mt-1">módulos trabalhando</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-slate-600">⏳ Pendente</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">{stats.pending}</p>
          <p className="text-xs text-slate-500 mt-1">próximos sprints</p>
        </Card>
      </div>

      {/* Módulos */}
      <div className="space-y-4">
        {modules.map((module) => (
          <Card key={module.name} className={`p-4 border ${getStatusColor(module.status)}`}>
            <div className="flex items-start gap-3">
              {getStatusIcon(module.status)}
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{module.name}</h3>
                <div className="mt-3 space-y-2">
                  {module.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.done}
                        readOnly
                        className="w-4 h-4"
                      />
                      <span className={item.done ? 'text-green-700 line-through' : 'text-slate-700'}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Próximos Passos */}
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">📌 Próximos Passos</h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal ml-5">
          <li><strong>Hoje:</strong> Usar ProtectedInternalRoute no Dashboard</li>
          <li><strong>Hoje:</strong> Usar ProtectedClientRoute no ClientPortal</li>
          <li><strong>Sprint 7:</strong> Adicionar workspace_id a todas as queries</li>
          <li><strong>Sprint 7:</strong> Implementar RLS no banco</li>
          <li><strong>Sprint 8:</strong> Dashboard SuperAdmin com auditoria</li>
          <li><strong>Sprint 9:</strong> Testes de segurança completos</li>
        </ol>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-2">
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
          🔍 Executar Auditoria
        </Button>
        <Button variant="outline" className="flex-1">
          📋 Ver Documentação
        </Button>
      </div>
    </div>
  );
}