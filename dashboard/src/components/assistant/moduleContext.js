import { NAV_ITEMS } from '@/components/layout/navItems'

// Mapa base rota → nome do módulo (do navItems)
const ROUTE_MODULE_MAP = {}
NAV_ITEMS.forEach((item) => {
  ROUTE_MODULE_MAP[item.path] = item.label
})

// Sub-rotas específicas com nome legível
const SUBROUTE_MAP = {
  '/crm/contatos': 'CRM — Contatos',
  '/financeiro/orcamentos': 'Financeiro — Orçamentos',
  '/financeiro/pagamentos': 'Financeiro — Pagamentos',
  '/contabilidade/lancamentos': 'Contabilidade — Lançamentos',
  '/contabilidade/notas-fiscais': 'Contabilidade — Notas Fiscais',
  '/contabilidade/calendario': 'Contabilidade — Calendário',
  '/suporte/processos': 'Suporte — Processos',
  '/marketing/blog': 'Marketing — Blog',
  '/marketing/fidelidade': 'Marketing — Fidelidade',
  '/admin/seguranca': 'Administração — Segurança',
  '/admin/auditoria': 'Administração — Auditoria',
  '/admin/automacoes': 'Administração — Automações',
  '/admin/documentos': 'Administração — Documentos',
  '/admin/relatorios': 'Administração — Relatórios',
  '/admin/email': 'Administração — E-mail',
  '/admin/parceiros': 'Administração — Parceiros',
}

/** Resolve o nome legível do módulo a partir do pathname. */
export function resolveModule(pathname) {
  return SUBROUTE_MAP[pathname] || ROUTE_MODULE_MAP[pathname] || 'Contaux'
}

/** Demonstrações identificadas — não executam ações reais. */
export const DEMO_SUGGESTIONS = [
  {
    id: 'demo-nav',
    label: 'Navegação contextual',
    description: 'O assistente acompanha o módulo atual e mostra o contexto em uso.',
    prompt: 'Explique como você acompanha o contexto da tela atual',
  },
  {
    id: 'demo-query',
    label: 'Consulta operacional',
    description: 'Demonstração de busca em dados autorizados (sem dados reais).',
    prompt: 'Demonstre uma consulta operacional simulada',
  },
  {
    id: 'demo-task',
    label: 'Acompanhar tarefa',
    description: 'Demonstração de proposta e acompanhamento de tarefa.',
    prompt: 'Demonstre como propõe e acompanha uma tarefa',
  },
]
