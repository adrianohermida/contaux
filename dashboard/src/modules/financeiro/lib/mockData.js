/** Dados mock do módulo Financeiro (substituir por API no futuro) */

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

export const mockInvoices = [
  {
    id: '1', number: 'NF-2024-001', client_name: 'Tech Solutions LTDA',
    issue_date: '2024-09-01', due_date: '2024-09-15',
    items: [{ description: 'Serviços contábeis mensais', quantity: 1, unit_price: 2500 }],
    discount: 0, status: 'paid',
  },
  {
    id: '2', number: 'NF-2024-002', client_name: 'Indústria Gamma S/A',
    issue_date: '2024-09-05', due_date: '2024-09-20',
    items: [{ description: 'Consultoria fiscal', quantity: 10, unit_price: 350 }],
    discount: 500, status: 'sent',
  },
  {
    id: '3', number: 'NF-2024-003', client_name: 'João Silva Oliveira',
    issue_date: '2024-08-20', due_date: '2024-09-05',
    items: [{ description: 'Declaração IRPF', quantity: 1, unit_price: 450 }],
    discount: 0, status: 'overdue',
  },
  {
    id: '4', number: 'NF-2024-004', client_name: 'Comércio Beta ME',
    issue_date: '2024-10-01', due_date: '2024-10-15',
    items: [{ description: 'Setup contábil', quantity: 1, unit_price: 1800 }],
    discount: 0, status: 'draft',
  },
  {
    id: '5', number: 'NF-2024-005', client_name: 'Tech Solutions LTDA',
    issue_date: '2024-10-01', due_date: '2024-10-15',
    items: [{ description: 'Serviços contábeis mensais', quantity: 1, unit_price: 2500 }],
    discount: 0, status: 'sent',
  },
]

export const mockQuotes = [
  {
    id: '1', number: 'ORC-2024-001', client_name: 'Comércio Beta ME',
    issue_date: '2024-09-25', valid_until: '2024-10-25',
    items: [{ description: 'Pacote contábil mensal', quantity: 12, unit_price: 1200 }],
    discount: 0, status: 'sent',
  },
  {
    id: '2', number: 'ORC-2024-002', client_name: 'Indústria Gamma S/A',
    issue_date: '2024-09-10', valid_until: '2024-10-10',
    items: [{ description: 'Auditoria fiscal completa', quantity: 1, unit_price: 15000 }],
    discount: 1000, status: 'accepted',
  },
  {
    id: '3', number: 'ORC-2024-003', client_name: 'João Silva Oliveira',
    issue_date: '2024-08-15', valid_until: '2024-09-15',
    items: [{ description: 'Planejamento tributário', quantity: 1, unit_price: 2000 }],
    discount: 0, status: 'expired',
  },
]

export const mockPayments = [
  {
    id: '1', invoice_number: 'NF-2024-001', client_name: 'Tech Solutions LTDA',
    amount: 2500, payment_date: '2024-09-10', method: 'pix', status: 'confirmed',
    reference: 'PIX-987654',
  },
  {
    id: '2', invoice_number: '', client_name: 'Indústria Gamma S/A',
    amount: 3000, payment_date: '2024-09-18', method: 'transfer', status: 'confirmed',
    reference: 'TED-12345',
  },
  {
    id: '3', invoice_number: 'NF-2024-003', client_name: 'João Silva Oliveira',
    amount: 450, payment_date: '2024-10-05', method: 'boleto', status: 'pending',
    reference: '',
  },
]

export const mockClients = [
  'Tech Solutions LTDA',
  'João Silva Oliveira',
  'Comércio Beta ME',
  'Indústria Gamma S/A',
  'Maria Fernanda Costa',
]
