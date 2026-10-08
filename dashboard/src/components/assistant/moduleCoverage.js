/**
 * Matriz de cobertura por módulo (AC-GLOBAL-03).
 * Mapeia cada módulo da aplicação para sugestões contextuais e capacidades
 * disponíveis no assistente. As sugestões são prompts pré-definidos que o
 * usuário pode clicar para iniciar uma conversa relevante ao módulo atual.
 *
 * Estrutura por módulo:
 * - suggestions: prompts clicáveis exibidos no painel vazio
 * - capabilities: lista de capacidades que o assistente oferece neste módulo
 */
export const MODULE_COVERAGE = {
  '/dashboard': {
    suggestions: [
      { id: 'dash-overview', label: 'Resumo do dia', description: 'Quais tarefas e pendências tenho hoje?', prompt: 'Quais tarefas e pendências tenho para hoje?' },
      { id: 'dash-alerts', label: 'Alertas ativos', description: 'Mostrar alertas e obrigações vencendo', prompt: 'Quais obrigações estão vencendo esta semana?' },
    ],
    capabilities: ['Estatísticas', 'Atalhos', 'Alertas'],
  },
  '/inbox': {
    suggestions: [
      { id: 'inbox-unread', label: 'Emails não lidos', description: 'Quantos emails não lidos tenho?', prompt: 'Quantos emails não lidos tenho na caixa de entrada?' },
      { id: 'inbox-urgent', label: 'Emails urgentes', description: 'Identificar emails que precisam resposta', prompt: 'Quais emails precisam de resposta urgente?' },
    ],
    capabilities: ['Caixa de entrada', 'Composição', 'Filtros'],
  },
  '/crm': {
    suggestions: [
      { id: 'crm-clients', label: 'Clientes ativos', description: 'Listar clientes ativos e status', prompt: 'Quantos clientes ativos tenho e qual o status de cada um?' },
      { id: 'crm-followup', label: 'Follow-up pendente', description: 'Contatos que precisam retorno', prompt: 'Quais contatos precisam de follow-up?' },
    ],
    capabilities: ['Clientes', 'Contatos', 'Atividades', 'Notas'],
  },
  '/financeiro': {
    suggestions: [
      { id: 'fin-overdue', label: 'Faturas vencidas', description: 'Quais faturas estão em atraso?', prompt: 'Quais faturas estão vencidas e há quanto tempo?' },
      { id: 'fin-revenue', label: 'Receita do mês', description: 'Resumo financeiro do período', prompt: 'Qual a receita e despesa do mês atual?' },
    ],
    capabilities: ['Faturas', 'Orçamentos', 'Pagamentos'],
  },
  '/contabilidade': {
    suggestions: [
      { id: 'cont-obligations', label: 'Obrigações do mês', description: 'Obrigações contábeis pendentes', prompt: 'Quais obrigações contábeis preciso entregar este mês?' },
      { id: 'cont-journal', label: 'Lançamentos recentes', description: 'Resumo dos últimos lançamentos', prompt: 'Quais foram os últimos lançamentos contábeis?' },
    ],
    capabilities: ['Plano de contas', 'Lançamentos', 'Notas fiscais', 'Calendário'],
  },
  '/suporte': {
    suggestions: [
      { id: 'sup-open', label: 'Tickets abertos', description: 'Tickets que precisam atenção', prompt: 'Quais tickets de suporte estão abertos e qual a prioridade?' },
      { id: 'sup-processes', label: 'Processos ativos', description: 'Processos em andamento', prompt: 'Quais processos estão em andamento e o status?' },
    ],
    capabilities: ['Tickets', 'Processos'],
  },
  '/marketing': {
    suggestions: [
      { id: 'mkt-campaigns', label: 'Campanhas ativas', description: 'Performance das campanhas', prompt: 'Quais campanhas de marketing estão ativas e qual o desempenho?' },
      { id: 'mkt-blog', label: 'Posts do blog', description: 'Conteúdo publicado recentemente', prompt: 'Quais posts do blog foram publicados recentemente?' },
    ],
    capabilities: ['Campanhas', 'Blog', 'Fidelidade'],
  },
  '/conhecimento': {
    suggestions: [
      { id: 'kb-search', label: 'Buscar norma', description: 'Encontrar NBC ou legislação específica', prompt: 'Buscar normas sobre NBC TG estruturas conceituais' },
      { id: 'kb-recent', label: 'Itens recentes', description: 'O que foi adicionado à base', prompt: 'Quais itens foram adicionados recentemente à base de conhecimento?' },
    ],
    capabilities: ['Artigos', 'Legislação', 'Livros/PDFs', 'FAQs', 'Sincronização CFC'],
  },
  '/tarefas': {
    suggestions: [
      { id: 'task-pending', label: 'Tarefas pendentes', description: 'Minhas tarefas em aberto', prompt: 'Quais tarefas estão atribuídas a mim e pendentes?' },
      { id: 'task-overdue', label: 'Tarefas atrasadas', description: 'Tarefas que passaram do prazo', prompt: 'Quais tarefas estão atrasadas?' },
    ],
    capabilities: ['Tarefas', 'Atribuições', 'Prazos'],
  },
  '/admin': {
    suggestions: [
      { id: 'admin-users', label: 'Gestão de usuários', description: 'Usuários e permissões', prompt: 'Quantos usuários ativos existem e quais os papéis?' },
      { id: 'admin-audit', label: 'Auditoria recente', description: 'Atividades registradas no sistema', prompt: 'Quais foram as atividades mais recentes no log de auditoria?' },
    ],
    capabilities: ['Usuários', 'Tenants', 'Segurança', 'Auditoria', 'Automações'],
  },
  '/importar': {
    suggestions: [
      { id: 'imp-guide', label: 'Como importar', description: 'Passos para importar dados', prompt: 'Como faço para importar dados em massa?' },
    ],
    capabilities: ['Importação CSV', 'Mapeamento'],
  },
}

/** Sugestões genéricas (fallback quando o módulo não tem cobertura específica) */
export const DEFAULT_SUGGESTIONS = [
  { id: 'default-help', label: 'Como posso ajudar?', description: 'Pergunte sobre legislação, normas contábeis ou operações do sistema', prompt: 'Como você pode me ajudar?' },
  { id: 'default-search', label: 'Buscar na base', description: 'Consultar a base de conhecimento', prompt: 'Buscar informações sobre tributação' },
]

/**
 * Retorna as sugestões contextuais para o módulo atual.
 * @param {string} pathname - Rota atual
 * @returns {{ suggestions: array, capabilities: array }}
 */
export function getModuleCoverage(pathname) {
  // Tenta match exato primeiro
  if (MODULE_COVERAGE[pathname]) return MODULE_COVERAGE[pathname]

  // Tenta match por prefixo (sub-rotas)
  const sortedKeys = Object.keys(MODULE_COVERAGE).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    if (pathname.startsWith(key)) return MODULE_COVERAGE[key]
  }

  return { suggestions: DEFAULT_SUGGESTIONS, capabilities: [] }
}
