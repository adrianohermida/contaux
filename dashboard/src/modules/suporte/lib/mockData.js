/** Labels e variantes do módulo Suporte */

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
