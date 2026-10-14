/**
 * Adaptador Contaux — implementa as portas canônicas do shell do assistente.
 * PKG-1: cada host fornece seu próprio adaptador; o core não conhece detalhes do host.
 */
import { useAuth } from '@/contexts/AuthContext'
import { request, getAccessToken } from '@/lib/api'
import { NAV_ITEMS } from '@/components/layout/navItems'
import { getModuleCoverage, DEFAULT_SUGGESTIONS } from './moduleCoverage'

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

export const contauxAdapter = {
  // Auth port — hook que retorna o usuário autenticado do host
  useUser: useAuth,

  // API port — cliente HTTP autenticado do host
  request,
  getAccessToken,

  // Module port — resolve rota para nome do módulo
  resolveModule,

  // Coverage port — sugestões contextuais por módulo
  getModuleCoverage,

  // Storage port — prefixo para chaves de localStorage
  storagePrefix: 'contaux-assistant',

  // Brand port — nome para labels de UI
  brandName: 'Contaux',
}
