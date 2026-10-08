import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { nfeStatusLabels, nfeStatusVariants } from './lib/mockData'
import { formatCurrency, formatDate } from './lib/format'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Plus, Pencil, Send, XCircle, Receipt } from 'lucide-react'

export default function TaxInvoiceList({ invoices, onNew, onEdit, onIssue, onCancel }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...invoices]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((i) =>
        i.number.toLowerCase().includes(q) || i.client_name.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') result = result.filter((i) => i.status === statusFilter)
    return result
  }, [invoices, search, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar nota fiscal..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="issued">Emitida</option>
            <option value="cancelled">Cancelada</option>
          </Select>
          <Button onClick={onNew}><Plus className="h-4 w-4" /> Nova NFe</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Receipt className="h-4 w-4" /> {filtered.length} nota(s) fiscal(is)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Número</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Emissão</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{inv.number}</td>
                    <td className="px-4 py-3 font-medium">{inv.client_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.issue_date)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={nfeStatusVariants[inv.status]}>{nfeStatusLabels[inv.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {inv.status === 'draft' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => onIssue(inv.id)} aria-label="Emitir">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onCancel(inv.id)} aria-label="Cancelar">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => onEdit(inv)} aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((inv) => (
              <div key={inv.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs">{inv.number}</p>
                    <p className="font-medium">{inv.client_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(inv.issue_date)}</p>
                  </div>
                  <Badge variant={nfeStatusVariants[inv.status]}>{nfeStatusLabels[inv.status]}</Badge>
                </div>
                <p className="mt-2 font-mono text-sm">{formatCurrency(inv.total)}</p>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <EmptyState icon={Receipt} title="Nenhuma nota fiscal encontrada" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
