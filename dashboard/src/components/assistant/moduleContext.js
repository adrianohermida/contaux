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

// Re-exporta a matriz de cobertura (AC-GLOBAL-03) para compatibilidade
export { getModuleCoverage, DEFAULT_SUGGESTIONS as DEMO_SUGGESTIONS } from './moduleCoverage'
