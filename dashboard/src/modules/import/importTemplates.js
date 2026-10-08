/** Templates de exemplo para importação em massa via JSON */

export const IMPORT_TABS = [
  {
    key: 'clients',
    label: 'Clientes',
    endpoint: '/api/import/clients',
    template: `[
  {
    "name": "Empresa XYZ LTDA",
    "type": "PJ",
    "document": "12.345.678/0001-90",
    "email": "contato@xyz.com.br",
    "phone": "(11) 99999-9999",
    "status": "active",
    "tags": ["Mensal", "Premium"],
    "address": {
      "street": "Rua Exemplo",
      "number": "100",
      "city": "São Paulo",
      "state": "SP",
      "zip": "01000-000"
    },
    "fiscal": {
      "regime_tributario": "Simples Nacional",
      "inscricao_estadual": "123.456.789",
      "inscricao_municipal": "1234567"
    }
  }
]`,
  },
  {
    key: 'invoices',
    label: 'Faturas',
    endpoint: '/api/import/invoices',
    template: `[
  {
    "number": "NF-2026-001",
    "client_name": "Empresa XYZ LTDA",
    "issue_date": "2026-10-01",
    "due_date": "2026-10-15",
    "items": [
      { "description": "Serviços contábeis mensais", "quantity": 1, "unit_price": 2500 }
    ],
    "discount": 0,
    "status": "sent"
  }
]`,
  },
  {
    key: 'payments',
    label: 'Pagamentos',
    endpoint: '/api/import/payments',
    template: `[
  {
    "invoice_number": "NF-2026-001",
    "client_name": "Empresa XYZ LTDA",
    "amount": 2500,
    "payment_date": "2026-10-10",
    "method": "pix",
    "status": "confirmed",
    "reference": "PIX-12345"
  }
]`,
  },
  {
    key: 'accounts',
    label: 'Plano de Contas',
    endpoint: '/api/import/accounts',
    template: `[
  { "code": "1", "name": "Ativo", "type": "asset", "level": 1 },
  { "code": "1.1", "name": "Ativo Circulante", "type": "asset", "level": 2 },
  { "code": "1.1.1", "name": "Caixa", "type": "asset", "level": 3 },
  { "code": "2", "name": "Passivo", "type": "liability", "level": 1 },
  { "code": "3", "name": "Receitas", "type": "revenue", "level": 1 },
  { "code": "4", "name": "Despesas", "type": "expense", "level": 1 }
]`,
  },
  {
    key: 'journal',
    label: 'Lançamentos',
    endpoint: '/api/import/journal-entries',
    template: `[
  {
    "date": "2026-10-01",
    "description": "Recebimento de cliente",
    "reference": "NF-001",
    "status": "posted",
    "lines": [
      { "account_code": "1.1.2", "account_name": "Bancos", "debit": 2500, "credit": 0 },
      { "account_code": "1.1.3", "account_name": "Clientes a Receber", "debit": 0, "credit": 2500 }
    ]
  }
]`,
  },
  {
    key: 'obligations',
    label: 'Obrigações',
    endpoint: '/api/import/obligations',
    template: `[
  {
    "title": "DCTF Outubro",
    "description": "Declaração de Débitos e Créditos Tributários Federais",
    "due_date": "2026-10-15",
    "type": "federal",
    "frequency": "monthly",
    "status": "pending"
  }
]`,
  },
]
