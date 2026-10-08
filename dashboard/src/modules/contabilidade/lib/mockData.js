/** Labels e variantes do módulo Contabilidade */

export const accountTypeLabels = {
  asset: 'Ativo',
  liability: 'Passivo',
  equity: 'Patrimônio Líquido',
  revenue: 'Receita',
  expense: 'Despesa',
}

export const accountTypeVariants = {
  asset: 'default',
  liability: 'secondary',
  equity: 'outline',
  revenue: 'default',
  expense: 'destructive',
}

export const entryStatusLabels = {
  draft: 'Rascunho',
  posted: 'Lançado',
  cancelled: 'Cancelado',
}

export const entryStatusVariants = {
  draft: 'secondary',
  posted: 'default',
  cancelled: 'destructive',
}

export const nfeStatusLabels = {
  draft: 'Rascunho',
  issued: 'Emitida',
  cancelled: 'Cancelada',
}

export const nfeStatusVariants = {
  draft: 'secondary',
  issued: 'default',
  cancelled: 'destructive',
}

export const obligationTypeLabels = {
  federal: 'Federal',
  state: 'Estadual',
  municipal: 'Municipal',
}

export const obligationStatusLabels = {
  pending: 'Pendente',
  done: 'Concluída',
  overdue: 'Vencida',
}

export const obligationStatusVariants = {
  pending: 'secondary',
  done: 'default',
  overdue: 'destructive',
}
