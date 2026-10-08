/** Labels e variantes do módulo Financeiro */

export const invoiceStatusLabels = {
  draft: 'Rascunho',
  sent: 'Enviada',
  paid: 'Paga',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
}

export const invoiceStatusVariants = {
  draft: 'secondary',
  sent: 'default',
  paid: 'default',
  overdue: 'destructive',
  cancelled: 'outline',
}

export const quoteStatusLabels = {
  draft: 'Rascunho',
  sent: 'Enviada',
  accepted: 'Aceita',
  rejected: 'Rejeitada',
  expired: 'Expirada',
}

export const quoteStatusVariants = {
  draft: 'secondary',
  sent: 'default',
  accepted: 'default',
  rejected: 'destructive',
  expired: 'outline',
}

export const paymentMethodLabels = {
  pix: 'PIX',
  boleto: 'Boleto',
  transfer: 'Transferência',
  cash: 'Dinheiro',
  card: 'Cartão',
}

export const paymentStatusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  rejected: 'Rejeitado',
}

export const paymentStatusVariants = {
  pending: 'secondary',
  confirmed: 'default',
  rejected: 'destructive',
}
