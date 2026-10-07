/** Dados mock do módulo Suporte */

export const ticketPriorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

export const ticketPriorityVariants = {
  low: 'outline',
  medium: 'secondary',
  high: 'default',
  urgent: 'destructive',
}

export const ticketStatusLabels = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
}

export const ticketStatusVariants = {
  open: 'default',
  in_progress: 'secondary',
  resolved: 'default',
  closed: 'outline',
}

export const slaHours = { urgent: 4, high: 8, medium: 24, low: 48 }

export const processStatusLabels = {
  active: 'Ativo',
  suspended: 'Suspenso',
  concluded: 'Concluído',
}

export const processStatusVariants = {
  active: 'default',
  suspended: 'secondary',
  concluded: 'outline',
}

export const mockTickets = [
  {
    id: '1', client_name: 'Tech Solutions LTDA', subject: 'Dúvida sobre guia de ISS',
    description: 'Preciso de esclarecimento sobre o cálculo do ISS do mês de outubro.',
    priority: 'medium', status: 'open', category: 'Fiscal',
    assigned_to: 'Ana Paula', created_date: '2026-10-05',
    messages: [
      { sender: 'client', content: 'Preciso de esclarecimento sobre o cálculo do ISS do mês de outubro.', date: '2026-10-05T10:00:00Z' },
      { sender: 'agent', content: 'Olá! Vamos verificar o cálculo e retornamos em breve.', date: '2026-10-05T11:00:00Z' },
    ],
  },
  {
    id: '2', client_name: 'João Silva Oliveira', subject: 'Erro na declaração do IRPF',
    description: 'Identifiquei um erro na minha declaração e preciso de correção urgente.',
    priority: 'urgent', status: 'in_progress', category: 'Pessoal',
    assigned_to: 'Carlos Eduardo', created_date: '2026-10-06',
    messages: [
      { sender: 'client', content: 'Identifiquei um erro na minha declaração e preciso de correção urgente.', date: '2026-10-06T14:00:00Z' },
    ],
  },
  {
    id: '3', client_name: 'Comércio Beta ME', subject: 'Solicitação de relatório gerencial',
    description: 'Gostaria de um relatório de fluxo de caixa do trimestre.',
    priority: 'low', status: 'resolved', category: 'Gerencial',
    assigned_to: 'Ana Paula', created_date: '2026-09-28',
    messages: [
      { sender: 'client', content: 'Gostaria de um relatório de fluxo de caixa do trimestre.', date: '2026-09-28T09:00:00Z' },
      { sender: 'agent', content: 'Relatório enviado por email!', date: '2026-09-29T10:00:00Z' },
    ],
  },
  {
    id: '4', client_name: 'Indústria Gamma S/A', subject: 'Dúvida sobre SPED',
    description: 'Como funciona a entrega do SPED neste mês?',
    priority: 'high', status: 'open', category: 'Fiscal',
    assigned_to: '', created_date: '2026-10-07',
    messages: [],
  },
]

export const mockProcesses = [
  {
    id: '1', client_name: 'Comércio Beta ME', process_number: '1001234-56.2026.8.26.0100',
    court: '1ª Vara Cível - Manaus/AM', subject: 'Cobrança indevida',
    status: 'active', start_date: '2026-08-15', lawyer: 'Dr. Roberto Lima',
    value: 25000, notes: 'Audiência marcada para 20/11/2026.',
  },
  {
    id: '2', client_name: 'Tech Solutions LTDA', process_number: '0805678-90.2025.8.26.0100',
    court: 'Vara do Trabalho - Manaus/AM', subject: 'Reclamação trabalhista',
    status: 'active', start_date: '2025-11-10', lawyer: 'Dra. Fernanda Souza',
    value: 45000, notes: 'Aguardando perícia técnica.',
  },
  {
    id: '3', client_name: 'João Silva Oliveira', process_number: '0701234-12.2024.8.26.0100',
    court: '2ª Vara Cível - Manaus/AM', subject: 'Divórcio consensual',
    status: 'concluded', start_date: '2024-03-01', lawyer: 'Dr. Roberto Lima',
    value: 0, notes: 'Sentença homologada. Caso encerrado.',
  },
]
