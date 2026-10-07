/** Dados mock do módulo Marketing */

export const campaignStatusLabels = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  running: 'Em Execução',
  completed: 'Concluída',
}

export const campaignStatusVariants = {
  draft: 'secondary',
  scheduled: 'outline',
  running: 'default',
  completed: 'default',
}

export const channelLabels = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  push: 'Push',
}

export const blogStatusLabels = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
}

export const blogStatusVariants = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
}

export const tierLabels = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  diamond: 'Diamante',
}

export const tierVariants = {
  bronze: 'outline',
  silver: 'secondary',
  gold: 'default',
  diamond: 'default',
}

export const mockCampaigns = [
  {
    id: '1', name: 'Campanha IRPF 2026', channel: 'email', audience: 'Todos os clientes PF',
    status: 'completed', start_date: '2026-02-01', end_date: '2026-03-31',
    metrics: { sent: 150, opened: 98, clicked: 45, converted: 22 },
  },
  {
    id: '2', name: 'Promoção Setup Contábil', channel: 'whatsapp', audience: 'Prospects',
    status: 'running', start_date: '2026-10-01', end_date: '2026-10-31',
    metrics: { sent: 80, opened: 72, clicked: 30, converted: 8 },
  },
  {
    id: '3', name: 'Newsletter Mensal - Outubro', channel: 'email', audience: 'Newsletter',
    status: 'scheduled', start_date: '2026-10-15', end_date: '2026-10-15',
    metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 },
  },
  {
    id: '4', name: 'Lembrete DCTF', channel: 'sms', audience: 'Clientes PJ',
    status: 'draft', start_date: '', end_date: '',
    metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 },
  },
]

export const mockBlogPosts = [
  {
    id: '1', title: 'Como declarar investimentos no IRPF 2026', slug: 'como-declarar-investimentos-irpf-2026',
    excerpt: 'Guia completo para declarar rendimentos de investimentos no Imposto de Renda.',
    category: 'Imposto de Renda', author: 'Ana Paula', status: 'published',
    published_date: '2026-02-15', views: 1250,
  },
  {
    id: '2', title: 'Mudanças na tributação de MEIs em 2026', slug: 'mudancas-tributacao-meis-2026',
    excerpt: 'Saiba o que mudou para os Microempreendedores Individuais neste ano.',
    category: 'Tributação', author: 'Carlos Eduardo', status: 'published',
    published_date: '2026-09-20', views: 850,
  },
  {
    id: '3', title: 'Planejamento tributário para o final do ano', slug: 'planejamento-tributario-final-ano',
    excerpt: 'Dicas de planejamento tributário para encerrar o ano com eficiência.',
    category: 'Planejamento', author: 'Ana Paula', status: 'draft',
    published_date: '', views: 0,
  },
]

export const mockLoyaltyPrograms = [
  {
    id: '1', name: 'Programa Contaux Premium', description: 'Pontos por faturas pagas',
    points_per_real: 1, active: true,
    tier_thresholds: [
      { tier: 'bronze', min_points: 0 },
      { tier: 'silver', min_points: 1000 },
      { tier: 'gold', min_points: 5000 },
      { tier: 'diamond', min_points: 15000 },
    ],
    rewards: [
      { id: 'r1', name: 'Desconto de 10% na próxima fatura', points_cost: 500 },
      { id: 'r2', name: 'Consultoria tributária gratuita', points_cost: 3000 },
    ],
  },
]

export const mockCustomerPoints = [
  { id: '1', client_name: 'Tech Solutions LTDA', points_balance: 8500, tier: 'gold', program_id: '1' },
  { id: '2', client_name: 'João Silva Oliveira', points_balance: 1200, tier: 'silver', program_id: '1' },
  { id: '3', client_name: 'Comércio Beta ME', points_balance: 320, tier: 'bronze', program_id: '1' },
  { id: '4', client_name: 'Indústria Gamma S/A', points_balance: 16000, tier: 'diamond', program_id: '1' },
]
