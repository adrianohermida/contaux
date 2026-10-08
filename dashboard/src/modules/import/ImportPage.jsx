import { useState } from 'react'
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
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

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key)
  const [jsonText, setJsonText] = useState('')
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', message }
  const [loading, setLoading] = useState(false)

  const tab = TABS.find((t) => t.key === activeTab)

  const handleImport = async () => {
    setStatus(null)
    setLoading(true)
    try {
      const data = JSON.parse(jsonText)
      const res = await fetch(tab.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erro na importação')
      setStatus({ type: 'success', message: `${result.imported} registro(s) importado(s) com sucesso!` })
      setJsonText('')
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = () => {
    setJsonText(tab.template)
    setStatus(null)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Importar Dados</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cole os dados em formato JSON no campo abaixo e clique em importar.
          Use o botão "Ver exemplo" para ver o formato esperado.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setJsonText(''); setStatus(null) }}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Template button */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Formato: array JSON de objetos
        </p>
        <button
          onClick={loadTemplate}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver exemplo
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder="[&#10;  { ... }&#10;]"
        className="h-72 w-full rounded-lg border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
      />

      {/* Feedback */}
      {status && (
        <div className={cn(
          'mt-3 flex items-center gap-2 rounded-lg p-3 text-sm',
          status.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400',
        )}>
          {status.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {status.message}
        </div>
      )}

      {/* Action */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleImport}
          disabled={!jsonText.trim() || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          Importar
        </button>
      </div>
    </div>
  )
}
