/** Dados mock do módulo Contabilidade */

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

export const mockAccounts = [
  { id: '1', code: '1', name: 'Ativo', type: 'asset', parent_id: null, level: 1, active: true },
  { id: '2', code: '1.1', name: 'Ativo Circulante', type: 'asset', parent_id: '1', level: 2, active: true },
  { id: '3', code: '1.1.1', name: 'Caixa', type: 'asset', parent_id: '2', level: 3, active: true },
  { id: '4', code: '1.1.2', name: 'Bancos', type: 'asset', parent_id: '2', level: 3, active: true },
  { id: '5', code: '1.1.3', name: 'Clientes a Receber', type: 'asset', parent_id: '2', level: 3, active: true },
  { id: '6', code: '2', name: 'Passivo', type: 'liability', parent_id: null, level: 1, active: true },
  { id: '7', code: '2.1', name: 'Passivo Circulante', type: 'liability', parent_id: '6', level: 2, active: true },
  { id: '8', code: '2.1.1', name: 'Fornecedores', type: 'liability', parent_id: '7', level: 3, active: true },
  { id: '9', code: '3', name: 'Receitas', type: 'revenue', parent_id: null, level: 1, active: true },
  { id: '10', code: '3.1', name: 'Receita de Serviços', type: 'revenue', parent_id: '9', level: 2, active: true },
  { id: '11', code: '4', name: 'Despesas', type: 'expense', parent_id: null, level: 1, active: true },
  { id: '12', code: '4.1', name: 'Despesas Operacionais', type: 'expense', parent_id: '11', level: 2, active: true },
  { id: '13', code: '4.1.1', name: 'Salários', type: 'expense', parent_id: '12', level: 3, active: true },
  { id: '14', code: '4.1.2', name: 'Aluguel', type: 'expense', parent_id: '12', level: 3, active: true },
]

export const mockEntries = [
  {
    id: '1', date: '2026-10-01', description: 'Recebimento de cliente - Tech Solutions',
    reference: 'NF-2024-001', status: 'posted',
    lines: [
      { account_code: '1.1.2', account_name: 'Bancos', debit: 2500, credit: 0 },
      { account_code: '1.1.3', account_name: 'Clientes a Receber', debit: 0, credit: 2500 },
    ],
  },
  {
    id: '2', date: '2026-10-02', description: 'Pagamento de aluguel',
    reference: 'DOC-001', status: 'posted',
    lines: [
      { account_code: '4.1.2', account_name: 'Aluguel', debit: 3000, credit: 0 },
      { account_code: '1.1.2', account_name: 'Bancos', debit: 0, credit: 3000 },
    ],
  },
  {
    id: '3', date: '2026-10-03', description: 'Reconhecimento de receita de serviços',
    reference: 'NF-2024-005', status: 'draft',
    lines: [
      { account_code: '1.1.3', account_name: 'Clientes a Receber', debit: 2500, credit: 0 },
      { account_code: '3.1', account_name: 'Receita de Serviços', debit: 0, credit: 2500 },
    ],
  },
]

export const mockTaxInvoices = [
  {
    id: '1', number: 'NFe-001-2026', model: '55', series: '1',
    issue_date: '2026-10-01', client_name: 'Tech Solutions LTDA',
    items: [{ description: 'Serviços contábeis mensais', quantity: 1, unit_price: 2500 }],
    taxes: { icms: 0, pis: 0, cofins: 0, iss: 125, irpj: 0 },
    total: 2500, status: 'issued',
  },
  {
    id: '2', number: 'NFe-002-2026', model: '55', series: '1',
    issue_date: '2026-10-03', client_name: 'Comércio Beta ME',
    items: [{ description: 'Setup contábil', quantity: 1, unit_price: 1800 }],
    taxes: { icms: 0, pis: 0, cofins: 0, iss: 90, irpj: 0 },
    total: 1800, status: 'draft',
  },
]

export const mockObligations = [
  { id: '1', title: 'DCTF Outubro', description: 'Declaração de Débitos e Créditos Tributários Federais', due_date: '2026-10-15', type: 'federal', frequency: 'monthly', status: 'pending' },
  { id: '2', title: 'GPS - INSS', description: 'Guia da Previdência Social', due_date: '2026-10-20', type: 'federal', frequency: 'monthly', status: 'pending' },
  { id: '3', title: 'GIA - ICMS', description: 'Guia de Informação do ICMS', due_date: '2026-10-10', type: 'state', frequency: 'monthly', status: 'overdue' },
  { id: '4', title: 'ISS - Prefeitura', description: 'Guia do Imposto Sobre Serviços', due_date: '2026-10-05', type: 'municipal', frequency: 'monthly', status: 'done' },
  { id: '5', title: 'ECD - Escrituração Contábil Digital', description: 'Entrega anual da ECD', due_date: '2026-12-31', type: 'federal', frequency: 'annual', status: 'pending' },
]
