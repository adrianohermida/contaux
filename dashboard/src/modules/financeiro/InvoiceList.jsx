import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { invoiceStatusLabels, invoiceStatusVariants } from './lib/mockData'
import { formatCurrency, formatDate, calcTotals } from './lib/format'
import { FileText, Search, Plus, Pencil, Ban } from 'lucide-react'

export default function InvoiceList({ invoices, onNew, onEdit, onCancel }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...invoices]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) => i.number.toLowerCase().includes(q) || i.client_name.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter)
    }
    result.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date))
    return result
  }, [invoices, search, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4" /> Nova Fatura
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="all">Todos</option>
            {Object.entries(invoiceStatusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            {filtered.length} fatura(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Número</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Emissão</th>
                  <th className="px-4 py-3 text-left font-medium">Vencimento</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const { total } = calcTotals(inv.items, inv.discount)
                  return (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{inv.number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.client_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.issue_date)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.due_date)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={invoiceStatusVariants[inv.status]}>
                          {invoiceStatusLabels[inv.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onEdit(inv)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                            <Button variant="ghost" size="icon" onClick={() => onCancel(inv.id)}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((inv) => {
              const { total } = calcTotals(inv.items, inv.discount)
              return (
                <div key={inv.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{inv.number}</p>
                      <p className="text-xs text-muted-foreground">{inv.client_name}</p>
                    </div>
                    <Badge variant={invoiceStatusVariants[inv.status]}>
                      {invoiceStatusLabels[inv.status]}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">Venc: {formatDate(inv.due_date)}</span>
                      <span className="ml-2 text-sm font-medium">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(inv)}>Editar</Button>
                      {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                        <Button variant="ghost" size="sm" onClick={() => onCancel(inv.id)}>Cancelar</Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma fatura encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
