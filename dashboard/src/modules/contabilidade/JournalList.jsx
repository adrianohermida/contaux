import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { entryStatusLabels, entryStatusVariants } from './lib/mockData'
import { formatCurrency } from './lib/format'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Plus, Pencil, CheckCircle, XCircle, FileText } from 'lucide-react'

export default function JournalList({ entries, onNew, onEdit, onPost, onCancel }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = [...entries]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) =>
        e.description.toLowerCase().includes(q) || e.reference.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') result = result.filter((e) => e.status === statusFilter)
    return result
  }, [entries, search, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar lançamento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="posted">Lançado</option>
            <option value="cancelled">Cancelado</option>
          </Select>
          <Button onClick={onNew}><Plus className="h-4 w-4" /> Novo Lançamento</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" /> {filtered.length} lançamento(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Descrição</th>
                  <th className="px-4 py-3 text-left font-medium">Referência</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const total = e.lines.reduce((s, l) => s + (l.debit || 0), 0)
                  return (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">{e.date.split('-').reverse().join('/')}</td>
                      <td className="px-4 py-3 font-medium">{e.description}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.reference}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={entryStatusVariants[e.status]}>{entryStatusLabels[e.status]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {e.status === 'draft' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => onPost(e.id)} aria-label="Lançar">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => onCancel(e.id)} aria-label="Cancelar">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => onEdit(e)} aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((e) => {
              const total = e.lines.reduce((s, l) => s + (l.debit || 0), 0)
              return (
                <div key={e.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{e.description}</p>
                      <p className="text-xs text-muted-foreground">{e.date.split('-').reverse().join('/')} · {e.reference}</p>
                    </div>
                    <Badge variant={entryStatusVariants[e.status]}>{entryStatusLabels[e.status]}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-mono">{formatCurrency(total)}</p>
                  <Button variant="ghost" size="sm" className="mt-1" onClick={() => onEdit(e)}>Editar</Button>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <EmptyState icon={FileText} title="Nenhum lançamento encontrado" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
