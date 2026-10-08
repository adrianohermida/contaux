import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  paymentMethodLabels,
  paymentStatusLabels,
  paymentStatusVariants,
} from './lib/mockData'
import { formatCurrency, formatDate } from './lib/format'
import { CreditCard, Search, Plus, Check } from 'lucide-react'

export default function PaymentList({ payments, onNew, onConfirm }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...payments]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.client_name.toLowerCase().includes(q) ||
          (p.invoice_number || '').toLowerCase().includes(q) ||
          (p.reference || '').toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter)
    if (methodFilter !== 'all') result = result.filter((p) => p.method === methodFilter)
    result.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
    return result
  }, [payments, search, statusFilter, methodFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, fatura ou referência..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4" /> Registrar Pagamento
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            {Object.entries(paymentStatusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Método</Label>
          <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="w-40">
            <option value="all">Todos</option>
            {Object.entries(paymentMethodLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4" />
            {filtered.length} pagamento(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Fatura</th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 text-left font-medium">Método</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.client_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.invoice_number || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{paymentMethodLabels[p.method]}</td>
                    <td className="px-4 py-3">
                      <Badge variant={paymentStatusVariants[p.status]}>
                        {paymentStatusLabels[p.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {p.status === 'pending' && (
                          <Button variant="ghost" size="sm" onClick={() => onConfirm(p.id)}>
                            <Check className="h-3 w-3" /> Confirmar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{p.client_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.invoice_number || 'Sem fatura'} · {paymentMethodLabels[p.method]}
                    </p>
                  </div>
                  <Badge variant={paymentStatusVariants[p.status]}>
                    {paymentStatusLabels[p.status]}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{formatCurrency(p.amount)}</span>
                  {p.status === 'pending' && (
                    <Button variant="ghost" size="sm" onClick={() => onConfirm(p.id)}>Confirmar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum pagamento encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
