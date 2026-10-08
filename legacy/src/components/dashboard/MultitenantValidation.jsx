/**
 * 📋 CHECKLIST DE VALIDAÇÃO MULTITENANT
 * Todas as entidades do projeto devem estar isoladas por workspace_id
 */

const MULTITENANT_VALIDATION = {
  entidades_criticas: [
    {
      name: 'Client',
      status: '✅ REQUER workspace_id',
      action: 'Adicionar workspace_id obrigatório'
    },
    {
      name: 'Invoice',
      status: '✅ REQUER workspace_id',
      action: 'Validar isolamento em queries'
    },
    {
      name: 'Payment',
      status: '✅ REQUER workspace_id',
      action: 'Implementar RLS'
    },
    {
      name: 'Quote',
      status: '✅ REQUER workspace_id',
      action: 'Validar por workspace'
    },
    {
      name: 'LegalProcess',
      status: '✅ REQUER workspace_id',
      action: 'Adicionar validação'
    },
    {
      name: 'Ticket',
      status: '✅ REQUER workspace_id',
      action: 'Filtrar por workspace'
    },
    {
      name: 'Document',
      status: '⚠️ PRECISA CRIAR',
      action: 'Criar entity com workspace_id'
    },
    {
      name: 'Contract',
      status: '⚠️ PRECISA CRIAR',
      action: 'Criar entity com workspace_id'
    },
    {
      name: 'ChatMessage',
      status: '✅ REQUER workspace_id',
      action: 'Implementar isolamento'
    },
    {
      name: 'BankAccount',
      status: '✅ REQUER workspace_id',
      action: 'Validar ownership'
    },
    {
      name: 'Service',
      status: '✅ REQUER workspace_id',
      action: 'Aplicar isolamento'
    },
    {
      name: 'JournalEntry',
      status: '✅ REQUER workspace_id',
      action: 'Garantir isolamento contábil'
    }
  ],

  regras_rls: {
    internal_users: {
      acesso: ['Dashboard', 'Todos Dados', 'Configurações'],
      restricao: 'Apenas workspace próprio',
      exemplo: 'Admin vê apenas clientes/processos do seu workspace'
    },
    client_users: {
      acesso: ['MeuPainel', 'Documentos Pessoais', 'Dados Próprios'],
      restricao: 'Apenas dados vinculados',
      exemplo: 'Cliente vê apenas faturas dele, não de outros clientes'
    }
  },

  queries_padrao: {
    internal_access: `
      // Obter dados do workspace
      const workspaceData = await base44.entities.Invoice.filter({
        workspace_id: user.workspace_id
      });
    `,
    client_access: `
      // Obter apenas dados do cliente
      const myData = await base44.entities.Invoice.filter({
        workspace_id: user.workspace_id,
        client_id: user.id
      });
    `,
    admin_audit: `
      // SuperAdmin validar isolamento
      const results = await base44.functions.invoke('auditUsers', {
        action: 'validate_isolation'
      });
    `
  },

  rls_policies: {
    policy_1: {
      name: 'RLS_INTERNAL_ALL_DATA',
      condition: "auth.jwt -> 'user_type' = 'internal'",
      access: 'SELECT, INSERT, UPDATE, DELETE',
      workspace_filter: "workspace_id = auth.jwt -> 'workspace_id'"
    },
    policy_2: {
      name: 'RLS_CLIENT_OWN_DATA',
      condition: "auth.jwt -> 'user_type' = 'client'",
      access: 'SELECT, INSERT, UPDATE',
      workspace_filter: "workspace_id = auth.jwt -> 'workspace_id' AND client_id = auth.jwt -> 'sub'"
    },
    policy_3: {
      name: 'RLS_DENY_CROSS_WORKSPACE',
      condition: 'sempre ativo',
      access: 'DENY',
      workspace_filter: "workspace_id != auth.jwt -> 'workspace_id'"
    }
  },

  migracao_plano: [
    {
      fase: 1,
      titulo: 'Adicionar workspace_id',
      tarefas: [
        'Atualizar schema de todas as entidades críticas',
        'Adicionar indices em workspace_id',
        'Migrations para dados existentes'
      ]
    },
    {
      fase: 2,
      titulo: 'Implementar RLS',
      tarefas: [
        'Criar políticas de acesso no banco',
        'Validar isolamento nos testes',
        'Implementar middleware de validação'
      ]
    },
    {
      fase: 3,
      titulo: 'Rotas e Componentes',
      tarefas: [
        'Usar ProtectedInternalRoute no Dashboard',
        'Usar ProtectedClientRoute no MeuPainel',
        'Adicionar workspace_id em todas as queries'
      ]
    },
    {
      fase: 4,
      titulo: 'Auditoria e Monitoramento',
      tarefas: [
        'Executar auditUsers periodicamente',
        'Alertas de anomalias',
        'Dashboard de segurança no SuperAdmin'
      ]
    }
  ]
};

export default MULTITENANT_VALIDATION;